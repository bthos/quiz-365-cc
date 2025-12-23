// ===== GAME STATE =====
let gamePin = '';
let gameRef = null;
let players = {};
let currentQuestion = 0;
let timerInterval = null;
let timeLeft = 20;
let questionStartTime = 0;
let answerListener = null;
let previousQuestionIndex = -1;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    createGame();
});

function createGame() {
    // Generate 6-digit PIN
    gamePin = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create game in Firebase
    gameRef = database.ref('games/' + gamePin);
    
    gameRef.set({
        status: 'waiting',
        currentQuestion: 0,
        questions: QUESTIONS,
        createdAt: Date.now()
    });
    
    // Display PIN
    document.getElementById('pinCode').textContent = gamePin;
    document.getElementById('gameUrl').textContent = window.location.host + '/play.html';
    
    // Listen for players
    gameRef.child('players').on('value', (snapshot) => {
        players = snapshot.val() || {};
        updatePlayersDisplay();
    });
    
    // Cleanup on close
    window.addEventListener('beforeunload', () => {
        if (gameRef) {
            gameRef.remove();
        }
    });
}

function updatePlayersDisplay() {
    const grid = document.getElementById('playersGrid');
    const count = Object.keys(players).length;
    
    document.getElementById('playerCount').textContent = count;
    document.getElementById('totalPlayers').textContent = count;
    
    grid.innerHTML = '';
    Object.values(players).forEach(player => {
        const chip = document.createElement('div');
        chip.className = 'player-chip';
        chip.textContent = player.name;
        grid.appendChild(chip);
    });
    
    // Enable start button if at least 1 player
    const startBtn = document.getElementById('startBtn');
    const hint = document.getElementById('startHint');
    
    if (count >= 1) {
        startBtn.disabled = false;
        hint.textContent = `${count} player(s) ready!`;
    } else {
        startBtn.disabled = true;
        hint.textContent = 'Waiting for players...';
    }
}

// ===== GAME FLOW =====
function startGame() {
    gameRef.update({
        status: 'playing',
        currentQuestion: 0
    });
    
    showScreen('questionScreen');
    showQuestion();
}

function showQuestion() {
    const q = QUESTIONS[currentQuestion];
    
    document.getElementById('currentQ').textContent = currentQuestion + 1;
    document.getElementById('totalQ').textContent = QUESTIONS.length;
    document.getElementById('questionText').textContent = q.question;
    
    // Set answers
    q.answers.forEach((answer, i) => {
        document.getElementById('answer' + i).textContent = answer;
        document.getElementById('count' + i).textContent = '0';
    });
    
    // Reset answer cards
    document.querySelectorAll('.answer-card').forEach(card => {
        card.classList.remove('correct', 'wrong');
    });
    
    // Update Firebase
    gameRef.update({
        currentQuestion: currentQuestion,
        questionStartTime: Date.now(),
        status: 'question'
    });
    
    // Remove previous answer listener if it exists (use previousQuestionIndex)
    if (answerListener && previousQuestionIndex >= 0) {
        gameRef.child('answers/' + previousQuestionIndex).off('value', answerListener);
        answerListener = null;
    }
    
    // Clear previous answers and set up new listener after removal completes
    gameRef.child('answers/' + currentQuestion).remove().then(() => {
        // Listen for answers - set up listener after removal completes
        answerListener = (snapshot) => {
            const answers = snapshot.val();
            // Only process if answers exist and is an object (not null from removal)
            if (answers && typeof answers === 'object') {
                updateAnswerCounts(answers);
            } else {
                // Reset counts to 0 if no answers
                updateAnswerCounts({});
            }
        };
        gameRef.child('answers/' + currentQuestion).on('value', answerListener);
    }).catch((error) => {
        console.error('Error removing answers:', error);
        // Set up listener anyway
        answerListener = (snapshot) => {
            const answers = snapshot.val();
            if (answers && typeof answers === 'object') {
                updateAnswerCounts(answers);
            } else {
                updateAnswerCounts({});
            }
        };
        gameRef.child('answers/' + currentQuestion).on('value', answerListener);
    });
    
    // Store current question index for next cleanup
    previousQuestionIndex = currentQuestion;
    
    // Ensure timer is fully stopped and reset before showing question
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    timeLeft = 20;
    
    showScreen('questionScreen');
    
    // Small delay before starting timer to ensure Firebase syncs and players see the question
    setTimeout(() => {
        startTimer();
    }, 500);
}

function startTimer() {
    // Clear any existing timer interval to prevent multiple timers running
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    // Ensure timeLeft is properly reset - double check it's positive
    timeLeft = 20;
    questionStartTime = Date.now();
    
    // Verify timer elements exist
    const timerTextEl = document.getElementById('timerText');
    const timerFillEl = document.getElementById('timerFill');
    if (!timerTextEl || !timerFillEl) {
        console.error('Timer elements not found');
        return;
    }
    
    // Reset timer warning class
    timerTextEl.classList.remove('warning');
    
    // Update display immediately to show correct initial value
    updateTimerDisplay();
    
    // Guard: Ensure timeLeft is positive before starting
    if (timeLeft <= 0) {
        console.error('Timer timeLeft is invalid:', timeLeft);
        timeLeft = 20; // Force reset
        updateTimerDisplay();
    }
    
    // Start the timer interval
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        updateTimerDisplay();
        
        if (timeLeft <= 5) {
            timerTextEl.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            showReveal();
        }
    }, 100);
}

function updateTimerDisplay() {
    const percentage = (timeLeft / 20) * 100;
    document.getElementById('timerFill').style.width = percentage + '%';
    document.getElementById('timerText').textContent = Math.ceil(timeLeft);
}

function updateAnswerCounts(answers) {
    // Guard: Don't process if answers is null or invalid
    if (!answers || typeof answers !== 'object') {
        return;
    }
    
    const counts = [0, 0, 0, 0];
    Object.values(answers).forEach(a => {
        if (a && a.answer >= 0 && a.answer <= 3) {
            counts[a.answer]++;
        }
    });
    
    counts.forEach((count, i) => {
        const countEl = document.getElementById('count' + i);
        if (countEl) {
            countEl.textContent = count;
        }
    });
    
    const total = Object.keys(answers).length;
    const answeredCountEl = document.getElementById('answeredCount');
    if (answeredCountEl) {
        answeredCountEl.textContent = total;
    }
    
    // Auto-advance if everyone answered AND timer is running AND timeLeft is positive
    const playerCount = Object.keys(players).length;
    if (playerCount > 0 && total >= playerCount && timeLeft > 0 && timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        setTimeout(() => showReveal(), 500);
    }
}

function showReveal() {
    const q = QUESTIONS[currentQuestion];
    
    // Update Firebase status
    gameRef.update({ status: 'reveal' });
    
    // Show correct answer
    document.getElementById('correctAnswer').textContent = q.answers[q.correct];
    
    // Highlight correct/wrong on question screen
    document.querySelectorAll('.answer-card').forEach((card, i) => {
        if (i === q.correct) {
            card.classList.add('correct');
        } else {
            card.classList.add('wrong');
        }
    });
    
    // Calculate and update scores, then show stats
    calculateScores().then(() => {
        // Show stats after scores are calculated
        showAnswerStats();
    });
    
    setTimeout(() => {
        showScreen('revealScreen');
    }, 2000);
}

function showAnswerStats() {
    const statsContainer = document.getElementById('answerStats');
    const q = QUESTIONS[currentQuestion];
    const icons = ['▲', '◆', '●', '■'];
    
    // Get answer counts
    gameRef.child('answers/' + currentQuestion).once('value', (snapshot) => {
        const answers = snapshot.val() || {};
        const counts = [0, 0, 0, 0];
        const total = Object.keys(answers).length || 1;
        
        Object.values(answers).forEach(a => {
            if (a.answer >= 0 && a.answer <= 3) {
                counts[a.answer]++;
            }
        });
        
        statsContainer.innerHTML = counts.map((count, i) => {
            const percentage = Math.round((count / total) * 100);
            const isCorrect = i === q.correct;
            return `
                <div class="stat-bar">
                    <div class="stat-bar-icon">${icons[i]}</div>
                    <div class="stat-bar-fill a${i+1} ${isCorrect ? 'correct' : ''}" 
                         style="width: ${Math.max(percentage, 5)}%">
                        ${count} (${percentage}%)
                    </div>
                </div>
            `;
        }).join('');
    });
}

function calculateScores() {
    return new Promise((resolve) => {
        gameRef.child('answers/' + currentQuestion).once('value', (snapshot) => {
            const answers = snapshot.val() || {};
            const q = QUESTIONS[currentQuestion];
            
            if (Object.keys(answers).length === 0) {
                resolve();
                return;
            }
            
            const updatePromises = [];
            
            Object.entries(answers).forEach(([playerId, answer]) => {
                if (answer.answer === q.correct) {
                    // Calculate points based on time
                    const timeTaken = (answer.timestamp - questionStartTime) / 1000;
                    const timeBonus = Math.max(0, 20 - timeTaken) / 20;
                    const points = Math.round(500 + timeBonus * 500); // 500-1000 points
                    
                    // Update player score
                    const scorePromise = gameRef.child('players/' + playerId + '/score').transaction(current => {
                        return (current || 0) + points;
                    });
                    updatePromises.push(scorePromise);
                    
                    const correctPromise = gameRef.child('players/' + playerId + '/correct').transaction(current => {
                        return (current || 0) + 1;
                    });
                    updatePromises.push(correctPromise);
                    
                    // Store points earned for this question
                    const pointsPromise = gameRef.child('answers/' + currentQuestion + '/' + playerId + '/points').set(points);
                    updatePromises.push(pointsPromise);
                } else {
                    const pointsPromise = gameRef.child('answers/' + currentQuestion + '/' + playerId + '/points').set(0);
                    updatePromises.push(pointsPromise);
                }
            });
            
            // Wait for all updates to complete
            Promise.all(updatePromises).then(() => {
                resolve();
            }).catch(() => {
                resolve(); // Resolve anyway to not block the flow
            });
        });
    });
}

function nextQuestion() {
    currentQuestion++;
    
    if (currentQuestion >= QUESTIONS.length) {
        showFinalResults();
    } else {
        showLeaderboard();
    }
}

function showLeaderboard() {
    gameRef.update({ status: 'leaderboard' });
    
    // Small delay to ensure scores are updated in Firebase
    setTimeout(() => {
        updateLeaderboardDisplay();
    }, 500);
}

function updateLeaderboardDisplay() {
    gameRef.child('players').once('value', (snapshot) => {
        const playersData = snapshot.val() || {};
        const sorted = Object.entries(playersData)
            .map(([id, p]) => ({ id, name: p.name, score: p.score || 0 }))
            .sort((a, b) => b.score - a.score);
        
        const leaderboard = document.getElementById('leaderboard');
        if (!leaderboard) return;
        
        leaderboard.innerHTML = sorted.slice(0, 10).map((player, i) => {
            let rankClass = '';
            let rankIcon = i + 1;
            
            if (i === 0) { rankClass = 'top-1'; rankIcon = '🥇'; }
            else if (i === 1) { rankClass = 'top-2'; rankIcon = '🥈'; }
            else if (i === 2) { rankClass = 'top-3'; rankIcon = '🥉'; }
            
            return `
                <div class="leaderboard-item ${rankClass}" style="animation-delay: ${i * 0.1}s">
                    <div class="leaderboard-rank">${rankIcon}</div>
                    <div class="leaderboard-name">${player.name}</div>
                    <div class="leaderboard-score">${player.score}</div>
                </div>
            `;
        }).join('');
        
        showScreen('leaderboardScreen');
        
        // Refresh leaderboard once more after a short delay to catch any late score updates
        setTimeout(() => {
            gameRef.child('players').once('value', (snapshot) => {
                const playersData = snapshot.val() || {};
                const sorted = Object.entries(playersData)
                    .map(([id, p]) => ({ id, name: p.name, score: p.score || 0 }))
                    .sort((a, b) => b.score - a.score);
                
                const leaderboard = document.getElementById('leaderboard');
                if (!leaderboard) return;
                
                leaderboard.innerHTML = sorted.slice(0, 10).map((player, i) => {
                    let rankClass = '';
                    let rankIcon = i + 1;
                    
                    if (i === 0) { rankClass = 'top-1'; rankIcon = '🥇'; }
                    else if (i === 1) { rankClass = 'top-2'; rankIcon = '🥈'; }
                    else if (i === 2) { rankClass = 'top-3'; rankIcon = '🥉'; }
                    
                    return `
                        <div class="leaderboard-item ${rankClass}" style="animation-delay: ${i * 0.1}s">
                            <div class="leaderboard-rank">${rankIcon}</div>
                            <div class="leaderboard-name">${player.name}</div>
                            <div class="leaderboard-score">${player.score}</div>
                        </div>
                    `;
                }).join('');
            });
        }, 1000);
    });
}

function showFinalResults() {
    gameRef.update({ status: 'finished' });
    
    gameRef.child('players').once('value', (snapshot) => {
        const playersData = snapshot.val() || {};
        const sorted = Object.entries(playersData)
            .map(([id, p]) => ({ id, name: p.name, score: p.score || 0 }))
            .sort((a, b) => b.score - a.score);
        
        // Podium
        if (sorted[0]) {
            document.querySelector('#place1 .podium-name').textContent = sorted[0].name;
            document.querySelector('#place1 .podium-score').textContent = sorted[0].score + ' points';
        }
        if (sorted[1]) {
            document.querySelector('#place2 .podium-name').textContent = sorted[1].name;
            document.querySelector('#place2 .podium-score').textContent = sorted[1].score + ' points';
        }
        if (sorted[2]) {
            document.querySelector('#place3 .podium-name').textContent = sorted[2].name;
            document.querySelector('#place3 .podium-score').textContent = sorted[2].score + ' points';
        }
        
        // Full leaderboard
        const fullLB = document.getElementById('fullLeaderboard');
        fullLB.innerHTML = sorted.slice(3).map((player, i) => `
            <div class="leaderboard-item">
                <div class="leaderboard-rank">${i + 4}</div>
                <div class="leaderboard-name">${player.name}</div>
                <div class="leaderboard-score">${player.score}</div>
            </div>
        `).join('');
        
        showScreen('resultsScreen');
        createConfetti();
    });
}

function newGame() {
    // Remove current game
    if (gameRef) {
        gameRef.remove();
    }
    
    // Reset state
    currentQuestion = 0;
    players = {};
    
    // Create new game
    createGame();
    showScreen('lobbyScreen');
}

// ===== UTILITIES =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

function createConfetti() {
    const container = document.getElementById('confetti');
    const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6'];
    
    for (let i = 0; i < 150; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (Math.random() * 3 + 2) + 's';
        piece.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(piece);
    }
    
    setTimeout(() => container.innerHTML = '', 6000);
}
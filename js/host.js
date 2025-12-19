// ===== GAME STATE =====
let gamePin = '';
let gameRef = null;
let players = {};
let currentQuestion = 0;
let timerInterval = null;
let timeLeft = 20;
let questionStartTime = 0;

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
        hint.textContent = `${count} игрок(ов) готовы!`;
    } else {
        startBtn.disabled = true;
        hint.textContent = 'Ожидание игроков...';
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
    
    // Clear previous answers
    gameRef.child('answers/' + currentQuestion).remove();
    
    // Listen for answers
    gameRef.child('answers/' + currentQuestion).on('value', (snapshot) => {
        updateAnswerCounts(snapshot.val() || {});
    });
    
    showScreen('questionScreen');
    startTimer();
}

function startTimer() {
    timeLeft = 20;
    questionStartTime = Date.now();
    
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        updateTimerDisplay();
        
        if (timeLeft <= 5) {
            document.getElementById('timerText').classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
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
    const counts = [0, 0, 0, 0];
    Object.values(answers).forEach(a => {
        if (a.answer >= 0 && a.answer <= 3) {
            counts[a.answer]++;
        }
    });
    
    counts.forEach((count, i) => {
        document.getElementById('count' + i).textContent = count;
    });
    
    const total = Object.keys(answers).length;
    document.getElementById('answeredCount').textContent = total;
    
    // Auto-advance if everyone answered
    if (total >= Object.keys(players).length && timeLeft > 0) {
        clearInterval(timerInterval);
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
    
    // Calculate and update scores
    calculateScores();
    
    // Show stats
    showAnswerStats();
    
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
    gameRef.child('answers/' + currentQuestion).once('value', (snapshot) => {
        const answers = snapshot.val() || {};
        const q = QUESTIONS[currentQuestion];
        
        Object.entries(answers).forEach(([oderId, answer]) => {
            if (answer.answer === q.correct) {
                // Calculate points based on time
                const timeTaken = (answer.timestamp - questionStartTime) / 1000;
                const timeBonus = Math.max(0, 20 - timeTaken) / 20;
                const points = Math.round(500 + timeBonus * 500); // 500-1000 points
                
                // Update player score
                gameRef.child('players/' + playerId + '/score').transaction(current => {
                    return (current || 0) + points;
                });
                
                gameRef.child('players/' + playerId + '/correct').transaction(current => {
                    return (current || 0) + 1;
                });
                
                // Store points earned for this question
                gameRef.child('answers/' + currentQuestion + '/' + playerId + '/points').set(points);
            } else {
                gameRef.child('answers/' + currentQuestion + '/' + playerId + '/points').set(0);
            }
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
    
    gameRef.child('players').once('value', (snapshot) => {
        const playersData = snapshot.val() || {};
        const sorted = Object.entries(playersData)
            .map(([id, p]) => ({ id, name: p.name, score: p.score || 0 }))
            .sort((a, b) => b.score - a.score);
        
        const leaderboard = document.getElementById('leaderboard');
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
            document.querySelector('#place1 .podium-score').textContent = sorted[0].score + ' очков';
        }
        if (sorted[1]) {
            document.querySelector('#place2 .podium-name').textContent = sorted[1].name;
            document.querySelector('#place2 .podium-score').textContent = sorted[1].score + ' очков';
        }
        if (sorted[2]) {
            document.querySelector('#place3 .podium-name').textContent = sorted[2].name;
            document.querySelector('#place3 .podium-score').textContent = sorted[2].score + ' очков';
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
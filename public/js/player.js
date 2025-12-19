// ===== PLAYER STATE =====
let gamePin = '';
let playerId = '';
let playerName = '';
let gameRef = null;
let playerRef = null;
let currentScore = 0;
let correctCount = 0;

// ===== JOIN GAME =====
function joinGame() {
    gamePin = document.getElementById('pinInput').value.trim();
    playerName = document.getElementById('nameInput').value.trim();
    
    if (!gamePin || gamePin.length !== 6) {
        showError('Enter a 6-digit PIN code');
        return;
    }
    
    if (!playerName) {
        showError('Enter your name');
        return;
    }
    
    // Check if game exists
    gameRef = database.ref('games/' + gamePin);
    
    gameRef.once('value', (snapshot) => {
        if (!snapshot.exists()) {
            showError('Game not found');
            return;
        }
        
        const game = snapshot.val();
        if (game.status !== 'waiting') {
            showError('Game has already started');
            return;
        }
        
        // Join game
        playerRef = gameRef.child('players').push();
        playerId = playerRef.key;
        
        playerRef.set({
            name: playerName,
            score: 0,
            correct: 0,
            joinedAt: Date.now()
        });
        
        // Remove player on disconnect
        playerRef.onDisconnect().remove();
        
        // Show waiting screen
        document.getElementById('playerName').textContent = playerName;
        showScreen('waitingScreen');
        
        // Listen for game status
        listenToGame();
    });
}

function showError(message) {
    const errorMsg = document.getElementById('errorMsg');
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    
    setTimeout(() => {
        errorMsg.classList.add('hidden');
    }, 3000);
}

// ===== GAME LISTENERS =====
function listenToGame() {
    // Listen for player count
    gameRef.child('players').on('value', (snapshot) => {
        const count = Object.keys(snapshot.val() || {}).length;
        document.getElementById('waitingCount').textContent = count;
    });
    
    // Listen for game status changes
    gameRef.on('value', (snapshot) => {
        const game = snapshot.val();
        if (!game) return;
        
        // Clear timer when status changes (except when going to question, which will start a new timer)
        if (game.status !== 'question' && playerTimerInterval) {
            clearInterval(playerTimerInterval);
            playerTimerInterval = null;
        }
        
        switch (game.status) {
            case 'question':
                showAnswerScreen(game.currentQuestion);
                break;
            case 'reveal':
                showQuestionResult(game.currentQuestion);
                break;
            case 'leaderboard':
                // Keep showing result
                break;
            case 'finished':
                showFinalResult();
                break;
        }
    });
}

// ===== ANSWER SCREEN =====
let answerSubmitted = false;
let playerTimerInterval = null;
let questionStartTime = 0;

function showAnswerScreen(questionIndex) {
    // Clear any existing timer first to prevent multiple timers running
    if (playerTimerInterval) {
        clearInterval(playerTimerInterval);
        playerTimerInterval = null;
    }
    
    answerSubmitted = false;
    document.getElementById('playerCurrentQ').textContent = questionIndex + 1;
    document.getElementById('playerScore').textContent = currentScore;
    
    // Enable buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('selected');
    });
    
    showScreen('answerScreen');
    
    // Get question start time from Firebase to synchronize timer
    gameRef.once('value', (snapshot) => {
        const game = snapshot.val();
        // Double-check timer is still cleared (in case this callback runs after another question starts)
        if (playerTimerInterval) {
            clearInterval(playerTimerInterval);
            playerTimerInterval = null;
        }
        const serverQuestionStartTime = game.questionStartTime || Date.now();
        startPlayerTimer(serverQuestionStartTime);
    });
}

function startPlayerTimer(serverQuestionStartTime) {
    // Clear any existing timer
    if (playerTimerInterval) {
        clearInterval(playerTimerInterval);
        playerTimerInterval = null;
    }
    
    // Store the question start time for this timer instance
    const timerStartTime = serverQuestionStartTime;
    questionStartTime = serverQuestionStartTime;
    
    // Calculate initial remaining time
    const elapsed = (Date.now() - timerStartTime) / 1000;
    let timeLeft = Math.max(0, 20 - elapsed);
    
    // If time has already expired, submit immediately
    if (timeLeft <= 0) {
        if (!answerSubmitted) {
            submitAnswer(-1); // No answer
        }
        return;
    }
    
    // Display initial time (round down to show full seconds remaining)
    let lastDisplayedSecond = Math.floor(timeLeft);
    const timerEl = document.getElementById('playerTimer');
    if (timerEl) {
        timerEl.textContent = lastDisplayedSecond;
    }
    
    // Update timer every 100ms for smooth countdown
    playerTimerInterval = setInterval(() => {
        // Guard: Check if timer was cleared or if we're no longer on answer screen
        if (!playerTimerInterval) {
            return;
        }
        
        // Recalculate time left based on the timer's start time for accuracy
        const elapsed = (Date.now() - timerStartTime) / 1000;
        timeLeft = Math.max(0, 20 - elapsed);
        
        // Only update display when the second value changes
        const currentSecond = Math.floor(timeLeft);
        if (currentSecond !== lastDisplayedSecond) {
            lastDisplayedSecond = currentSecond;
            const timerEl = document.getElementById('playerTimer');
            if (timerEl) {
                timerEl.textContent = currentSecond;
            }
        }
        
        if (timeLeft <= 0) {
            clearInterval(playerTimerInterval);
            playerTimerInterval = null;
            // Only submit if we haven't already and we're still on the answer screen
            if (!answerSubmitted && document.getElementById('answerScreen') && !document.getElementById('answerScreen').classList.contains('hidden')) {
                submitAnswer(-1); // No answer
            }
        }
    }, 100);
}

function submitAnswer(answerIndex) {
    if (answerSubmitted) return;
    answerSubmitted = true;
    
    clearInterval(playerTimerInterval);
    
    // Disable all buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.disabled = true;
    });
    
    // Highlight selected
    if (answerIndex >= 0) {
        document.getElementById('btn' + answerIndex).classList.add('selected');
    }
    
    // Get current question index
    gameRef.once('value', (snapshot) => {
        const game = snapshot.val();
        const questionIndex = game.currentQuestion;
        
        // Submit answer to Firebase
        gameRef.child('answers/' + questionIndex + '/' + playerId).set({
            answer: answerIndex,
            timestamp: Date.now()
        });
        
        // Show submitted screen
        document.getElementById('submittedIcon').textContent = answerIndex >= 0 ? '✓' : '⏰';
        document.getElementById('submittedText').textContent = answerIndex >= 0 ? 'Answer received!' : 'Time is up!';
        showScreen('submittedScreen');
    });
}

// ===== RESULT SCREEN =====
function showQuestionResult(questionIndex) {
    // Clear timer when showing results
    if (playerTimerInterval) {
        clearInterval(playerTimerInterval);
        playerTimerInterval = null;
    }
    
    gameRef.once('value', (snapshot) => {
        const game = snapshot.val();
        const questions = game.questions;
        const q = questions[questionIndex];
        
        // Get player's answer
        const answers = game.answers?.[questionIndex] || {};
        const myAnswer = answers[playerId];
        
        if (!myAnswer) {
            // No answer submitted
            document.getElementById('resultIcon').textContent = '⏰';
            document.getElementById('resultText').textContent = 'Time is up!';
            document.getElementById('resultPoints').textContent = '+0';
        } else if (myAnswer.answer === q.correct) {
            // Correct!
            const points = myAnswer.points || 0;
            currentScore += points;
            correctCount++;
            
            document.getElementById('resultIcon').textContent = '✓';
            document.getElementById('resultText').textContent = 'Correct!';
            document.getElementById('resultPoints').textContent = '+' + points;
            document.getElementById('resultPoints').style.color = '#6bcb77';
        } else {
            // Wrong
            document.getElementById('resultIcon').textContent = '✗';
            document.getElementById('resultText').textContent = 'Incorrect!';
            document.getElementById('resultPoints').textContent = '+0';
            document.getElementById('resultPoints').style.color = '#ff6b6b';
        }
        
        document.getElementById('resultTotal').textContent = currentScore;
        
        // Calculate position
        const players = game.players || {};
        const sorted = Object.entries(players)
            .map(([id, p]) => ({ id, score: p.score || 0 }))
            .sort((a, b) => b.score - a.score);
        
        const position = sorted.findIndex(p => p.id === playerId) + 1;
        document.getElementById('resultPosition').textContent = position;
        
        showScreen('resultScreen');
    });
}

// ===== FINAL RESULT =====
function showFinalResult() {
    gameRef.child('players').once('value', (snapshot) => {
        const players = snapshot.val() || {};
        const sorted = Object.entries(players)
            .map(([id, p]) => ({ id, name: p.name, score: p.score || 0 }))
            .sort((a, b) => b.score - a.score);
        
        const position = sorted.findIndex(p => p.id === playerId) + 1;
        const myData = players[playerId] || {};
        
        // Position icon
        let positionIcon = position;
        if (position === 1) positionIcon = '🥇';
        else if (position === 2) positionIcon = '🥈';
        else if (position === 3) positionIcon = '🥉';
        
        document.getElementById('finalPosition').textContent = positionIcon;
        document.getElementById('finalPlace').textContent = position + (position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th') + ' place!';
        document.getElementById('finalScore').textContent = myData.score || 0;
        document.getElementById('finalCorrect').textContent = myData.correct || 0;
        
        const accuracy = Math.round(((myData.correct || 0) / QUESTIONS.length) * 100);
        document.getElementById('finalAccuracy').textContent = accuracy + '%';
        
        showScreen('finalScreen');
    });
}

function playAgain() {
    // Clean up
    if (playerRef) {
        playerRef.remove();
    }
    
    // Reset state
    gamePin = '';
    playerId = '';
    playerName = '';
    currentScore = 0;
    correctCount = 0;
    
    // Clear inputs
    document.getElementById('pinInput').value = '';
    document.getElementById('nameInput').value = '';
    
    showScreen('joinScreen');
}

// ===== UTILITIES =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// Auto-focus PIN input
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('pinInput').focus();
});

// PIN input formatting
document.getElementById('pinInput')?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
});
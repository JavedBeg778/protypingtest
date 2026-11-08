/* ================= BIGRAM BLITZ GAME LOGIC v2.0 ================= */
/* AdSense Optimized - High Quality Interactive Features */

// Common bigrams with their frequencies
const bigramData = {
    'th': { freq: 3.56, category: 'common' },
    'er': { freq: 2.77, category: 'common' },
    'an': { freq: 2.22, category: 'common' },
    're': { freq: 2.19, category: 'common' },
    'in': { freq: 2.17, category: 'common' },
    'on': { freq: 1.91, category: 'common' },
    'at': { freq: 1.86, category: 'common' },
    'en': { freq: 1.83, category: 'common' },
    'nd': { freq: 1.77, category: 'common' },
    'ti': { freq: 1.76, category: 'common' },
    'es': { freq: 1.75, category: 'common' },
    'or': { freq: 1.73, category: 'common' },
    'te': { freq: 1.70, category: 'common' },
    'of': { freq: 1.68, category: 'common' },
    'ed': { freq: 1.64, category: 'common' },
    'is': { freq: 1.61, category: 'common' },
    'it': { freq: 1.55, category: 'common' },
    'al': { freq: 1.52, category: 'common' },
    'ar': { freq: 1.49, category: 'common' },
    'st': { freq: 1.47, category: 'common' },
    'to': { freq: 1.44, category: 'common' },
    'nt': { freq: 1.42, category: 'common' },
    'ng': { freq: 1.38, category: 'common' },
    'se': { freq: 1.36, category: 'common' },
    'ha': { freq: 1.33, category: 'common' },
    'as': { freq: 1.30, category: 'common' },
    'ou': { freq: 1.28, category: 'common' },
    'io': { freq: 1.25, category: 'common' },
    'le': { freq: 1.22, category: 'common' },
    've': { freq: 1.19, category: 'common' },
    'co': { freq: 1.16, category: 'intermediate' },
    'me': { freq: 1.13, category: 'intermediate' },
    'de': { freq: 1.10, category: 'intermediate' },
    'hi': { freq: 1.07, category: 'intermediate' },
    'ri': { freq: 1.04, category: 'intermediate' },
    'ro': { freq: 1.01, category: 'intermediate' },
    'ic': { freq: 0.98, category: 'intermediate' },
    'ne': { freq: 0.95, category: 'intermediate' },
    'ea': { freq: 0.92, category: 'intermediate' },
    'ra': { freq: 0.89, category: 'intermediate' },
    'ce': { freq: 0.86, category: 'intermediate' },
    'li': { freq: 0.83, category: 'intermediate' },
    'ch': { freq: 0.80, category: 'intermediate' },
    'll': { freq: 0.77, category: 'intermediate' },
    'be': { freq: 0.74, category: 'intermediate' },
    'ma': { freq: 0.71, category: 'intermediate' },
    'si': { freq: 0.68, category: 'intermediate' },
    'om': { freq: 0.65, category: 'advanced' },
    'ur': { freq: 0.62, category: 'advanced' },
    'ca': { freq: 0.59, category: 'advanced' },
    'el': { freq: 0.56, category: 'advanced' },
    'ta': { freq: 0.53, category: 'advanced' },
    'la': { freq: 0.50, category: 'advanced' },
    'ns': { freq: 0.47, category: 'advanced' },
    'di': { freq: 0.44, category: 'advanced' },
    'fo': { freq: 0.41, category: 'advanced' },
    'ho': { freq: 0.38, category: 'advanced' },
    'pe': { freq: 0.35, category: 'advanced' },
    'ec': { freq: 0.32, category: 'advanced' }
};

// Game state
let currentMode = 'timed';
let gameActive = false;
let gamePaused = false;
let currentBigram = '';
let nextBigrams = [];
let streak = 0;
let score = 0;
let totalAttempts = 0;
let correctAttempts = 0;
let timer = null;
let timeLeft = 60;
let challengeGoal = 50;
let challengeProgress = 0;
let precisionStreak = 0;
let gameHistory = JSON.parse(localStorage.getItem('bigramHistory')) || [];
let achievements = JSON.parse(localStorage.getItem('bigramAchievements')) || [];

// DOM Elements
let userInput, feedback, currentBigramEl, streakCountEl, gameScoreEl, gameAccuracyEl;
let bigramPreviewEl, timerDisplay, timerProgress, pauseBtn;

// Initialize game
function initBigramGame() {
    console.log('Bigram Blitz initialized');
    
    // Cache DOM elements
    userInput = document.getElementById('userInput');
    feedback = document.getElementById('inputFeedback');
    currentBigramEl = document.getElementById('currentBigram');
    streakCountEl = document.getElementById('streakCount');
    gameScoreEl = document.getElementById('gameScore');
    gameAccuracyEl = document.getElementById('gameAccuracy');
    bigramPreviewEl = document.getElementById('bigramPreview');
    timerDisplay = document.getElementById('timerDisplay');
    timerProgress = document.getElementById('timerProgress');
    pauseBtn = document.getElementById('pauseBtn');
    
    // Load data
    loadBigramLibrary();
    loadLeaderboard();
    loadAchievements();
    updateStats();
    
    // Set initial bigram
    generateNextBigram();
    
    // Add input listener
    if (userInput) {
        userInput.addEventListener('input', handleInput);
    }
}

// Load bigram library
function loadBigramLibrary() {
    const container = document.getElementById('bigramLibrary');
    if (!container) return;
    
    const bigrams = Object.entries(bigramData).slice(0, 30);
    
    container.innerHTML = bigrams.map(([bigram, data]) => `
        <div class="library-item">
            <div class="bigram">${bigram}</div>
            <div class="freq">${data.freq}%</div>
        </div>
    `).join('');
}

// Load leaderboard
function loadLeaderboard() {
    const container = document.getElementById('leaderboard');
    if (!container) return;
    
    const leaderboard = [
        { name: 'BigramMaster', score: 245 },
        { name: 'SpeedTyper', score: 198 },
        { name: 'KeyKing', score: 176 },
        { name: 'TypeWizard', score: 154 },
        { name: 'FingerFury', score: 132 }
    ];
    
    container.innerHTML = leaderboard.map((item, index) => `
        <div class="leaderboard-item">
            <span class="leaderboard-rank">#${index + 1}</span>
            <span class="leaderboard-name">${item.name}</span>
            <span class="leaderboard-score">${item.score}</span>
        </div>
    `).join('');
}

// Load achievements
function loadAchievements() {
    const container = document.getElementById('achievements');
    if (!container) return;
    
    const achievementList = [
        { icon: '🔥', name: 'First Blood', desc: 'Type your first bigram', unlocked: gameHistory.length > 0 },
        { icon: '⚡', name: 'Streak Master', desc: '10 streak', unlocked: checkAchievement('streak', 10) },
        { icon: '🎯', name: 'Perfect 10', desc: '10 correct in a row', unlocked: checkAchievement('perfect', 10) },
        { icon: '💯', name: 'Century', desc: 'Score 100 points', unlocked: checkAchievement('score', 100) }
    ];
    
    container.innerHTML = achievementList.map(ach => `
        <div class="achievement-item ${ach.unlocked ? 'unlocked' : ''}">
            <span class="achievement-icon">${ach.icon}</span>
            <div class="achievement-info">
                <span class="achievement-name">${ach.name}</span>
                <span class="achievement-desc">${ach.desc}</span>
            </div>
        </div>
    `).join('');
}

// Check achievement
function checkAchievement(type, value) {
    if (type === 'streak') {
        return gameHistory.some(h => h.maxStreak >= value);
    } else if (type === 'perfect') {
        return gameHistory.some(h => h.maxStreak >= value && h.accuracy === 100);
    } else if (type === 'score') {
        return gameHistory.some(h => h.score >= value);
    }
    return false;
}

// Update stats
function updateStats() {
    const bestStreak = gameHistory.length > 0 
        ? Math.max(...gameHistory.map(h => h.maxStreak)) 
        : 0;
    
    const totalBigrams = gameHistory.reduce((sum, h) => sum + h.total, 0);
    
    const avgAccuracy = gameHistory.length > 0
        ? Math.round(gameHistory.reduce((sum, h) => sum + h.accuracy, 0) / gameHistory.length)
        : 0;
    
    document.getElementById('bestStreak').textContent = bestStreak;
    document.getElementById('totalBigrams').textContent = totalBigrams;
    document.getElementById('avgAccuracy').textContent = avgAccuracy + '%';
    document.getElementById('gamesPlayed').textContent = gameHistory.length;
}

// Set game mode
function setBigramMode(mode) {
    currentMode = mode;
    
    // Update UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    // Show/hide mode-specific elements
    const gameTimer = document.getElementById('gameTimer');
    const challengeMode = document.getElementById('challengeMode');
    const precisionMode = document.getElementById('precisionMode');
    
    if (gameTimer) gameTimer.style.display = mode === 'timed' ? 'block' : 'none';
    if (challengeMode) challengeMode.style.display = mode === 'challenge' ? 'block' : 'none';
    if (precisionMode) precisionMode.style.display = mode === 'precision' ? 'block' : 'none';
    
    // Reset game
    restartBigramGame();
}

// Start game
function startBigramGame() {
    if (gameActive) return;
    
    gameActive = true;
    gamePaused = false;
    if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️</span> Pause';
    
    generateNextBigram();
    
    if (currentMode === 'timed') {
        startTimer();
    }
    
    if (userInput) userInput.focus();
}

// Generate next bigram
function generateNextBigram() {
    const bigrams = Object.keys(bigramData);
    const randomIndex = Math.floor(Math.random() * bigrams.length);
    currentBigram = bigrams[randomIndex];
    
    // Generate next preview
    nextBigrams = [];
    for (let i = 0; i < 4; i++) {
        const nextIndex = (randomIndex + i + 1) % bigrams.length;
        nextBigrams.push(bigrams[nextIndex]);
    }
    
    // Update display
    if (currentBigramEl) currentBigramEl.textContent = currentBigram;
    if (bigramPreviewEl) {
        bigramPreviewEl.innerHTML = nextBigrams.map(b => 
            `<span class="preview-item">${b}</span>`
        ).join('');
    }
}

// Start timer
function startTimer() {
    if (timer) clearInterval(timer);
    
    timeLeft = 60;
    updateTimerDisplay();
    
    timer = setInterval(() => {
        if (!gameActive || gamePaused) return;
        
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            endBigramGame();
        }
    }, 1000);
}

// Update timer display
function updateTimerDisplay() {
    if (timerDisplay) timerDisplay.textContent = timeLeft + 's';
    if (timerProgress) {
        const progress = (timeLeft / 60) * 100;
        timerProgress.style.width = progress + '%';
    }
}

// Handle input
function handleInput(e) {
    if (!gameActive || gamePaused) return;
    
    const input = e.target.value.toLowerCase();
    
    if (input.length === 2) {
        if (input === currentBigram) {
            // Correct!
            streak++;
            const pointsEarned = 10 + (streak * 2);
            score += pointsEarned;
            correctAttempts++;
            
            if (userInput) {
                userInput.classList.add('correct');
                userInput.classList.remove('incorrect');
            }
            if (feedback) {
                feedback.textContent = '✅ Perfect! +' + pointsEarned + ' points';
                feedback.className = 'input-feedback success';
            }
            
            // Update mode-specific progress
            if (currentMode === 'challenge') {
                challengeProgress++;
                updateChallengeProgress();
            } else if (currentMode === 'precision') {
                precisionStreak++;
                updatePrecisionProgress();
            }
            
            // Generate next bigram
            generateNextBigram();
            
            // Update stats
            updateGameStats();
            
            // Check achievements
            checkGameAchievements();
        } else {
            // Incorrect
            streak = 0;
            precisionStreak = 0;
            
            if (userInput) {
                userInput.classList.add('incorrect');
                userInput.classList.remove('correct');
            }
            if (feedback) {
                feedback.textContent = '❌ Try again! It was "' + currentBigram + '"';
                feedback.className = 'input-feedback error';
            }
            
            // Update mode-specific progress
            if (currentMode === 'precision') {
                endBigramGame();
            }
        }
        
        totalAttempts++;
        
        // Update accuracy
        const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;
        if (gameAccuracyEl) gameAccuracyEl.textContent = accuracy + '%';
        
        // Clear input
        e.target.value = '';
        
        // Remove highlight classes
        setTimeout(() => {
            if (userInput) userInput.classList.remove('correct', 'incorrect');
            if (feedback) feedback.textContent = '';
        }, 300);
    }
}

// Update game stats
function updateGameStats() {
    if (streakCountEl) streakCountEl.textContent = streak;
    if (gameScoreEl) gameScoreEl.textContent = score;
}

// Update challenge progress
function updateChallengeProgress() {
    const progress = (challengeProgress / challengeGoal) * 100;
    const progressFill = document.getElementById('challengeProgress');
    const progressText = document.getElementById('challengeProgressText');
    
    if (progressFill) progressFill.style.width = progress + '%';
    if (progressText) progressText.textContent = challengeProgress + '/' + challengeGoal;
    
    if (challengeProgress >= challengeGoal) {
        showNotification('🎉 Challenge completed! You earned 100 bonus points!');
        score += 100;
        updateGameStats();
    }
}

// Update precision progress
function updatePrecisionProgress() {
    const precisionStreakEl = document.getElementById('precisionStreak');
    if (precisionStreakEl) precisionStreakEl.textContent = precisionStreak;
    
    if (precisionStreak >= 10) {
        showNotification('🎯 Perfect! You maintained 100% accuracy for 10 bigrams!');
        endBigramGame();
    }
}

// Check game achievements
function checkGameAchievements() {
    if (streak === 10) {
        unlockAchievement('streak');
    }
    if (score >= 100) {
        unlockAchievement('score');
    }
    if (streak >= 10 && correctAttempts === totalAttempts) {
        unlockAchievement('perfect');
    }
}

// Unlock achievement
function unlockAchievement(type) {
    if (!achievements.includes(type)) {
        achievements.push(type);
        localStorage.setItem('bigramAchievements', JSON.stringify(achievements));
        loadAchievements();
        showNotification('🎉 Achievement unlocked!');
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'game-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--accent-success);
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 1000;
        animation: slideDown 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Toggle pause
function toggleBigramPause() {
    if (!gameActive) return;
    
    gamePaused = !gamePaused;
    
    if (pauseBtn) {
        if (gamePaused) {
            pauseBtn.innerHTML = '<span>▶️</span> Resume';
        } else {
            pauseBtn.innerHTML = '<span>⏸️</span> Pause';
            if (userInput) userInput.focus();
        }
    }
}

// Restart game
function restartBigramGame() {
    // Save game history
    if (totalAttempts > 0) {
        gameHistory.push({
            date: new Date().toLocaleDateString(),
            mode: currentMode,
            score: score,
            maxStreak: streak,
            accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
            total: totalAttempts
        });
        localStorage.setItem('bigramHistory', JSON.stringify(gameHistory));
    }
    
    // Reset state
    gameActive = false;
    gamePaused = false;
    streak = 0;
    score = 0;
    totalAttempts = 0;
    correctAttempts = 0;
    challengeProgress = 0;
    precisionStreak = 0;
    
    // Reset UI
    if (streakCountEl) streakCountEl.textContent = '0';
    if (gameScoreEl) gameScoreEl.textContent = '0';
    if (gameAccuracyEl) gameAccuracyEl.textContent = '100%';
    if (userInput) {
        userInput.value = '';
        userInput.disabled = false;
    }
    if (pauseBtn) pauseBtn.innerHTML = '<span>⏸️</span> Pause';
    
    const challengeProgressFill = document.getElementById('challengeProgress');
    const challengeProgressText = document.getElementById('challengeProgressText');
    const precisionStreakEl = document.getElementById('precisionStreak');
    
    if (challengeProgressFill) challengeProgressFill.style.width = '0%';
    if (challengeProgressText) challengeProgressText.textContent = '0/50';
    if (precisionStreakEl) precisionStreakEl.textContent = '0';
    
    if (currentMode === 'timed') {
        timeLeft = 60;
        updateTimerDisplay();
        if (timer) clearInterval(timer);
    }
    
    // Generate first bigram
    const bigrams = Object.keys(bigramData);
    const randomIndex = Math.floor(Math.random() * bigrams.length);
    currentBigram = bigrams[randomIndex];
    if (currentBigramEl) currentBigramEl.textContent = currentBigram;
    
    // Update stats
    updateStats();
    
    // Start game
    startBigramGame();
}

// End game
function endBigramGame() {
    gameActive = false;
    if (userInput) userInput.disabled = true;
    if (timer) clearInterval(timer);
    
    // Save history
    if (totalAttempts > 0) {
        gameHistory.push({
            date: new Date().toLocaleDateString(),
            mode: currentMode,
            score: score,
            maxStreak: streak,
            accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
            total: totalAttempts
        });
        localStorage.setItem('bigramHistory', JSON.stringify(gameHistory));
    }
    
    // Show game over message
    const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;
    showNotification(`Game Over! Score: ${score} | Accuracy: ${accuracy}%`);
    
    // Update stats
    updateStats();
    loadAchievements();
}

// Export functions for global access
window.initBigramGame = initBigramGame;
window.setBigramMode = setBigramMode;
window.restartBigramGame = restartBigramGame;
window.toggleBigramPause = toggleBigramPause;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initBigramGame();
});
/* ================= TYPING GAMES LOGIC v2.0 ================= */
/* AdSense Optimized - High Quality Interactive Features */

// Game data
var gamesData = [
    { id: 'word-rush', name: 'Word Rush', icon: '⚡', description: 'Type falling words before they hit the ground', difficulty: 'easy', players: 2300, rating: 4.8, category: 'easy' },
    { id: 'keyboard-ninja', name: 'Keyboard Ninja', icon: '🥷', description: 'Slice letters by typing them correctly', difficulty: 'medium', players: 3100, rating: 4.9, category: 'medium', featured: true },
    { id: 'typing-race', name: 'Typing Race', icon: '🏎️', description: 'Race against others in real-time', difficulty: 'medium', players: 4200, rating: 4.7, category: 'medium' },
    { id: 'word-search', name: 'Word Search', icon: '🔍', description: 'Find and type words in the grid', difficulty: 'easy', players: 1800, rating: 4.6, category: 'easy' },
    { id: 'typing-shooter', name: 'Typing Shooter', icon: '🎯', description: 'Shoot targets by typing words', difficulty: 'hard', players: 2900, rating: 4.8, category: 'hard', badge: 'POPULAR' },
    { id: 'keyboard-master', name: 'Keyboard Master', icon: '👑', description: 'Complete challenging patterns', difficulty: 'hard', players: 1200, rating: 4.9, category: 'hard' },
    { id: 'word-drop', name: 'Word Drop', icon: '🔽', description: 'Type falling words before they reach the bottom', difficulty: 'easy', players: 1500, rating: 4.5, category: 'easy' },
    { id: 'letter-storm', name: 'Letter Storm', icon: '🌪️', description: 'Letters swirling around - type them in order', difficulty: 'medium', players: 900, rating: 4.7, category: 'medium', badge: 'NEW' },
    { id: 'typing-marathon', name: 'Typing Marathon', icon: '🏃', description: 'Endurance challenge - how long can you keep typing?', difficulty: 'medium', players: 700, rating: 4.6, category: 'medium' }
];

// Word lists for games
var wordLists = {
    easy: ['cat', 'dog', 'sun', 'car', 'book', 'tree', 'fish', 'bird', 'house', 'phone', 'happy', 'smile', 'water', 'flower', 'garden'],
    medium: ['typing', 'keyboard', 'screen', 'window', 'garden', 'office', 'school', 'family', 'travel', 'weather', 'challenge', 'practice', 'speed', 'accuracy', 'muscle'],
    hard: ['challenge', 'difficult', 'excellent', 'knowledge', 'beautiful', 'happiness', 'education', 'technology', 'development', 'environment', 'extraordinary', 'accomplishment']
};

// State variables
var currentGame = null;
var gameActive = false;
var gameScore = 0;
var gameStreak = 0;
var currentWord = '';
var wordList = [];
var gameTimer = null;
var timeLeft = 60;
var currentLetterIndex = 0;
var letters = [];
var gameStats = JSON.parse(localStorage.getItem('gameStats')) || {
    gamesPlayed: 0,
    highScore: 0,
    totalPoints: 0,
    bestWPM: 0,
    loginStreak: 0,
    lastLogin: null,
    achievements: {
        first: 0,
        speed: 0,
        streak: 0,
        highscore: 0
    }
};

// DOM Elements
var gamesGrid, leaderboardList;

// Initialize games
function initGames() {
    console.log('Games page initialized');
    
    gamesGrid = document.getElementById('gamesGrid');
    leaderboardList = document.getElementById('leaderboardList');
    
    renderGamesGrid();
    updateStats();
    checkLoginStreak();
    loadLeaderboard('daily');
    updateAchievements();
    setupEventListeners();
}

// Render games grid
function renderGamesGrid(filterCategory) {
    if (!gamesGrid) return;
    
    var filteredGames = gamesData;
    if (filterCategory && filterCategory !== 'all') {
        filteredGames = gamesData.filter(function(game) { return game.difficulty === filterCategory; });
    }
    
    var html = '';
    for (var i = 0; i < filteredGames.length; i++) {
        var game = filteredGames[i];
        var badgeHtml = '';
        if (game.badge) {
            badgeHtml = '<div class="game-badge ' + game.badge.toLowerCase() + '">' + game.badge + '</div>';
        } else if (game.featured) {
            badgeHtml = '<div class="game-badge hot">HOT</div>';
        }
        
        html += '<div class="game-card" data-game="' + game.id + '" data-difficulty="' + game.difficulty + '" onclick="launchGameModule(\'' + game.id + '\')">';
        html += badgeHtml;
        html += '<div class="game-icon">' + game.icon + '</div>';
        html += '<h3>' + game.name + '</h3>';
        html += '<p class="game-description">' + game.description + '</p>';
        html += '<div class="game-meta">';
        html += '<span>👥 ' + game.players.toLocaleString() + '</span>';
        html += '<span>⭐ ' + game.rating + '</span>';
        html += '</div>';
        html += '<div class="game-difficulty ' + game.difficulty + '">' + game.difficulty.toUpperCase() + '</div>';
        html += '<button class="play-btn">Play Now →</button>';
        html += '</div>';
    }
    
    gamesGrid.innerHTML = html;
}

// Update stats
function updateStats() {
    var gamesPlayedElem = document.getElementById('gamesPlayed');
    var highScoreElem = document.getElementById('highScore');
    var totalPointsElem = document.getElementById('totalPoints');
    var bestWPMelem = document.getElementById('bestWPM');
    var loginStreakElem = document.getElementById('loginStreak');
    
    if (gamesPlayedElem) gamesPlayedElem.textContent = gameStats.gamesPlayed;
    if (highScoreElem) highScoreElem.textContent = gameStats.highScore;
    if (totalPointsElem) totalPointsElem.textContent = gameStats.totalPoints;
    if (bestWPMelem) bestWPMelem.textContent = gameStats.bestWPM;
    if (loginStreakElem) loginStreakElem.textContent = gameStats.loginStreak + ' days';
}

// Update achievements
function updateAchievements() {
    var achFirst = document.getElementById('achFirst');
    var achSpeed = document.getElementById('achSpeed');
    var achStreak = document.getElementById('achStreak');
    var achHigh = document.getElementById('achHigh');
    
    if (achFirst) achFirst.textContent = gameStats.achievements.first + '/1';
    if (achSpeed) achSpeed.textContent = gameStats.achievements.speed + '/10';
    if (achStreak) achStreak.textContent = gameStats.achievements.streak + '/7';
    if (achHigh) achHigh.textContent = gameStats.achievements.highscore + '/1000';
}

// Check login streak
function checkLoginStreak() {
    var today = new Date().toDateString();
    
    if (gameStats.lastLogin) {
        var lastLogin = new Date(gameStats.lastLogin);
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLogin.toDateString() === yesterday.toDateString()) {
            gameStats.loginStreak++;
        } else if (lastLogin.toDateString() !== today) {
            gameStats.loginStreak = 1;
        }
    } else {
        gameStats.loginStreak = 1;
    }
    
    gameStats.lastLogin = today;
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
}

// Claim daily reward
function claimDailyRewardModule() {
    var today = new Date().toDateString();
    var lastClaim = localStorage.getItem('lastDailyClaim');
    
    if (lastClaim === today) {
        alert('You already claimed your daily reward today!');
        return;
    }
    
    var reward = 50 + (gameStats.loginStreak * 10);
    gameStats.totalPoints += reward;
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
    localStorage.setItem('lastDailyClaim', today);
    
    updateStats();
    alert('🎉 You claimed ' + reward + ' points!');
}

// Load leaderboard
function loadLeaderboard(period) {
    if (!leaderboardList) return;
    
    var leaderboardData = {
        daily: [
            { rank: 1, name: 'SpeedDemon', avatar: 'SD', game: 'Word Rush', score: 1250 },
            { rank: 2, name: 'TypingPro', avatar: 'TP', game: 'Keyboard Ninja', score: 1180 },
            { rank: 3, name: 'KeyMaster', avatar: 'KM', game: 'Typing Race', score: 1120 },
            { rank: 4, name: 'WordWiz', avatar: 'WW', game: 'Word Search', score: 1080 },
            { rank: 5, name: 'FingerFury', avatar: 'FF', game: 'Typing Shooter', score: 1050 }
        ],
        weekly: [
            { rank: 1, name: 'TypingPro', avatar: 'TP', game: 'Keyboard Ninja', score: 8450 },
            { rank: 2, name: 'SpeedDemon', avatar: 'SD', game: 'Word Rush', score: 8320 },
            { rank: 3, name: 'KeyMaster', avatar: 'KM', game: 'Typing Race', score: 7900 },
            { rank: 4, name: 'WordWiz', avatar: 'WW', game: 'Word Search', score: 7650 },
            { rank: 5, name: 'FingerFury', avatar: 'FF', game: 'Typing Shooter', score: 7400 }
        ],
        alltime: [
            { rank: 1, name: 'KeyMaster', avatar: 'KM', game: 'Typing Race', score: 45200 },
            { rank: 2, name: 'SpeedDemon', avatar: 'SD', game: 'Word Rush', score: 44800 },
            { rank: 3, name: 'TypingPro', avatar: 'TP', game: 'Keyboard Ninja', score: 43100 },
            { rank: 4, name: 'WordWiz', avatar: 'WW', game: 'Word Search', score: 41500 },
            { rank: 5, name: 'FingerFury', avatar: 'FF', game: 'Typing Shooter', score: 39800 }
        ]
    };
    
    var data = leaderboardData[period];
    var html = '';
    
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var rankClass = '';
        if (item.rank === 1) rankClass = 'gold';
        else if (item.rank === 2) rankClass = 'silver';
        else if (item.rank === 3) rankClass = 'bronze';
        
        html += '<div class="leaderboard-item">';
        html += '<span class="leaderboard-rank ' + rankClass + '">#' + item.rank + '</span>';
        html += '<div class="leaderboard-avatar">' + item.avatar + '</div>';
        html += '<div class="leaderboard-info">';
        html += '<span class="leaderboard-name">' + item.name + '</span>';
        html += '<span class="leaderboard-game">' + item.game + '</span>';
        html += '</div>';
        html += '<span class="leaderboard-score">' + item.score + '</span>';
        html += '</div>';
    }
    
    leaderboardList.innerHTML = html;
}

// Switch leaderboard
function switchLeaderboardModule(period) {
    var btns = document.querySelectorAll('.leaderboard-tabs .tab-btn');
    for (var i = 0; i < btns.length; i++) {
        btns[i].classList.remove('active');
        if (btns[i].getAttribute('data-period') === period) {
            btns[i].classList.add('active');
        }
    }
    loadLeaderboard(period);
}

// Filter games
function filterGamesModule(category) {
    renderGamesGrid(category === 'all' ? null : category);
    
    var cards = document.querySelectorAll('.category-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].classList.remove('active');
        if (cards[i].getAttribute('data-category') === category) {
            cards[i].classList.add('active');
        }
    }
}

// Launch game
function launchGameModule(gameId) {
    currentGame = gamesData.find(function(g) { return g.id === gameId; });
    if (!currentGame) return;
    
    document.getElementById('modalGameTitle').textContent = currentGame.name;
    document.getElementById('gameModal').style.display = 'flex';
    
    // Reset game state
    gameActive = true;
    gameScore = 0;
    gameStreak = 0;
    wordList = [...wordLists[currentGame.difficulty]];
    timeLeft = 60;
    currentLetterIndex = 0;
    
    if (gameId === 'word-rush' || gameId === 'word-drop' || gameId === 'typing-race') {
        loadWordRushGame();
    } else if (gameId === 'keyboard-ninja') {
        loadKeyboardNinjaGame();
    } else {
        loadGenericGame();
    }
}

// Load Word Rush game
function loadWordRushGame() {
    var container = document.getElementById('gameContainer');
    currentWord = getRandomWord();
    
    container.innerHTML = '<div class="game-container">' +
        '<div class="game-stats">' +
        '<div class="game-stat"><span class="value" id="gameScore">0</span><span class="label">Score</span></div>' +
        '<div class="game-stat"><span class="value" id="gameStreak">0</span><span class="label">Streak</span></div>' +
        '<div class="game-stat"><span class="value" id="gameTimer">60</span><span class="label">Time</span></div>' +
        '</div>' +
        '<div class="game-word" id="gameWord">' + currentWord + '</div>' +
        '<input type="text" class="game-input" id="gameInput" autocomplete="off" placeholder="Type the word...">' +
        '<div class="game-feedback" id="gameFeedback"></div>' +
        '</div>';
    
    setupGameInput();
    startGameTimer();
}

// Load Keyboard Ninja game
function loadKeyboardNinjaGame() {
    var container = document.getElementById('gameContainer');
    letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    currentLetterIndex = 0;
    
    var lettersHtml = '<div class="letters-grid">';
    for (var i = 0; i < letters.length; i++) {
        var activeClass = (i === currentLetterIndex) ? 'active' : '';
        lettersHtml += '<div class="letter-cell ' + activeClass + '">' + letters[i] + '</div>';
    }
    lettersHtml += '</div>';
    
    container.innerHTML = '<div class="game-container">' +
        '<div class="game-stats">' +
        '<div class="game-stat"><span class="value" id="gameScore">0</span><span class="label">Score</span></div>' +
        '<div class="game-stat"><span class="value" id="gameCombo">0</span><span class="label">Combo</span></div>' +
        '<div class="game-stat"><span class="value" id="gameTargets">0</span><span class="label">Targets</span></div>' +
        '</div>' +
        lettersHtml +
        '<input type="text" class="game-input" id="gameInput" autocomplete="off" placeholder="Type the highlighted letter...">' +
        '<div class="game-feedback" id="gameFeedback">Type the highlighted letter to slice it!</div>' +
        '</div>';
    
    setupNinjaInput();
}

// Load generic game
function loadGenericGame() {
    var container = document.getElementById('gameContainer');
    currentWord = getRandomWord();
    
    container.innerHTML = '<div class="game-container">' +
        '<div class="game-stats">' +
        '<div class="game-stat"><span class="value" id="gameScore">0</span><span class="label">Score</span></div>' +
        '<div class="game-stat"><span class="value" id="gameStreak">0</span><span class="label">Streak</span></div>' +
        '</div>' +
        '<div class="game-word" id="gameWord">' + currentWord + '</div>' +
        '<input type="text" class="game-input" id="gameInput" autocomplete="off" placeholder="Type the word...">' +
        '<div class="game-feedback" id="gameFeedback"></div>' +
        '</div>';
    
    setupGameInput();
}

// Get random word
function getRandomWord() {
    if (wordList.length === 0) return 'game';
    var randomIndex = Math.floor(Math.random() * wordList.length);
    return wordList[randomIndex];
}

// Start game timer
function startGameTimer() {
    if (gameTimer) clearInterval(gameTimer);
    
    gameTimer = setInterval(function() {
        if (!gameActive) return;
        
        timeLeft--;
        var timerEl = document.getElementById('gameTimer');
        if (timerEl) timerEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// Setup game input for word games
function setupGameInput() {
    var input = document.getElementById('gameInput');
    if (!input) return;
    
    input.addEventListener('input', function(e) {
        if (!gameActive) return;
        
        var value = e.target.value.trim().toLowerCase();
        var currentWordEl = document.getElementById('gameWord');
        var currentWordText = currentWordEl ? currentWordEl.textContent.toLowerCase() : '';
        var feedback = document.getElementById('gameFeedback');
        
        if (value === currentWordText) {
            // Correct!
            var pointsEarned = 10 + (gameStreak * 2);
            gameScore += pointsEarned;
            gameStreak++;
            
            document.getElementById('gameScore').textContent = gameScore;
            document.getElementById('gameStreak').textContent = gameStreak;
            
            if (feedback) {
                feedback.textContent = '✅ Correct! +' + pointsEarned + ' points';
                feedback.className = 'game-feedback success';
            }
            
            // New word
            currentWord = getRandomWord();
            if (currentWordEl) currentWordEl.textContent = currentWord;
            
            e.target.value = '';
        } else if (currentWordText.startsWith(value) && value.length > 0) {
            if (feedback) {
                feedback.textContent = '👍 Keep typing...';
                feedback.className = 'game-feedback';
            }
        } else if (value.length > 0) {
            gameStreak = 0;
            document.getElementById('gameStreak').textContent = '0';
            
            if (feedback) {
                feedback.textContent = '❌ Wrong word!';
                feedback.className = 'game-feedback error';
            }
        }
    });
}

// Setup ninja game input
function setupNinjaInput() {
    var input = document.getElementById('gameInput');
    if (!input) return;
    
    input.addEventListener('input', function(e) {
        if (!gameActive) return;
        
        var value = e.target.value.trim().toUpperCase();
        var currentLetter = letters[currentLetterIndex];
        var feedback = document.getElementById('gameFeedback');
        
        if (value === currentLetter) {
            // Correct!
            var pointsEarned = 10;
            gameScore += pointsEarned;
            gameStreak++;
            
            document.getElementById('gameScore').textContent = gameScore;
            document.getElementById('gameCombo').textContent = gameStreak;
            document.getElementById('gameTargets').textContent = currentLetterIndex + 1;
            
            // Animate the sliced letter
            var cells = document.querySelectorAll('.letter-cell');
            if (cells[currentLetterIndex]) {
                cells[currentLetterIndex].classList.add('sliced');
                setTimeout(function() {
                    if (cells[currentLetterIndex]) {
                        cells[currentLetterIndex].style.display = 'none';
                    }
                }, 300);
            }
            
            // Move to next letter
            currentLetterIndex++;
            
            if (currentLetterIndex >= letters.length) {
                // Game completed
                if (feedback) {
                    feedback.textContent = '🎉 Amazing! You sliced all letters!';
                    feedback.className = 'game-feedback success';
                }
                endGame();
            } else {
                // Update active letter
                for (var i = 0; i < cells.length; i++) {
                    cells[i].classList.remove('active');
                    if (i === currentLetterIndex) {
                        cells[i].classList.add('active');
                    }
                }
            }
            
            if (feedback) {
                feedback.textContent = '✅ Sliced! +' + pointsEarned + ' points';
                feedback.className = 'game-feedback success';
            }
            
            e.target.value = '';
        } else if (value.length > 0) {
            gameStreak = 0;
            document.getElementById('gameCombo').textContent = '0';
            
            if (feedback) {
                feedback.textContent = '❌ Wrong letter! Type "' + currentLetter + '"';
                feedback.className = 'game-feedback error';
            }
        }
    });
}

// End game
function endGame() {
    gameActive = false;
    if (gameTimer) clearInterval(gameTimer);
    
    // Calculate WPM (for word games)
    var wpm = Math.round(gameScore / 10);
    
    // Update stats
    gameStats.gamesPlayed++;
    if (gameScore > gameStats.highScore) {
        gameStats.highScore = gameScore;
        gameStats.achievements.highscore++;
    }
    gameStats.totalPoints += gameScore;
    if (wpm > gameStats.bestWPM) {
        gameStats.bestWPM = wpm;
    }
    
    // Update achievements
    if (gameStats.gamesPlayed === 1) gameStats.achievements.first = 1;
    if (gameStreak >= 10) gameStats.achievements.speed++;
    if (gameStats.loginStreak >= 7) gameStats.achievements.streak = 1;
    
    localStorage.setItem('gameStats', JSON.stringify(gameStats));
    updateStats();
    updateAchievements();
    
    // Show game over message
    var feedback = document.getElementById('gameFeedback');
    if (feedback) {
        feedback.innerHTML = '🎮 Game Over! Final Score: ' + gameScore + '<br>WPM: ' + wpm;
        feedback.className = 'game-feedback';
    }
    
    // Disable input
    var input = document.getElementById('gameInput');
    if (input) input.disabled = true;
}

// Close game modal
function closeGameModalModule() {
    document.getElementById('gameModal').style.display = 'none';
    if (gameTimer) clearInterval(gameTimer);
    gameActive = false;
}

// Setup event listeners
function setupEventListeners() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeGameModalModule();
        }
    });
    
    var modal = document.getElementById('gameModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeGameModalModule();
            }
        });
    }
}

// Export functions for global access
window.initGames = initGames;
window.launchGameModule = launchGameModule;
window.filterGamesModule = filterGamesModule;
window.switchLeaderboardModule = switchLeaderboardModule;
window.claimDailyRewardModule = claimDailyRewardModule;
window.closeGameModalModule = closeGameModalModule;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initGames();
});
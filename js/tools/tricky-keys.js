/* ================= TRICKY KEYS GAME LOGIC v3.0 ================= */
/* AdSense Optimized - High Quality Interactive Features */

// Key categories
const keyCategories = {
    'home-row': ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    'top-row': ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    'bottom-row': ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    'numbers': ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
};

// All characters for random mode
var allCharacters = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
    ';', ',', '.', '/', '[', ']', '\\'
];

// Category display names
var categoryDisplayNames = {
    'home-row': 'Home Row',
    'top-row': 'Top Row',
    'bottom-row': 'Bottom Row',
    'numbers': 'Numbers',
    'random': 'Random Mode'
};

// Keyboard layout
var keyboardLayout = {
    row1: ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    row2: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    row3: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''],
    row4: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
};

// State variables
var currentCategory = 'home-row';
var currentKeys = keyCategories['home-row'];
var targetKey = currentKeys[0];
var practiceText = '';
var typedHistory = [];
var stats = {
    total: 0,
    correct: 0,
    mistakes: 0,
    streak: 0,
    maxStreak: 0
};
var problemKeys = JSON.parse(localStorage.getItem('problemKeys') || '{}');
var practiceHistory = JSON.parse(localStorage.getItem('practiceHistory') || '[]');
var targetCompleted = false;
var isProcessingKey = false;

// DOM Elements
var userInput, targetKeyEl, targetCharsEl, typedCharsEl;
var accuracyEl, keysPressedEl, mistakesEl, streakEl;
var problemKeysContainer, recentPracticeContainer, suggestionsEl;

// Initialize game
function initTrickyKeys() {
    console.log('Tricky Keys initialized');
    
    // Cache DOM elements
    userInput = document.getElementById('userInput');
    targetKeyEl = document.getElementById('targetKey');
    targetCharsEl = document.getElementById('targetChars');
    typedCharsEl = document.getElementById('typedChars');
    accuracyEl = document.getElementById('keyAccuracy');
    keysPressedEl = document.getElementById('keysPressed');
    mistakesEl = document.getElementById('keyMistakes');
    streakEl = document.getElementById('keyStreak');
    problemKeysContainer = document.getElementById('problemKeys');
    recentPracticeContainer = document.getElementById('recentPractice');
    suggestionsEl = document.getElementById('keySuggestions');
    
    // Draw keyboard
    drawKeyboard();
    
    // Load saved stats
    loadSavedStats();
    
    // Generate practice text
    generatePracticeText();
    
    // Update displays
    updateTargetKey();
    updateTargetChars();
    updateTypedChars();
    updateStatsDisplay();
    updateProblemKeys();
    loadRecentPractice();
    generateSuggestions();
    
    // Focus on hidden input
    setTimeout(function() {
        if (userInput) userInput.focus();
    }, 500);
}

// Draw keyboard
function drawKeyboard() {
    for (var i = 1; i <= 4; i++) {
        var rowElement = document.getElementById('keyboardRow' + i);
        if (!rowElement) continue;
        
        var keys = keyboardLayout['row' + i];
        var html = '';
        for (var j = 0; j < keys.length; j++) {
            html += '<div class="keyboard-key" data-key="' + keys[j] + '">' + keys[j] + '</div>';
        }
        rowElement.innerHTML = html;
    }
}

// Load saved stats
function loadSavedStats() {
    var savedStats = localStorage.getItem('trickyStats');
    if (savedStats) {
        var parsed = JSON.parse(savedStats);
        stats.total = parsed.total || 0;
        stats.correct = parsed.correct || 0;
        stats.mistakes = parsed.mistakes || 0;
        stats.maxStreak = parsed.maxStreak || 0;
    }
}

// Save stats
function saveStats() {
    localStorage.setItem('trickyStats', JSON.stringify({
        total: stats.total,
        correct: stats.correct,
        mistakes: stats.mistakes,
        maxStreak: stats.maxStreak
    }));
    localStorage.setItem('problemKeys', JSON.stringify(problemKeys));
}

// Generate practice text
function generatePracticeText() {
    var length = 8 + Math.floor(Math.random() * 5); // 8-12 chars
    var text = '';
    
    if (currentCategory === 'random') {
        for (var i = 0; i < length; i++) {
            var randomIndex = Math.floor(Math.random() * allCharacters.length);
            text += allCharacters[randomIndex];
            if (i < length - 1) text += ' ';
        }
    } else {
        for (var i = 0; i < length; i++) {
            var randomIndex = Math.floor(Math.random() * currentKeys.length);
            text += currentKeys[randomIndex];
            if (i < length - 1) text += ' ';
        }
    }
    
    practiceText = text;
    typedHistory = [];
    targetCompleted = false;
}

// Update target key display
function updateTargetKey() {
    if (targetKeyEl) targetKeyEl.textContent = targetKey;
    
    // Highlight on keyboard
    var keys = document.querySelectorAll('.keyboard-key');
    for (var i = 0; i < keys.length; i++) {
        var el = keys[i];
        el.classList.remove('active');
        if (el.getAttribute('data-key') === targetKey) {
            el.classList.add('active');
        }
    }
}

// Update target chars display
function updateTargetChars() {
    if (!targetCharsEl) return;
    
    var html = '';
    var chars = practiceText.split('');
    
    for (var i = 0; i < chars.length; i++) {
        var char = chars[i];
        if (char === ' ') {
            html += '<span class="space"> </span>';
        } else if (i < typedHistory.length && typedHistory[i] === char) {
            html += '<span class="completed">' + char + '</span>';
        } else {
            html += '<span>' + char + '</span>';
        }
    }
    targetCharsEl.innerHTML = html;
}

// Update typed chars display
function updateTypedChars() {
    if (!typedCharsEl) return;
    
    var targetChars = practiceText.split('');
    var html = '';
    
    for (var i = 0; i < typedHistory.length; i++) {
        var char = typedHistory[i];
        if (i < targetChars.length) {
            var isCorrect = (char === targetChars[i]);
            html += '<span class="' + (isCorrect ? 'correct' : 'incorrect') + '">' + char + '</span>';
        } else {
            html += '<span>' + char + '</span>';
        }
    }
    typedCharsEl.innerHTML = html;
    
    // Check if all characters are typed
    var allTyped = typedHistory.length >= targetChars.length;
    
    if (allTyped && !targetCompleted) {
        targetCompleted = true;
        
        // Clear after delay
        setTimeout(function() {
            typedHistory = [];
            generatePracticeText();
            updateTargetChars();
            updateTypedChars();
            targetCompleted = false;
            
            // Update current category display for random mode
            if (currentCategory === 'random') {
                var categoryDisplay = document.getElementById('currentCategory');
                if (categoryDisplay) categoryDisplay.textContent = 'Random Mode';
            }
        }, 1000);
    }
}

// Update stats display
function updateStatsDisplay() {
    var accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 100;
    if (accuracyEl) accuracyEl.textContent = accuracy + '%';
    if (keysPressedEl) keysPressedEl.textContent = stats.total;
    if (mistakesEl) mistakesEl.textContent = stats.mistakes;
    if (streakEl) streakEl.textContent = stats.streak;
}

// Update stats
function updateStats(key, isCorrect) {
    stats.total++;
    
    if (isCorrect) {
        stats.correct++;
        stats.streak++;
        if (stats.streak > stats.maxStreak) {
            stats.maxStreak = stats.streak;
        }
    } else {
        stats.mistakes++;
        stats.streak = 0;
        
        // Track problem keys
        if (!problemKeys[key]) {
            problemKeys[key] = 0;
        }
        problemKeys[key]++;
    }
    
    updateStatsDisplay();
    saveStats();
}

// Update problem keys display
function updateProblemKeys() {
    if (!problemKeysContainer) return;
    
    var problems = Object.entries(problemKeys);
    problems.sort(function(a, b) { return b[1] - a[1]; });
    problems = problems.slice(0, 8);
    
    if (problems.length === 0) {
        problemKeysContainer.innerHTML = '<div class="no-problems">Practice to see your problem keys</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < problems.length; i++) {
        var key = problems[i][0];
        var count = problems[i][1];
        html += '<div class="problem-key" title="Mistakes: ' + count + '">' + key + '</div>';
    }
    problemKeysContainer.innerHTML = html;
}

// Load recent practice history
function loadRecentPractice() {
    if (!recentPracticeContainer) return;
    
    if (practiceHistory.length === 0) {
        recentPracticeContainer.innerHTML = '<div class="no-problems">No practice history yet</div>';
        return;
    }
    
    var html = '';
    var start = Math.max(0, practiceHistory.length - 5);
    for (var i = practiceHistory.length - 1; i >= start; i--) {
        var item = practiceHistory[i];
        html += '<div class="history-item">' +
            '<div class="date">' + item.date + '</div>' +
            '<div class="keys">' + item.category + ' - ' + item.keys + ' keys</div>' +
            '<div class="accuracy">' + item.accuracy + '% accuracy</div>' +
        '</div>';
    }
    recentPracticeContainer.innerHTML = html;
}

// Save practice session
function savePracticeSession() {
    var accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    var categoryName = categoryDisplayNames[currentCategory] || currentCategory;
    
    practiceHistory.push({
        date: new Date().toLocaleDateString(),
        category: categoryName,
        accuracy: accuracy,
        keys: stats.total
    });
    
    if (practiceHistory.length > 20) {
        practiceHistory = practiceHistory.slice(-20);
    }
    
    localStorage.setItem('practiceHistory', JSON.stringify(practiceHistory));
    loadRecentPractice();
}

// Generate suggestions
function generateSuggestions() {
    if (!suggestionsEl) return;
    
    var problems = Object.entries(problemKeys);
    problems.sort(function(a, b) { return b[1] - a[1]; });
    problems = problems.slice(0, 3);
    
    var suggestionText = '🎯 Practice suggestion: ';
    if (problems.length > 0) {
        suggestionText += 'Focus on keys: ';
        for (var i = 0; i < problems.length; i++) {
            if (i > 0) suggestionText += ', ';
            suggestionText += problems[i][0];
        }
        suggestionText += ' - 5 minutes daily shows 40% improvement';
    } else {
        suggestionText += 'Keep practicing! You\'re doing great!';
    }
    
    suggestionsEl.innerHTML = suggestionText;
}

// Show notification
function showNotification(message, isSuccess) {
    var success = (isSuccess !== undefined) ? isSuccess : true;
    var notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: ' + (success ? '#10b981' : '#ef4444') + '; color: white; padding: 12px 24px; border-radius: 50px; z-index: 1000; animation: slideDown 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.2); font-weight: 600;';
    
    document.body.appendChild(notification);
    
    setTimeout(function() {
        notification.remove();
    }, 3000);
}

// Reset stats
function resetTrickyStats() {
    if (confirm('Reset all practice stats? This cannot be undone.')) {
        stats = { total: 0, correct: 0, mistakes: 0, streak: 0, maxStreak: 0 };
        problemKeys = {};
        practiceHistory = [];
        
        localStorage.removeItem('trickyStats');
        localStorage.removeItem('problemKeys');
        localStorage.removeItem('practiceHistory');
        
        updateStatsDisplay();
        updateProblemKeys();
        loadRecentPractice();
        generateSuggestions();
        
        showNotification('Stats reset successfully!', true);
    }
}

// Load category
function loadCategory(category) {
    console.log('Loading category:', category);
    
    // Reset state
    currentCategory = category;
    targetCompleted = false;
    isProcessingKey = false;
    
    // Update active button
    var btns = document.querySelectorAll('.category-btn');
    for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    }
    
    // Update category display
    var categoryDisplay = document.getElementById('currentCategory');
    if (categoryDisplay) {
        categoryDisplay.textContent = categoryDisplayNames[category] || category;
    }
    
    if (category === 'random') {
        currentKeys = allCharacters;
        generatePracticeText();
        
        // Set random target key
        var randomIndex = Math.floor(Math.random() * allCharacters.length);
        targetKey = allCharacters[randomIndex];
    } else {
        currentKeys = keyCategories[category] || keyCategories['home-row'];
        generatePracticeText();
        
        // Set first key as target
        if (currentKeys && currentKeys.length > 0) {
            targetKey = currentKeys[0];
        }
    }
    
    // Reset typed history
    typedHistory = [];
    
    // Update displays
    updateTargetKey();
    updateTargetChars();
    updateTypedChars();
    
    var modeName = categoryDisplayNames[category] || category;
    showNotification('Switched to ' + modeName + ' mode', true);
}

// Handle key press
function handleKeyPress(key) {
    if (isProcessingKey) return;
    isProcessingKey = true;
    
    // Update keyboard highlight
    var keys = document.querySelectorAll('.keyboard-key');
    for (var i = 0; i < keys.length; i++) {
        var el = keys[i];
        if (el.getAttribute('data-key') === key) {
            el.classList.remove('correct', 'incorrect');
            
            var isCorrect = (key === targetKey);
            if (isCorrect) {
                el.classList.add('correct');
            } else {
                el.classList.add('incorrect');
            }
            
            setTimeout(function(elem) {
                return function() {
                    elem.classList.remove('correct', 'incorrect');
                };
            }(el), 400);
        }
    }
    
    // Check if key is valid for current mode
    var isValid = false;
    if (currentCategory === 'random') {
        isValid = true;
    } else {
        for (var j = 0; j < currentKeys.length; j++) {
            if (currentKeys[j] === key) {
                isValid = true;
                break;
            }
        }
    }
    
    if (isValid) {
        var isCorrect = (key === targetKey);
        
        // Add to typed history
        typedHistory.push(key);
        updateTypedChars();
        updateTargetChars();
        
        // Update stats
        updateStats(key, isCorrect);
        
        if (isCorrect) {
            // Update target key
            if (currentCategory === 'random') {
                var randomIndex = Math.floor(Math.random() * allCharacters.length);
                targetKey = allCharacters[randomIndex];
            } else {
                var currentIndex = -1;
                for (var k = 0; k < currentKeys.length; k++) {
                    if (currentKeys[k] === targetKey) {
                        currentIndex = k;
                        break;
                    }
                }
                var nextIndex = (currentIndex + 1) % currentKeys.length;
                targetKey = currentKeys[nextIndex];
            }
            updateTargetKey();
        }
        
        // Update problem keys every 10 attempts
        if (stats.total % 10 === 0) {
            updateProblemKeys();
            generateSuggestions();
        }
        
        // Save practice session every 20 attempts
        if (stats.total > 0 && stats.total % 20 === 0) {
            savePracticeSession();
        }
    }
    
    setTimeout(function() {
        isProcessingKey = false;
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    if (userInput) {
        userInput.addEventListener('keydown', function(e) {
            e.preventDefault();
            
            var key = e.key;
            
            if (key === 'Backspace') {
                if (typedHistory.length > 0) {
                    typedHistory.pop();
                    updateTypedChars();
                    updateTargetChars();
                }
                return;
            }
            
            // Regular expression for valid characters
            var validPattern = /^[a-z0-9;,.\\/\[\]\\]$/i;
            if (key.length === 1 && validPattern.test(key)) {
                handleKeyPress(key.toLowerCase());
            }
        });
    }
    
    // Click anywhere to focus input
    document.addEventListener('click', function() {
        if (userInput) userInput.focus();
    });
}

// Save on page unload
window.addEventListener('beforeunload', function() {
    if (stats.total > 0) {
        savePracticeSession();
    }
});

// Export functions for global access
window.initTrickyKeys = initTrickyKeys;
window.loadCategory = loadCategory;
window.resetTrickyStats = resetTrickyStats;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
});
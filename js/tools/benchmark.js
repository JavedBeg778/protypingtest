/* ================= TYPING BENCHMARK LOGIC v2.0 ================= */
/* AdSense Optimized - High Quality Interactive Features */

// Benchmark texts for different levels
var benchmarkTexts = {
    'beginner': [
        "The quick brown fox jumps over the lazy dog near the river bank.",
        "She sells sea shells on the sea shore but the shells she sells are sea shells.",
        "How much wood would a woodchuck chuck if a woodchuck could chuck wood?",
        "Peter Piper picked a peck of pickled peppers. A peck of pickled peppers Peter Piper picked."
    ],
    'intermediate': [
        "Typing is an essential skill in the modern digital world. It allows you to communicate quickly and efficiently.",
        "The ability to type quickly and accurately can save you hours of time each week, especially if you work with computers.",
        "Practice makes perfect when it comes to typing. The more you type, the faster and more accurate you will become.",
        "Touch typing is a method of typing without looking at the keyboard. It significantly increases your typing speed."
    ],
    'advanced': [
        "In the rapidly evolving landscape of technology, the ability to type efficiently has become a fundamental skill for professionals across all industries, from software development to content creation.",
        "The human brain processes information at an astonishing rate, but our hands often struggle to keep up. This is why practicing typing regularly can help bridge the gap between thought and expression.",
        "Ergonomics plays a crucial role in typing efficiency and long-term health. Maintaining proper posture, hand positioning, and taking regular breaks can prevent repetitive strain injuries."
    ],
    'professional': [
        "The history of the typewriter dates back to the early 18th century, with the first practical typewriter invented by Christopher Latham Sholes in 1868. This invention revolutionized written communication and paved the way for modern keyboards.",
        "Cognitive psychology research suggests that typing fluency is closely linked to language processing centers in the brain. As typing becomes more automatic, cognitive resources are freed up for higher-level thinking and composition.",
        "The QWERTY keyboard layout was designed to prevent mechanical jams in early typewriters by placing commonly used letter pairs apart. Despite more efficient layouts like Dvorak, QWERTY remains the global standard."
    ],
    'expert': [
        "The evolution of human-computer interaction has transformed the way we communicate, work, and create. From the earliest mechanical keyboards to modern touchscreens and voice recognition, each advancement has brought new challenges and opportunities for efficiency.",
        "Neural plasticity allows the brain to adapt and form new neural pathways through repeated practice. This is why consistent typing practice can lead to remarkable improvements in speed and accuracy, as the brain optimizes the neural circuits involved in finger movements.",
        "The average professional spends approximately 3-4 hours per day typing, which amounts to nearly 1,000 hours per year. Even a 10% improvement in typing efficiency can save hundreds of hours annually."
    ],
    'elite': [
        "The world record for typing speed stands at over 200 words per minute, achieved through years of dedicated practice and often using alternative keyboard layouts like Stenotype. This remarkable feat demonstrates the incredible potential of human adaptability when combined with optimal tools and techniques.",
        "Research in motor learning suggests that the key to achieving expert-level performance lies in deliberate practice - focused, goal-oriented training with immediate feedback. This principle applies not only to typing but to any skill acquisition process."
    ]
};

// Benchmark configuration
var benchmarkConfig = {
    'beginner': { wpmTarget: 20, percentile: 45, color: '#10b981', icon: '🌱', level: 'Beginner' },
    'intermediate': { wpmTarget: 40, percentile: 30, color: '#06b6d4', icon: '📚', level: 'Intermediate' },
    'advanced': { wpmTarget: 60, percentile: 15, color: '#f59e0b', icon: '⚡', level: 'Advanced' },
    'professional': { wpmTarget: 80, percentile: 7, color: '#f97316', icon: '💼', level: 'Professional' },
    'expert': { wpmTarget: 100, percentile: 3, color: '#ef4444', icon: '🏆', level: 'Expert' },
    'elite': { wpmTarget: 120, percentile: 1, color: '#8b5cf6', icon: '⭐', level: 'Elite' }
};

// State variables
var currentBenchmark = null;
var benchmarkActive = false;
var benchmarkText = '';
var benchmarkWords = [];
var startTime = null;
var timerInterval = null;
var timeLeft = 60;
var userInputValue = '';
var wordIndex = 0;
var correctChars = 0;
var totalChars = 0;
var errors = 0;
var benchmarkHistory = JSON.parse(localStorage.getItem('benchmarkHistory')) || [];

// DOM Elements
var userInput, testText, timerDisplay, progressFill;
var liveWPM, liveAccuracy, liveWords, liveErrors;
var totalWordsSpan;

// Initialize benchmark
function initBenchmark() {
    console.log('Benchmark page initialized');
    
    // Cache DOM elements
    userInput = document.getElementById('userInput');
    testText = document.getElementById('testText');
    timerDisplay = document.getElementById('timer');
    progressFill = document.getElementById('progressFill');
    liveWPM = document.getElementById('liveWPM');
    liveAccuracy = document.getElementById('liveAccuracy');
    liveWords = document.getElementById('liveWords');
    liveErrors = document.getElementById('liveErrors');
    totalWordsSpan = document.getElementById('totalWords');
    
    // Load data
    loadBestScores();
    loadLeaderboard();
    loadProgressChart();
    loadBadges();
    updateStats();
}

// Load best scores from history
function loadBestScores() {
    var container = document.getElementById('bestScores');
    if (!container) return;
    
    var topScores = benchmarkHistory.slice();
    topScores.sort(function(a, b) { return b.wpm - a.wpm; });
    topScores = topScores.slice(0, 5);
    
    if (topScores.length === 0) {
        container.innerHTML = '<div class="no-data">No benchmarks yet</div>';
        return;
    }
    
    var html = '';
    for (var i = 0; i < topScores.length; i++) {
        var score = topScores[i];
        html += '<div class="history-item">' +
            '<div class="date">' + score.date + '</div>' +
            '<div class="score">' + score.wpm + ' WPM - ' + score.accuracy + '%</div>' +
        '</div>';
    }
    container.innerHTML = html;
}

// Load leaderboard
function loadLeaderboard() {
    var container = document.getElementById('leaderboard');
    if (!container) return;
    
    var leaderboard = [
        { rank: 1, name: 'SpeedDemon', score: 158 },
        { rank: 2, name: 'TypingMaster', score: 152 },
        { rank: 3, name: 'KeyKnight', score: 147 },
        { rank: 4, name: 'FingerFury', score: 143 },
        { rank: 5, name: 'WordWizard', score: 139 },
        { rank: 6, name: 'TypeTitan', score: 135 },
        { rank: 7, name: 'KeyKings', score: 132 },
        { rank: 8, name: 'SpeedStar', score: 128 },
        { rank: 9, name: 'TypoTerminator', score: 125 },
        { rank: 10, name: 'QuickQuill', score: 121 }
    ];
    
    var html = '';
    for (var i = 0; i < leaderboard.length; i++) {
        var item = leaderboard[i];
        html += '<div class="leaderboard-item">' +
            '<span class="leaderboard-rank">#' + item.rank + '</span>' +
            '<span class="leaderboard-name">' + item.name + '</span>' +
            '<span class="leaderboard-score">' + item.score + ' WPM</span>' +
        '</div>';
    }
    container.innerHTML = html;
}

// Load progress chart
function loadProgressChart() {
    var container = document.getElementById('progressChart');
    if (!container) return;
    
    var lastScores = [];
    var start = Math.max(0, benchmarkHistory.length - 7);
    for (var i = start; i < benchmarkHistory.length; i++) {
        lastScores.push(benchmarkHistory[i].wpm);
    }
    
    while (lastScores.length < 7) {
        lastScores.unshift(0);
    }
    
    var maxScore = 50;
    for (var i = 0; i < lastScores.length; i++) {
        if (lastScores[i] > maxScore) maxScore = lastScores[i];
    }
    if (maxScore < 20) maxScore = 20;
    
    var html = '';
    for (var i = 0; i < lastScores.length; i++) {
        var score = lastScores[i];
        var height = score > 0 ? (score / maxScore) * 70 : 10;
        if (height < 4) height = 4;
        html += '<div class="chart-column" style="height: ' + height + 'px" title="' + score + ' WPM"></div>';
    }
    container.innerHTML = html;
}

// Load badges
function loadBadges() {
    var container = document.getElementById('badgeGrid');
    if (!container) return;
    
    var badges = [
        { icon: '🏁', name: 'Beginner', unlocked: hasCompletedLevel('beginner') },
        { icon: '🚀', name: 'Intermediate', unlocked: hasCompletedLevel('intermediate') },
        { icon: '⚡', name: 'Advanced', unlocked: hasCompletedLevel('advanced') },
        { icon: '💼', name: 'Professional', unlocked: hasCompletedLevel('professional') },
        { icon: '🎓', name: 'Expert', unlocked: hasCompletedLevel('expert') },
        { icon: '👑', name: 'Elite', unlocked: hasCompletedLevel('elite') }
    ];
    
    var html = '';
    for (var i = 0; i < badges.length; i++) {
        var badge = badges[i];
        html += '<div class="badge-item ' + (badge.unlocked ? 'unlocked' : 'locked') + '">' +
            '<div class="badge-icon">' + badge.icon + '</div>' +
            '<div class="badge-name">' + badge.name + '</div>' +
        '</div>';
    }
    container.innerHTML = html;
}

// Check if user completed a level
function hasCompletedLevel(level) {
    for (var i = 0; i < benchmarkHistory.length; i++) {
        if (benchmarkHistory[i].level === level && benchmarkHistory[i].wpm >= benchmarkConfig[level].wpmTarget * 0.8) {
            return true;
        }
    }
    return false;
}

// Update stats
function updateStats() {
    var bestWPM = 0;
    for (var i = 0; i < benchmarkHistory.length; i++) {
        if (benchmarkHistory[i].wpm > bestWPM) bestWPM = benchmarkHistory[i].wpm;
    }
    
    var totalAccuracy = 0;
    for (var i = 0; i < benchmarkHistory.length; i++) {
        totalAccuracy += benchmarkHistory[i].accuracy;
    }
    var avgAccuracy = benchmarkHistory.length > 0 ? Math.round(totalAccuracy / benchmarkHistory.length) : 0;
    
    var bestWPMElem = document.getElementById('bestWPM');
    var testsTakenElem = document.getElementById('testsTaken');
    var avgAccuracyElem = document.getElementById('avgAccuracy');
    
    if (bestWPMElem) bestWPMElem.textContent = bestWPM;
    if (testsTakenElem) testsTakenElem.textContent = benchmarkHistory.length;
    if (avgAccuracyElem) avgAccuracyElem.textContent = avgAccuracy + '%';
}

// Start benchmark test
function startBenchmarkTest(level) {
    if (benchmarkActive) return;
    
    currentBenchmark = level;
    benchmarkActive = true;
    
    var texts = benchmarkTexts[level];
    var randomIndex = Math.floor(Math.random() * texts.length);
    benchmarkText = texts[randomIndex];
    benchmarkWords = benchmarkText.split(' ');
    
    timeLeft = 60;
    userInputValue = '';
    wordIndex = 0;
    correctChars = 0;
    totalChars = 0;
    errors = 0;
    startTime = null;
    
    // Hide categories, show test area
    var categories = document.getElementById('benchmarkCategories');
    var testArea = document.getElementById('testArea');
    var resultsArea = document.getElementById('resultsArea');
    
    if (categories) categories.style.display = 'none';
    if (testArea) testArea.style.display = 'block';
    if (resultsArea) resultsArea.style.display = 'none';
    
    // Update UI
    var benchmarkLevelElem = document.getElementById('benchmarkLevel');
    var levelName = benchmarkConfig[level].level;
    if (benchmarkLevelElem) benchmarkLevelElem.textContent = levelName + ' Benchmark';
    
    if (testText) testText.innerHTML = highlightText(benchmarkText, '');
    if (userInput) userInput.value = '';
    if (userInput) userInput.focus();
    if (timerDisplay) timerDisplay.textContent = '1:00';
    if (liveWPM) liveWPM.textContent = '0';
    if (liveAccuracy) liveAccuracy.textContent = '100%';
    if (liveWords) liveWords.textContent = '0/' + benchmarkWords.length;
    if (liveErrors) liveErrors.textContent = '0';
    if (totalWordsSpan) totalWordsSpan.textContent = benchmarkWords.length;
    if (progressFill) progressFill.style.width = '0%';
}

// Highlight text based on input
function highlightText(text, input) {
    var words = text.split(' ');
    var inputWords = input.split(' ');
    
    var result = '';
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (i < inputWords.length - 1) {
            var isCorrect = (word === inputWords[i]);
            result += '<span class="' + (isCorrect ? 'correct-word' : 'incorrect-word') + '">' + word + '</span>';
        } else if (i === inputWords.length - 1) {
            var inputWord = inputWords[i] || '';
            var highlighted = '';
            for (var j = 0; j < word.length; j++) {
                if (j < inputWord.length) {
                    if (word[j] === inputWord[j]) {
                        highlighted += '<span class="correct-char">' + word[j] + '</span>';
                    } else {
                        highlighted += '<span class="incorrect-char">' + word[j] + '</span>';
                    }
                } else {
                    highlighted += '<span class="pending-char">' + word[j] + '</span>';
                }
            }
            result += '<span class="current-word">' + highlighted + '</span>';
        } else {
            result += '<span class="future-word">' + word + '</span>';
        }
        if (i < words.length - 1) result += ' ';
    }
    return result;
}

// Start timer
function startBenchmarkTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(function() {
        if (!benchmarkActive) return;
        
        timeLeft--;
        
        var mins = Math.floor(timeLeft / 60);
        var secs = timeLeft % 60;
        if (timerDisplay) timerDisplay.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
        
        var progress = ((60 - timeLeft) / 60) * 100;
        if (progressFill) progressFill.style.width = progress + '%';
        
        if (timeLeft <= 0) {
            endBenchmark();
        }
    }, 1000);
}

// Calculate WPM
function calculateWPM() {
    if (!startTime) return 0;
    var minutes = (Date.now() - startTime) / 60000;
    var wordsTyped = correctChars / 5;
    return Math.round(wordsTyped / minutes);
}

// Calculate percentile
function calculatePercentile(wpm, level) {
    var config = benchmarkConfig[level];
    var target = config.wpmTarget;
    var ratio = wpm / target;
    
    if (ratio >= 1) return 95 + Math.round((ratio - 1) * 5);
    if (ratio >= 0.9) return 80 + Math.round((ratio - 0.9) * 150);
    if (ratio >= 0.7) return 50 + Math.round((ratio - 0.7) * 150);
    if (ratio >= 0.5) return 20 + Math.round((ratio - 0.5) * 150);
    return Math.round(ratio * 40);
}

// End benchmark
function endBenchmark() {
    benchmarkActive = false;
    if (timerInterval) clearInterval(timerInterval);
    
    var wpm = calculateWPM();
    var accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    var percentile = calculatePercentile(wpm, currentBenchmark);
    var config = benchmarkConfig[currentBenchmark];
    
    // Save to history
    var result = {
        date: new Date().toLocaleDateString(),
        level: currentBenchmark,
        wpm: wpm,
        accuracy: accuracy,
        percentile: percentile
    };
    benchmarkHistory.push(result);
    localStorage.setItem('benchmarkHistory', JSON.stringify(benchmarkHistory));
    
    // Update UI
    var testArea = document.getElementById('testArea');
    var resultsArea = document.getElementById('resultsArea');
    var categories = document.getElementById('benchmarkCategories');
    
    if (testArea) testArea.style.display = 'none';
    if (resultsArea) resultsArea.style.display = 'block';
    if (categories) categories.style.display = 'none';
    
    var resultWPM = document.getElementById('resultWPM');
    var resultAccuracy = document.getElementById('resultAccuracy');
    var resultPercentile = document.getElementById('resultPercentile');
    var resultLevel = document.getElementById('resultLevel');
    var resultMessage = document.getElementById('resultMessage');
    var resultsIcon = document.getElementById('resultsIcon');
    
    if (resultWPM) resultWPM.textContent = wpm;
    if (resultAccuracy) resultAccuracy.textContent = accuracy + '%';
    if (resultPercentile) resultPercentile.textContent = percentile + '%';
    if (resultsIcon) resultsIcon.textContent = config.icon;
    
    if (resultLevel) {
        resultLevel.textContent = config.level;
        resultLevel.style.background = config.color + '20';
        resultLevel.style.color = config.color;
    }
    
    var message = '';
    if (wpm >= config.wpmTarget) {
        message = '🎉 Excellent! You\'ve mastered the ' + config.level + ' level! Your typing skills are outstanding!';
    } else if (wpm >= config.wpmTarget * 0.7) {
        message = '👍 Good job! You\'re close to the ' + config.level + ' level! Keep practicing to reach your goal.';
    } else {
        message = '💪 Keep practicing! You\'ll reach the ' + config.level + ' level soon. Try our typing lessons to improve faster.';
    }
    if (resultMessage) resultMessage.textContent = message;
    
    // Refresh data
    loadBestScores();
    loadProgressChart();
    loadBadges();
    updateStats();
}

// Cancel benchmark
function cancelBenchmarkTest() {
    if (confirm('Cancel this benchmark test?')) {
        benchmarkActive = false;
        if (timerInterval) clearInterval(timerInterval);
        
        var testArea = document.getElementById('testArea');
        var categories = document.getElementById('benchmarkCategories');
        var resultsArea = document.getElementById('resultsArea');
        
        if (testArea) testArea.style.display = 'none';
        if (categories) categories.style.display = 'grid';
        if (resultsArea) resultsArea.style.display = 'none';
    }
}

// Retake benchmark
function retakeBenchmarkTest() {
    var resultsArea = document.getElementById('resultsArea');
    var categories = document.getElementById('benchmarkCategories');
    
    if (resultsArea) resultsArea.style.display = 'none';
    if (categories) categories.style.display = 'grid';
}

// Share result
function shareBenchmarkResult() {
    var wpmElem = document.getElementById('resultWPM');
    var accuracyElem = document.getElementById('resultAccuracy');
    var percentileElem = document.getElementById('resultPercentile');
    
    var wpm = wpmElem ? wpmElem.textContent : '0';
    var accuracy = accuracyElem ? accuracyElem.textContent : '0%';
    var percentile = percentileElem ? percentileElem.textContent : '0%';
    
    var text = 'I just scored ' + wpm + ' WPM with ' + accuracy + ' accuracy on the typing benchmark! I\'m in the top ' + percentile + ' percentile! 🚀 #ProTypingTest';
    
    if (navigator.share) {
        navigator.share({
            title: 'My Typing Benchmark Result',
            text: text,
            url: window.location.href
        }).catch(function() {
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert('✅ Result copied to clipboard! Share it with your friends.');
    }).catch(function() {
        alert('📤 Share your achievement: ' + text);
    });
}

// Input handling
if (document.getElementById('userInput')) {
    document.getElementById('userInput').addEventListener('input', function(e) {
        if (!benchmarkActive) return;
        
        var input = e.target.value;
        
        if (!startTime && input.length > 0) {
            startTime = Date.now();
            startBenchmarkTimer();
        }
        
        if (testText) testText.innerHTML = highlightText(benchmarkText, input);
        
        var inputWords = input.split(' ');
        var correct = 0;
        var total = 0;
        var errs = 0;
        
        for (var i = 0; i < inputWords.length - 1; i++) {
            if (i < benchmarkWords.length) {
                if (inputWords[i] === benchmarkWords[i]) {
                    correct += benchmarkWords[i].length;
                } else {
                    errs++;
                }
                total += benchmarkWords[i].length;
            }
        }
        
        var currentWordIndex = inputWords.length - 1;
        if (currentWordIndex < benchmarkWords.length && inputWords[currentWordIndex]) {
            var currentWord = benchmarkWords[currentWordIndex];
            var currentInput = inputWords[currentWordIndex];
            
            for (var j = 0; j < currentInput.length; j++) {
                if (j < currentWord.length) {
                    if (currentInput[j] === currentWord[j]) {
                        correct++;
                    } else {
                        errs++;
                    }
                    total++;
                }
            }
        }
        
        correctChars = correct;
        totalChars = total;
        errors = errs;
        
        var wpm = calculateWPM();
        var accuracyVal = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
        
        if (liveWPM) liveWPM.textContent = wpm;
        if (liveAccuracy) liveAccuracy.textContent = accuracyVal + '%';
        if (liveWords) liveWords.textContent = (inputWords.length - 1) + '/' + benchmarkWords.length;
        if (liveErrors) liveErrors.textContent = errors;
        
        if (inputWords.length - 1 >= benchmarkWords.length && input.endsWith(' ')) {
            endBenchmark();
        }
    });
}

// Export functions
window.initBenchmark = initBenchmark;
window.startBenchmarkTest = startBenchmarkTest;
window.cancelBenchmarkTest = cancelBenchmarkTest;
window.retakeBenchmarkTest = retakeBenchmarkTest;
window.shareBenchmarkResult = shareBenchmarkResult;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initBenchmark();
});
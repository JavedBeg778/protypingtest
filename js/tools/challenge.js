/* ================= TYPING CHALLENGE LOGIC v2.0 ================= */
/* AdSense Optimized - High Quality Interactive Features */

// Challenge data
var challengesData = {
    daily: [
        {
            id: 'daily-1',
            title: 'Daily Sprint',
            description: 'Type as fast as you can in 2 minutes',
            icon: '⚡',
            prize: 'Target 95%',
            participants: '5 min',
            difficulty: 'Medium',
            duration: 120,
            text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Bright vixens jump; dozy fowl quack. Sphinx of black quartz, judge my vow. Waltz, bad nymph, for quick jigs vex!',
            progress: 0
        },
        {
            id: 'daily-2',
            title: 'Accuracy Challenge',
            description: 'Maintain high accuracy for 3 minutes',
            icon: '🎯',
            prize: 'Target 95%',
            participants: '5 min',
            difficulty: 'Hard',
            duration: 180,
            text: 'Accuracy is more important than speed. Take your time to type each word correctly. Focus on proper finger positioning and smooth keystrokes. Remember that accuracy builds the foundation for speed.',
            progress: 0
        },
        {
            id: 'daily-3',
            title: 'Word Burst',
            description: 'Type 50 words as quickly as possible',
            icon: '💥',
            prize: 'Target 95%',
            participants: '5 min',
            difficulty: 'Easy',
            duration: 0,
            text: 'cat dog sun car book tree fish bird house phone computer keyboard screen window garden office school family travel weather mountain river ocean forest cloud star moon planet',
            progress: 0
        }
    ],
    weekly: [
        {
            id: 'weekly-1',
            title: 'Speed Demon',
            description: 'Highest WPM wins',
            icon: '👿',
            prize: 'Target 95%',
            participants: '5 min',
            difficulty: 'Expert',
            duration: 300,
            text: 'The ability to type quickly and accurately is an essential skill in the modern digital world. Whether you are a student writing essays, a professional composing emails, or a programmer writing code, your typing speed can significantly impact your productivity. The average person types at about 40 words per minute, but with practice, you can achieve speeds of 60, 80, or even 100 words per minute. Professional typists and transcriptionists often reach speeds of 100+ WPM. The world record for typing speed is over 200 words per minute!',
            progress: 0
        },
        {
            id: 'weekly-2',
            title: 'Marathon',
            description: 'Type for 10 minutes straight',
            icon: '🏃',
            prize: 'Target 95%',
            participants: '5 min',
            difficulty: 'Medium',
            duration: 600,
            text: 'Endurance is key in long typing sessions. This marathon challenge tests your ability to maintain focus and consistency over an extended period. Take deep breaths, maintain proper posture, and keep a steady rhythm. Remember to stretch your fingers and wrists periodically to prevent strain. The goal is not just speed, but consistent performance throughout the entire duration. Good luck!',
            progress: 0
        }
    ],
    monthly: [
        {
            id: 'monthly-1',
            title: 'Master Typist',
            description: 'Top 100 get exclusive badge',
            icon: '👑',
            prize: 'Target 95%',
            participants: '5 min',
            difficulty: 'Expert',
            duration: 900,
            text: 'Welcome to the Master Typist Challenge! This is the ultimate test of your typing abilities. You will be presented with a variety of texts including technical documents, literary passages, and complex vocabulary. Your speed, accuracy, and consistency will all be measured. Only the top 100 participants will receive the exclusive Master Typist badge and a share of the 5000 point prize pool. This challenge runs for the entire month, so you can attempt it multiple times to improve your score.',
            progress: 0
        }
    ],
    special: [
        {
            id: 'special-1',
            title: 'Weekend Warrior',
            description: 'Double points weekend',
            icon: '⚔️',
            prize: 'Target 95%',
            participants: '5 min',
            difficulty: 'Medium',
            duration: 240,
            text: 'It\'s the weekend! Time to earn double points. This special challenge features a mix of fun and engaging texts. From famous movie quotes to interesting facts, you\'ll enjoy typing while competing for a spot on the leaderboard. All points earned this weekend count double toward your total score. Don\'t miss this opportunity to boost your ranking!',
            progress: 0
        }
    ]
};

// Challenge texts mapping
var challengeTexts = {
    'daily-1': 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Bright vixens jump; dozy fowl quack. Sphinx of black quartz, judge my vow. Waltz, bad nymph, for quick jigs vex!',
    'daily-2': 'Accuracy is more important than speed. Take your time to type each word correctly. Focus on proper finger positioning and smooth keystrokes. Remember that accuracy builds the foundation for speed.',
    'daily-3': 'cat dog sun car book tree fish bird house phone computer keyboard screen window garden office school family travel weather mountain river ocean forest cloud star moon planet',
    'weekly-1': 'The ability to type quickly and accurately is an essential skill in the modern digital world. Whether you are a student writing essays, a professional composing emails, or a programmer writing code, your typing speed can significantly impact your productivity. The average person types at about 40 words per minute, but with practice, you can achieve speeds of 60, 80, or even 100 words per minute. Professional typists and transcriptionists often reach speeds of 100+ WPM. The world record for typing speed is over 200 words per minute!',
    'weekly-2': 'Endurance is key in long typing sessions. This marathon challenge tests your ability to maintain focus and consistency over an extended period. Take deep breaths, maintain proper posture, and keep a steady rhythm. Remember to stretch your fingers and wrists periodically to prevent strain. The goal is not just speed, but consistent performance throughout the entire duration. Good luck!',
    'monthly-1': 'Welcome to the Master Typist Challenge! This is the ultimate test of your typing abilities. You will be presented with a variety of texts including technical documents, literary passages, and complex vocabulary. Your speed, accuracy, and consistency will all be measured. Only the top 100 participants will receive the exclusive Master Typist badge and a share of the 5000 point prize pool. This challenge runs for the entire month, so you can attempt it multiple times to improve your score.',
    'special-1': 'It\'s the weekend! Time to earn double points. This special challenge features a mix of fun and engaging texts. From famous movie quotes to interesting facts, you\'ll enjoy typing while competing for a spot on the leaderboard. All points earned this weekend count double toward your total score. Don\'t miss this opportunity to boost your ranking!'
};

// State variables
var currentTab = 'daily';
var activeChallenge = null;
var challengeActive = false;
var challengeText = '';
var challengeWords = [];
var startTime = null;
var timerInterval = null;
var timeLeft = 0;
var userInputValue = '';
var wordIndex = 0;
var correctChars = 0;
var totalChars = 0;
var errors = 0;

// Challenge stats
var challengeStats = JSON.parse(localStorage.getItem('challengeStats')) || {
    challengesWon: 0,
    currentStreak: 0,
    bestWPM: 0,
    totalPoints: 0,
    globalRank: 1234,
    rankProgress: 65
};

// DOM Elements
var userInput, challengeTextEl, timerDisplay, challengeProgressFill;
var liveWPM, liveAccuracy, liveProgress, liveTime;
var totalWordsSpan;

// Initialize challenge
function initChallenge() {
    console.log('Challenge page initialized');
    
    // Cache DOM elements
    userInput = document.getElementById('userInput');
    challengeTextEl = document.getElementById('challengeText');
    timerDisplay = document.getElementById('liveTime');
    challengeProgressFill = document.getElementById('challengeProgressFill');
    liveWPM = document.getElementById('liveWPM');
    liveAccuracy = document.getElementById('liveAccuracy');
    liveProgress = document.getElementById('liveProgress');
    totalWordsSpan = document.getElementById('totalWords');
    
    // Load initial data
    updateStats();
    loadChallenges(currentTab);
    loadLeaderboard('challenge');
    setupInputListener();
}

// Update stats
function updateStats() {
    var wonElem = document.getElementById('challengesWon');
    var streakElem = document.getElementById('currentStreak');
    var bestElem = document.getElementById('bestWPM');
    var pointsElem = document.getElementById('totalPoints');
    var rankElem = document.getElementById('globalRank');
    var rankProgressElem = document.getElementById('rankProgress');
    
    if (wonElem) wonElem.textContent = challengeStats.challengesWon;
    if (streakElem) streakElem.textContent = challengeStats.currentStreak;
    if (bestElem) bestElem.textContent = challengeStats.bestWPM;
    if (pointsElem) pointsElem.textContent = challengeStats.totalPoints;
    if (rankElem) rankElem.textContent = '#' + challengeStats.globalRank.toLocaleString();
    if (rankProgressElem) rankProgressElem.style.width = challengeStats.rankProgress + '%';
}

// Load challenges for a tab
function loadChallenges(tab) {
    var container = document.getElementById('challengesGrid');
    if (!container) return;
    
    var challenges = challengesData[tab] || [];
    
    var html = '';
    for (var i = 0; i < challenges.length; i++) {
        var challenge = challenges[i];
        html += '<div class="challenge-card" onclick="selectChallenge(\'' + challenge.id + '\')">';
        
        if (challenge.id === 'special-1') {
            html += '<div class="challenge-badge hot">HOT</div>';
        }
        if (challenge.id === 'daily-1') {
            html += '<div class="challenge-badge new">NEW</div>';
        }
        
        html += '<div class="challenge-icon">' + challenge.icon + '</div>';
        html += '<h3>' + challenge.title + '</h3>';
        html += '<p class="challenge-description">' + challenge.description + '</p>';
        html += '<div class="challenge-meta">';
        html += '<span class="challenge-prize">🏆 ' + challenge.prize + ' pts</span>';
        html += '<span class="challenge-participants">👥 ' + challenge.participants.toLocaleString() + '</span>';
        html += '</div>';
        html += '<div class="challenge-progress-preview">';
        html += '<div class="progress-bar"><div class="progress-fill" style="width: ' + challenge.progress + '%"></div></div>';
        html += '<span class="progress-text">' + challenge.progress + '% completed</span>';
        html += '</div>';
        html += '<button class="join-challenge-btn ' + (challenge.progress > 0 ? 'completed' : '') + '">';
        html += (challenge.progress > 0 ? 'Continue' : 'Join Challenge') + ' →';
        html += '</button>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Select and start a challenge
function selectChallenge(challengeId) {
    // Find challenge
    var selected = null;
    for (var tab in challengesData) {
        var found = null;
        for (var i = 0; i < challengesData[tab].length; i++) {
            if (challengesData[tab][i].id === challengeId) {
                found = challengesData[tab][i];
                break;
            }
        }
        if (found) {
            selected = found;
            break;
        }
    }
    
    if (!selected) return;
    
    activeChallenge = selected;
    challengeActive = true;
    
    // Set challenge text
    challengeText = challengeTexts[challengeId] || selected.text;
    challengeWords = challengeText.split(' ');
    
    // Reset state
    timeLeft = selected.duration || 0;
    userInputValue = '';
    wordIndex = 0;
    correctChars = 0;
    totalChars = 0;
    errors = 0;
    startTime = null;
    
    // Update UI - hide grid, show active challenge
    var challengesGrid = document.getElementById('challengesGrid');
    var activeChallengeDiv = document.getElementById('activeChallenge');
    var resultsArea = document.getElementById('resultsArea');
    
    if (challengesGrid) challengesGrid.style.display = 'none';
    if (activeChallengeDiv) activeChallengeDiv.style.display = 'block';
    if (resultsArea) resultsArea.style.display = 'none';
    
    // Update challenge info
    var titleElem = document.getElementById('challengeTitle');
    var prizeElem = document.getElementById('challengePrize');
    var participantsElem = document.getElementById('challengeParticipants');
    var difficultyElem = document.getElementById('challengeDifficulty');
    
    if (titleElem) titleElem.textContent = selected.title;
    if (prizeElem) prizeElem.textContent = selected.prize + ' points';
    if (participantsElem) participantsElem.textContent = selected.participants.toLocaleString();
    if (difficultyElem) difficultyElem.textContent = selected.difficulty;
    
    // Update text display
    if (challengeTextEl) challengeTextEl.innerHTML = highlightText(challengeText, '');
    if (userInput) {
        userInput.value = '';
        userInput.focus();
    }
    if (totalWordsSpan) totalWordsSpan.textContent = challengeWords.length;
    if (liveProgress) liveProgress.textContent = '0/' + challengeWords.length;
    if (liveWPM) liveWPM.textContent = '0';
    if (liveAccuracy) liveAccuracy.textContent = '100%';
    
    // Set timer display
    if (selected.duration > 0) {
        var mins = Math.floor(timeLeft / 60);
        var secs = timeLeft % 60;
        if (timerDisplay) timerDisplay.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
    } else {
        if (timerDisplay) timerDisplay.textContent = '∞';
    }
    
    // Reset progress bar
    if (challengeProgressFill) challengeProgressFill.style.width = '0%';
}

// Highlight text based on input
function highlightText(text, input) {
    var words = text.split(' ');
    var inputWords = input.split(' ');
    var result = '';
    
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        
        if (i < inputWords.length - 1) {
            // Completed word
            var isCorrect = (word === inputWords[i]);
            result += '<span class="' + (isCorrect ? 'correct-word' : 'incorrect-word') + '">' + word + '</span>';
        } else if (i === inputWords.length - 1) {
            // Current word being typed
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
            // Future word
            result += '<span class="future-word">' + word + '</span>';
        }
        
        if (i < words.length - 1) result += ' ';
    }
    
    return result;
}

// Start timer
function startChallengeTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(function() {
        if (!challengeActive) return;
        if (timeLeft <= 0) {
            endChallenge();
            return;
        }
        
        timeLeft--;
        
        var mins = Math.floor(timeLeft / 60);
        var secs = timeLeft % 60;
        if (timerDisplay) timerDisplay.textContent = mins + ':' + (secs < 10 ? '0' : '') + secs;
        
        // Update progress bar
        var totalDuration = activeChallenge.duration;
        var progress = ((totalDuration - timeLeft) / totalDuration) * 100;
        if (challengeProgressFill) challengeProgressFill.style.width = progress + '%';
        
        if (timeLeft <= 0) {
            endChallenge();
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

// End challenge
function endChallenge() {
    challengeActive = false;
    if (timerInterval) clearInterval(timerInterval);
    
    var wpm = calculateWPM();
    var accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    
    // Calculate rank (simulated)
    var rank = Math.floor(Math.random() * 100) + 1;
    var pointsEarned = Math.round(activeChallenge.prize * (wpm / 100) * (accuracy / 100));
    
    // Update stats
    if (wpm > challengeStats.bestWPM) {
        challengeStats.bestWPM = wpm;
    }
    challengeStats.totalPoints += pointsEarned;
    challengeStats.currentStreak = (wpm >= 40) ? challengeStats.currentStreak + 1 : 0;
    
    if (rank <= 10) {
        challengeStats.challengesWon++;
    }
    
    // Update rank progress
    challengeStats.globalRank = Math.max(1, challengeStats.globalRank - Math.floor(Math.random() * 10));
    challengeStats.rankProgress = Math.min(100, challengeStats.rankProgress + Math.floor(Math.random() * 5));
    
    localStorage.setItem('challengeStats', JSON.stringify(challengeStats));
    updateStats();
    
    // Update challenge progress
    activeChallenge.progress = Math.min(100, activeChallenge.progress + 10);
    loadChallenges(currentTab);
    
    // Update UI
    var activeChallengeDiv = document.getElementById('activeChallenge');
    var resultsArea = document.getElementById('resultsArea');
    
    if (activeChallengeDiv) activeChallengeDiv.style.display = 'none';
    if (resultsArea) resultsArea.style.display = 'block';
    
    // Set results
    var finalWPM = document.getElementById('finalWPM');
    var finalAccuracy = document.getElementById('finalAccuracy');
    var finalRank = document.getElementById('finalRank');
    var pointsEarnedElem = document.getElementById('pointsEarned');
    var resultMessage = document.getElementById('resultMessage');
    
    if (finalWPM) finalWPM.textContent = wpm;
    if (finalAccuracy) finalAccuracy.textContent = accuracy + '%';
    if (finalRank) finalRank.textContent = '#' + rank;
    if (pointsEarnedElem) pointsEarnedElem.textContent = '+' + pointsEarned;
    
    var message = '';
    if (rank <= 10) {
        message = '🏆 Amazing! You\'re in the top 10! You earned ' + pointsEarned + ' points.';
    } else if (rank <= 50) {
        message = '🎉 Great job! You\'re in the top 50! You earned ' + pointsEarned + ' points.';
    } else {
        message = '👍 Good effort! You earned ' + pointsEarned + ' points. Keep practicing!';
    }
    if (resultMessage) resultMessage.textContent = message;
}

// Cancel challenge
function cancelChallengeTest() {
    if (confirm('Cancel this challenge? Your progress will not be saved.')) {
        challengeActive = false;
        if (timerInterval) clearInterval(timerInterval);
        
        var challengesGrid = document.getElementById('challengesGrid');
        var activeChallengeDiv = document.getElementById('activeChallenge');
        var resultsArea = document.getElementById('resultsArea');
        
        if (challengesGrid) challengesGrid.style.display = 'grid';
        if (activeChallengeDiv) activeChallengeDiv.style.display = 'none';
        if (resultsArea) resultsArea.style.display = 'none';
        
        if (userInput) userInput.value = '';
    }
}

// Retry challenge
function retryChallengeTest() {
    var resultsArea = document.getElementById('resultsArea');
    if (resultsArea) resultsArea.style.display = 'none';
    
    if (activeChallenge) {
        selectChallenge(activeChallenge.id);
    } else {
        var challengesGrid = document.getElementById('challengesGrid');
        if (challengesGrid) challengesGrid.style.display = 'grid';
    }
}

// Share challenge result
function shareChallengeResult() {
    var wpmElem = document.getElementById('finalWPM');
    var accuracyElem = document.getElementById('finalAccuracy');
    var rankElem = document.getElementById('finalRank');
    
    var wpm = wpmElem ? wpmElem.textContent : '0';
    var accuracy = accuracyElem ? accuracyElem.textContent : '0%';
    var rank = rankElem ? rankElem.textContent : '#0';
    var challengeName = activeChallenge ? activeChallenge.title : 'Typing Challenge';
    
    var text = 'I just scored ' + wpm + ' WPM with ' + accuracy + ' accuracy in the ' + challengeName + ' and ranked ' + rank + '! 🏆 #ProTypingTest';
    
    if (navigator.share) {
        navigator.share({
            title: 'My Typing Challenge Result',
            text: text,
            url: window.location.href
        }).catch(function() {
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

// Copy to clipboard helper
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert('✅ Result copied to clipboard! Share it with your friends.');
    }).catch(function() {
        alert('📤 Share your achievement: ' + text);
    });
}

// Switch challenge tab
function switchChallengeTab(tab) {
    currentTab = tab;
    
    // Update active button
    var btns = document.querySelectorAll('.challenge-tabs .tab-btn');
    for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === tab || btn.textContent.toLowerCase().includes(tab)) {
            btn.classList.add('active');
        }
    }
    
    loadChallenges(tab);
}

// Switch leaderboard
function switchLeaderboardTest(type) {
    // Update active button
    var btns = document.querySelectorAll('.leaderboard-tabs .tab-btn');
    for (var i = 0; i < btns.length; i++) {
        var btn = btns[i];
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(type)) {
            btn.classList.add('active');
        }
    }
    
    loadLeaderboard(type);
}

// Load leaderboard
function loadLeaderboard(type) {
    var container = document.getElementById('challengeLeaderboard');
    if (!container) return;
    
    var history = JSON.parse(localStorage.getItem('typingChallengeBests') || '[]');
    
    if (history.length === 0) {
        container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.95rem;">No completed challenge records yet. Select any challenge above to record your first personal best!</div>';
        return;
    }
    
    // Sort personal records by WPM descending
    history.sort(function(a, b) { return b.wpm - a.wpm; });
    var topRecords = history.slice(0, 10);
    
    var html = '';
    for (var i = 0; i < topRecords.length; i++) {
        var item = topRecords[i];
        var rank = i + 1;
        var rankClass = rank === 1 ? 'gold' : (rank === 2 ? 'silver' : (rank === 3 ? 'bronze' : ''));
        
        html += '<div class="leaderboard-item">';
        html += '<span class="leaderboard-rank ' + rankClass + '">#' + rank + '</span>';
        html += '<div class="leaderboard-avatar">⚡</div>';
        html += '<div class="leaderboard-info"><span class="leaderboard-name">' + (item.title || 'Challenge Attempt') + '</span></div>';
        html += '<span class="leaderboard-score">' + item.wpm + ' WPM (' + item.accuracy + '%)</span>';
        html += '<span class="leaderboard-prize" style="font-size: 0.85rem; color: var(--text-muted);">' + (item.date || '') + '</span>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}

// Setup input listener
function setupInputListener() {
    if (!userInput) return;
    
    userInput.addEventListener('input', function(e) {
        if (!challengeActive) return;
        
        var input = e.target.value;
        
        // Start timer on first keystroke
        if (!startTime && input.length > 0) {
            startTime = Date.now();
            if (activeChallenge && activeChallenge.duration > 0) {
                startChallengeTimer();
            }
        }
        
        // Update highlighted text
        if (challengeTextEl) challengeTextEl.innerHTML = highlightText(challengeText, input);
        
        // Calculate stats
        var inputWords = input.split(' ');
        var correct = 0;
        var total = 0;
        var errs = 0;
        
        // Completed words
        for (var i = 0; i < inputWords.length - 1; i++) {
            if (i < challengeWords.length) {
                if (inputWords[i] === challengeWords[i]) {
                    correct += challengeWords[i].length;
                } else {
                    errs++;
                }
                total += challengeWords[i].length;
            }
        }
        
        // Current word
        var currentWordIndex = inputWords.length - 1;
        if (currentWordIndex < challengeWords.length && inputWords[currentWordIndex]) {
            var currentWord = challengeWords[currentWordIndex];
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
        
        // Update UI
        var wpm = calculateWPM();
        var accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
        
        if (liveWPM) liveWPM.textContent = wpm;
        if (liveAccuracy) liveAccuracy.textContent = accuracy + '%';
        if (liveProgress) liveProgress.textContent = (inputWords.length - 1) + '/' + challengeWords.length;
        
        // Update progress bar for word completion
        var wordProgress = ((inputWords.length - 1) / challengeWords.length) * 100;
        if (challengeProgressFill && activeChallenge && activeChallenge.duration === 0) {
            challengeProgressFill.style.width = wordProgress + '%';
        }
        
        // Check if all words are typed
        if (inputWords.length - 1 >= challengeWords.length && input.endsWith(' ')) {
            endChallenge();
        }
    });
}

// Export functions for global access
window.initChallenge = initChallenge;
window.switchChallengeTab = switchChallengeTab;
window.selectChallenge = selectChallenge;
window.cancelChallengeTest = cancelChallengeTest;
window.retryChallengeTest = retryChallengeTest;
window.shareChallengeResult = shareChallengeResult;
window.switchLeaderboardTest = switchLeaderboardTest;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initChallenge();
});
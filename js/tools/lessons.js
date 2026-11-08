/* ================= TYPING LESSONS LOGIC v2.0 ================= */
/* AdSense Optimized - High Quality Interactive Features */

// Lesson Data
var lessonsData = {
    beginner: [
        { id: 1, title: 'Home Row', description: 'Learn the home row keys', keys: 'asdf jkl;', duration: '5 min', target: 'asdf jkl;' },
        { id: 2, title: 'Top Row', description: 'Master the top row keys', keys: 'qwert yuiop', duration: '5 min', target: 'qwert yuiop' },
        { id: 3, title: 'Bottom Row', description: 'Practice bottom row keys', keys: 'zxcv bn m', duration: '5 min', target: 'zxcv bn m' },
        { id: 4, title: 'All Rows', description: 'Combine all rows', keys: 'The quick brown fox', duration: '10 min', target: 'the quick brown fox' },
        { id: 5, title: 'Common Words', description: 'Practice common English words', keys: 'the and for you', duration: '10 min', target: 'the and for you' },
        { id: 6, title: 'Short Sentences', description: 'Type simple sentences', keys: 'I am a student', duration: '10 min', target: 'i am a student' }
    ],
    intermediate: [
        { id: 7, title: 'Capital Letters', description: 'Practice capital letters', keys: 'The Quick Brown Fox', duration: '8 min', target: 'the quick brown fox' },
        { id: 8, title: 'Punctuation', description: 'Learn punctuation marks', keys: 'Hello, world! How are you?', duration: '8 min', target: 'hello world how are you' },
        { id: 9, title: 'Numbers', description: 'Practice number keys', keys: '1234 5678 90', duration: '8 min', target: '1234 5678 90' },
        { id: 10, title: 'Symbols', description: 'Master special symbols', keys: '@#$% &*() -+=', duration: '10 min', target: ' ' },
        { id: 11, title: 'Common Phrases', description: 'Type common phrases', keys: 'Thank you very much', duration: '10 min', target: 'thank you very much' },
        { id: 12, title: 'Paragraphs', description: 'Type short paragraphs', keys: 'Typing is an essential skill', duration: '15 min', target: 'typing is an essential skill' }
    ],
    advanced: [
        { id: 13, title: 'Speed Building', description: 'Increase your typing speed', keys: 'Practice makes perfect', duration: '15 min', target: 'practice makes perfect' },
        { id: 14, title: 'Accuracy Focus', description: 'Focus on accuracy', keys: 'Accuracy is key to speed', duration: '15 min', target: 'accuracy is key to speed' },
        { id: 15, title: 'Complex Words', description: 'Type difficult words', keys: 'extraordinary pronunciation', duration: '15 min', target: 'extraordinary pronunciation' },
        { id: 16, title: 'Long Paragraphs', description: 'Type longer texts', keys: 'Typing practice improves speed', duration: '20 min', target: 'typing practice improves speed' },
        { id: 17, title: 'Technical Terms', description: 'Practice technical vocabulary', keys: 'algorithm bandwidth cache', duration: '15 min', target: 'algorithm bandwidth cache' },
        { id: 18, title: 'Foreign Words', description: 'Type foreign language words', keys: 'café résumé naïve', duration: '15 min', target: 'cafe resume naive' }
    ],
    expert: [
        { id: 19, title: 'Code Typing', description: 'Type programming code', keys: 'function() { return true; }', duration: '20 min', target: 'function return true' },
        { id: 20, title: 'Medical Terms', description: 'Practice medical vocabulary', keys: 'diagnosis hypertension', duration: '20 min', target: 'diagnosis hypertension' },
        { id: 21, title: 'Legal Documents', description: 'Type legal text', keys: 'hereinafter pursuant clause', duration: '20 min', target: 'hereinafter pursuant clause' },
        { id: 22, title: 'Scientific Papers', description: 'Type scientific content', keys: 'photosynthesis mitochondria', duration: '25 min', target: 'photosynthesis mitochondria' },
        { id: 23, title: 'Literary Classics', description: 'Type classic literature', keys: 'It was the best of times', duration: '25 min', target: 'it was the best of times' },
        { id: 24, title: 'Speed Record', description: 'Push your limits', keys: 'The quick brown fox jumps', duration: '30 min', target: 'the quick brown fox jumps' }
    ]
};

// State variables
var currentLevel = 'beginner';
var currentLesson = null;
var userProgress = JSON.parse(localStorage.getItem('lessonProgress')) || {
    completed: [],
    current: 1,
    stats: {
        wpm: 0,
        accuracy: 0,
        lessonsDone: 0,
        totalPoints: 0
    }
};

// DOM Elements
var lessonsContainer, currentLessonDiv, lessonTitle, lessonInstruction, targetKeys, userInput, lessonFeedback;

// Initialize lessons
function initLessons() {
    console.log('Lessons page initialized');
    
    // Cache DOM elements
    lessonsContainer = document.getElementById('lessonsContainer');
    currentLessonDiv = document.getElementById('currentLesson');
    lessonTitle = document.getElementById('lessonTitle');
    lessonInstruction = document.getElementById('lessonInstruction');
    targetKeys = document.getElementById('targetKeys');
    userInput = document.getElementById('userInput');
    lessonFeedback = document.getElementById('lessonFeedback');
    
    loadLessons(currentLevel);
    updateProgress();
    loadAchievements();
    updateStats();
    setupInputListener();
}

// Load lessons for a level
function loadLessons(level) {
    if (!lessonsContainer) return;
    
    currentLevel = level;
    var lessons = lessonsData[level];
    
    var html = '';
    for (var i = 0; i < lessons.length; i++) {
        var lesson = lessons[i];
        var status = getLessonStatus(lesson.id);
        var statusClass = '';
        var statusText = '';
        
        if (status === 'completed') {
            statusClass = 'completed';
            statusText = '✓ Completed';
        } else if (status === 'current') {
            statusClass = 'current';
            statusText = '▶ Current';
        } else if (status === 'locked') {
            statusClass = 'locked';
            statusText = '🔒 Locked';
        }
        
        html += '<div class="lesson-card ' + statusClass + '" onclick="selectLesson(' + lesson.id + ')">';
        html += '<div class="lesson-number">Lesson ' + lesson.id + '</div>';
        html += '<div class="lesson-title">' + lesson.title + '</div>';
        html += '<div class="lesson-description">' + lesson.description + '</div>';
        html += '<div class="lesson-meta">';
        html += '<span>⏱️ ' + lesson.duration + '</span>';
        html += '<span>🔑 ' + lesson.keys.length + ' keys</span>';
        html += '</div>';
        html += '<div class="lesson-status"><span class="status-badge ' + statusClass + '">' + statusText + '</span></div>';
        html += '</div>';
    }
    
    lessonsContainer.innerHTML = html;
}

// Get lesson status
function getLessonStatus(lessonId) {
    if (userProgress.completed.indexOf(lessonId) !== -1) return 'completed';
    if (lessonId === userProgress.current) return 'current';
    if (lessonId > userProgress.current) return 'locked';
    return '';
}

// Select a lesson
function selectLesson(lessonId) {
    console.log('Selecting lesson:', lessonId);
    
    if (lessonId > userProgress.current && userProgress.completed.indexOf(lessonId) === -1) {
        showNotification('Complete previous lessons first!');
        return;
    }
    
    // Find lesson
    for (var level in lessonsData) {
        for (var i = 0; i < lessonsData[level].length; i++) {
            if (lessonsData[level][i].id === lessonId) {
                currentLesson = lessonsData[level][i];
                break;
            }
        }
    }
    
    if (currentLesson) {
        showLesson(currentLesson);
    }
}

// Show lesson
function showLesson(lesson) {
    if (currentLessonDiv) currentLessonDiv.style.display = 'block';
    if (lessonTitle) lessonTitle.textContent = 'Lesson ' + lesson.id + ': ' + lesson.title;
    if (lessonInstruction) lessonInstruction.textContent = 'Type the following: ' + lesson.keys;
    if (targetKeys) targetKeys.textContent = lesson.keys;
    if (userInput) {
        userInput.value = '';
        userInput.focus();
    }
    if (lessonFeedback) lessonFeedback.innerHTML = '';
}

// Switch level
function switchLessonLevel(level) {
    // Update active tab
    var tabs = document.querySelectorAll('.level-tab');
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
        if (tabs[i].getAttribute('data-level') === level) {
            tabs[i].classList.add('active');
        }
    }
    
    loadLessons(level);
}

// Previous lesson
function prevLessonModule() {
    if (!currentLesson) return;
    var prevId = currentLesson.id - 1;
    if (prevId >= 1) {
        selectLesson(prevId);
    }
}

// Next lesson
function nextLessonModule() {
    if (!currentLesson) return;
    var nextId = currentLesson.id + 1;
    
    // Check if lesson exists
    var exists = false;
    for (var level in lessonsData) {
        for (var i = 0; i < lessonsData[level].length; i++) {
            if (lessonsData[level][i].id === nextId) {
                exists = true;
                break;
            }
        }
    }
    
    if (exists && nextId <= userProgress.current + 1) {
        selectLesson(nextId);
    }
}

// Reset lesson
function resetLessonModule() {
    if (!currentLesson) return;
    if (userInput) userInput.value = '';
    if (lessonFeedback) lessonFeedback.innerHTML = '';
    if (userInput) userInput.focus();
}

// Update progress
function updateProgress() {
    var completedCount = userProgress.completed.length;
    var totalLessons = 24;
    var progressPercent = (completedCount / totalLessons * 100).toFixed(0);
    
    var progressEl = document.getElementById('lessonProgress');
    var completedEl = document.getElementById('completedLessons');
    var totalEl = document.getElementById('totalLessons');
    var levelEl = document.getElementById('currentLevel');
    
    if (progressEl) progressEl.textContent = progressPercent + '%';
    if (completedEl) completedEl.textContent = completedCount;
    if (totalEl) totalEl.textContent = totalLessons;
    
    // Update progress circle
    var circle = document.querySelector('.progress-circle');
    if (circle) {
        var degrees = progressPercent * 3.6;
        circle.style.background = 'conic-gradient(var(--accent-primary) ' + degrees + 'deg, var(--border-color) ' + degrees + 'deg)';
    }
    
    // Determine level
    var level = 'Beginner';
    if (completedCount >= 18) level = 'Expert';
    else if (completedCount >= 12) level = 'Advanced';
    else if (completedCount >= 6) level = 'Intermediate';
    if (levelEl) levelEl.textContent = level;
}

// Update stats
function updateStats() {
    var bestWPMEl = document.getElementById('bestWPM');
    var avgAccuracyEl = document.getElementById('avgAccuracy');
    var lessonsDoneEl = document.getElementById('lessonsDone');
    var totalPointsEl = document.getElementById('totalPoints');
    
    if (bestWPMEl) bestWPMEl.textContent = userProgress.stats.wpm || 0;
    if (avgAccuracyEl) avgAccuracyEl.textContent = (userProgress.stats.accuracy || 0) + '%';
    if (lessonsDoneEl) lessonsDoneEl.textContent = userProgress.completed.length;
    if (totalPointsEl) totalPointsEl.textContent = userProgress.stats.totalPoints || 0;
}

// Load achievements
function loadAchievements() {
    var achievements = [
        { icon: '🎯', name: 'First Step', desc: 'Complete first lesson', unlocked: userProgress.completed.length >= 1 },
        { icon: '⚡', name: 'Getting Started', desc: 'Complete 5 lessons', unlocked: userProgress.completed.length >= 5 },
        { icon: '🚀', name: 'On Fire', desc: 'Complete 10 lessons', unlocked: userProgress.completed.length >= 10 },
        { icon: '🏆', name: 'Master', desc: 'Complete all lessons', unlocked: userProgress.completed.length >= 24 },
        { icon: '💪', name: 'Streak Starter', desc: 'Practice 3 days in a row', unlocked: userProgress.completed.length >= 3 }
    ];
    
    var container = document.getElementById('achievements');
    if (!container) return;
    
    var html = '';
    for (var i = 0; i < achievements.length; i++) {
        var ach = achievements[i];
        html += '<div class="achievement-item" style="opacity: ' + (ach.unlocked ? '1' : '0.5') + '">';
        html += '<span class="achievement-icon">' + ach.icon + '</span>';
        html += '<div class="achievement-info">';
        html += '<span class="achievement-name">' + ach.name + '</span>';
        html += '<span class="achievement-desc">' + ach.desc + '</span>';
        html += '</div></div>';
    }
    container.innerHTML = html;
}

// Show notification
function showNotification(message) {
    var notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--accent-primary); color: white; padding: 12px 24px; border-radius: 8px; z-index: 1000; animation: slideIn 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.2);';
    document.body.appendChild(notification);
    setTimeout(function() { notification.remove(); }, 3000);
}

// Setup input listener
function setupInputListener() {
    if (!userInput) return;
    
    userInput.addEventListener('input', function(e) {
        if (!currentLesson) return;
        
        var inputValue = e.target.value.trim().toLowerCase();
        var target = (currentLesson.target || currentLesson.keys).toLowerCase();
        
        if (inputValue === target) {
            // Lesson completed
            if (lessonFeedback) {
                lessonFeedback.innerHTML = '✅ Perfect! Lesson completed!';
                lessonFeedback.className = 'lesson-feedback success';
            }
            
            // Mark as completed if not already
            if (userProgress.completed.indexOf(currentLesson.id) === -1) {
                userProgress.completed.push(currentLesson.id);
                userProgress.current = currentLesson.id + 1;
                
                // Update stats
                userProgress.stats.lessonsDone = userProgress.completed.length;
                userProgress.stats.wpm = Math.min(100, Math.floor(userProgress.completed.length * 4));
                userProgress.stats.accuracy = Math.min(100, Math.floor(userProgress.completed.length * 2));
                userProgress.stats.totalPoints = (userProgress.stats.totalPoints || 0) + 50;
                
                localStorage.setItem('lessonProgress', JSON.stringify(userProgress));
                updateProgress();
                loadAchievements();
                updateStats();
                loadLessons(currentLevel);
            }
        } else if (target.indexOf(inputValue) === 0 && inputValue.length > 0) {
            if (lessonFeedback) {
                lessonFeedback.innerHTML = '👍 Keep going...';
                lessonFeedback.className = 'lesson-feedback';
            }
        } else if (inputValue.length > 0) {
            if (lessonFeedback) {
                lessonFeedback.innerHTML = '❌ Mistake! Check your typing';
                lessonFeedback.className = 'lesson-feedback error';
            }
        }
    });
}

// Export functions for global access
window.initLessons = initLessons;
window.switchLessonLevel = switchLessonLevel;
window.selectLesson = selectLesson;
window.prevLessonModule = prevLessonModule;
window.nextLessonModule = nextLessonModule;
window.resetLessonModule = resetLessonModule;

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    initLessons();
});
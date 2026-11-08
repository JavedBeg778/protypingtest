// ==================== PROFESSIONAL TYPING TEST ENGINE v2.2 ====================
// 5 Minute Typing Test - Fixed Version (Based on 1_minute.js fixes)
// =============================================================================

// ===================== STATE VARIABLES =====================

// Global test configuration
const TEST_CONFIG = {
    DURATION: 300, // 5 minutes in seconds
    WORDS_PER_LINE: 8,
    VISIBLE_LINES: 4,
    WORD_STANDARD_LENGTH: 5, // Standard word length for WPM calculation
    MIN_WORDS_FOR_CONSISTENCY: 5
};

// Main test state
let testState = {
    // Text management
    texts: [],
    currentTextIndex: 0,
    textsUsed: [],
    
    // Word structure
    words: [],
    lines: [],
    totalWords: 0,
    completedWords: 0,
    originalTotalWords: 0,
    
    // Line tracking
    lineInputs: [],
    lineStatus: [],
    currentLineIndex: 0,
    currentWordIndexInLine: 0,
    visibleLines: [],
    completedLines: [],
    
    // Character tracking - IMPORTANT: Track ALL characters
    typedCharacters: 0,        // Total characters typed (including incorrect)
    correctCharacters: 0,      // Characters that matched expected
    incorrectCharacters: 0,     // Characters that didn't match
    backspaces: 0,              // Backspace count
    extraCharacters: 0,         // Extra characters typed beyond word length
    totalKeystrokes: 0,         // Total keystrokes (including backspaces)
    
    // Word tracking
    correctWords: 0,
    incorrectWords: 0,
    wordTimings: [],
    wordStartTime: null,
    
    // Advanced metrics
    keystrokeLog: [],
    pauses: 0,
    lastKeystrokeTime: null,
    PAUSE_THRESHOLD: 1000, // 1 second pause detection
    
    // Streak tracking
    currentStreak: 0,
    bestStreak: 0,
    
    // Input tracking
    currentInput: ""
};

// Pro mode state
let proState = {
    // Core data
    words: [],
    lines: [],
    wordStatus: [],
    totalWords: 0,
    completedWords: 0,
    currentWordIndex: 0,
    
    // Input tracking
    input: "",
    completedLines: [],
    visibleLines: [],
    
    // Character tracking - IMPORTANT: Track ALL characters
    typedCharacters: 0,
    correctCharacters: 0,
    incorrectCharacters: 0,
    backspaces: 0,
    extraCharacters: 0,
    totalKeystrokes: 0,
    
    // Word tracking
    correctWords: 0,
    incorrectWords: 0,
    wordTimings: [],
    wordStartTime: null,
    
    // Advanced metrics
    keystrokeLog: [],
    pauses: 0,
    lastKeystrokeTime: null,
    currentStreak: 0,
    bestStreak: 0
};

// Timer state
let timerStarted = false;
let timeRemaining = TEST_CONFIG.DURATION;
let initialDuration = TEST_CONFIG.DURATION;
let timerInterval = null;
let testCompleted = false;
let currentMode = "normal";

// ==================== TIMER FUNCTIONS ====================

function formatTimeMMSS(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerStarted = true;
    testCompleted = false;
    
    // Record start time
    if (currentMode === 'pro') {
        proState.wordStartTime = Date.now();
        proState.lastKeystrokeTime = Date.now();
    } else {
        testState.wordStartTime = Date.now();
        testState.lastKeystrokeTime = Date.now();
    }
    
    // Disable mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.add('disabled');
        btn.style.pointerEvents = 'none';
        btn.style.opacity = '0.5';
    });
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = formatTimeMMSS(timeRemaining);
            
            const timerContainer = document.querySelector('.timer-container');
            if (timerContainer) {
                // Last 60 seconds critical for 5 min test
                if (timeRemaining <= 60) {
                    timerContainer.classList.add('timer-critical');
                } else {
                    timerContainer.classList.remove('timer-critical');
                }
            }
        }
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            onTestComplete();
        }
    }, 1000);
}

// ==================== POPUP FUNCTIONS ====================

function showTimeUpPopup() {
    const popup = document.getElementById('timeUpPopup');
    if (!popup) return;
    
    const results = calculateFinalResults();
    
    const wordsElement = document.getElementById('popupWordsTyped');
    const accuracyElement = document.getElementById('popupAccuracy');
    const wpmElement = document.getElementById('popupWPM');
    
    if (wordsElement) wordsElement.textContent = results.wordsTyped;
    if (accuracyElement) accuracyElement.textContent = results.accuracy + '%';
    if (wpmElement) wpmElement.textContent = results.wpm;
    
    popup.style.display = 'flex';
    sessionStorage.setItem('typingTestResults', JSON.stringify(results));
}

function closePopup() {
    const popup = document.getElementById('timeUpPopup');
    if (popup) popup.style.display = 'none';
}

function viewResults() {
    window.location.href = '/results/typing-results.html?duration=5&mode=' + currentMode;
}

function goToHome() {
    window.location.href = '/index.html';
}

function onTestComplete() {
    if (testCompleted) return;
    testCompleted = true;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    showTimeUpPopup();
    document.removeEventListener('keydown', handleKeyDown);
}

// ==================== PROFESSIONAL CALCULATIONS - FIXED ====================

function calculateFinalResults() {
    let state = currentMode === 'pro' ? proState : testState;
    const minutes = TEST_CONFIG.DURATION / 60;
    
    const totalCharsTyped = state.typedCharacters || 0;
    const correctChars = state.correctCharacters || 0;
    const errors = state.incorrectCharacters || 0;
    const totalAttempted = Math.max(totalCharsTyped, correctChars + errors);

    let grossWPM, netWPM, accuracy, consistency, rank;

    if (typeof TypingEngine !== 'undefined') {
        grossWPM = TypingEngine.calculateGrossWPM(totalAttempted, TEST_CONFIG.DURATION);
        netWPM = TypingEngine.calculateNetWPM(correctChars, TEST_CONFIG.DURATION);
        accuracy = TypingEngine.calculateAccuracy(correctChars, totalAttempted);
        consistency = TypingEngine.calculateConsistency(state.wordTimings);
        const tier = TypingEngine.getSkillTier(netWPM);
        rank = tier ? tier.name : 'Intermediate';
    } else {
        const correctWordsCount = correctChars / (TEST_CONFIG.WORD_STANDARD_LENGTH || 5);
        netWPM = Math.round(correctWordsCount / minutes);
        grossWPM = Math.round((totalAttempted / (TEST_CONFIG.WORD_STANDARD_LENGTH || 5)) / minutes);
        accuracy = totalAttempted > 0 ? Math.min(100, Math.round((correctChars / totalAttempted) * 100)) : 100;
        consistency = 100;
        rank = 'Intermediate';
    }

    const wpm = netWPM;
    const correctWordsCount = correctChars / (TEST_CONFIG.WORD_STANDARD_LENGTH || 5);
    const errorsPerMinute = minutes > 0 ? errors / minutes : 0;

    return {
        wpm: wpm,
        accuracy: accuracy,
        wordsTyped: Math.round(correctWordsCount),
        grossWPM: grossWPM,
        netWPM: netWPM,
        correctWords: state.correctWords || 0,
        incorrectWords: state.incorrectWords || 0,
        totalWords: state.totalWords || 0,
        correctChars: correctChars,
        incorrectChars: errors,
        totalChars: totalAttempted,
        backspaces: state.backspaces || 0,
        extraChars: state.extraCharacters || 0,
        consistency: consistency,
        errorCount: errors,
        errorsPerMinute: errorsPerMinute,
        bestStreak: state.bestStreak || 0,
        pauses: state.pauses || 0,
        testDuration: String(minutes),
        testMode: currentMode,
        difficulty: getDifficultyFromMode(currentMode),
        timestamp: new Date().toISOString(),
        testId: Date.now(),
        rank: rank
    };
}

function calculateLiveAccuracy() {
    const state = currentMode === 'pro' ? proState : testState;
    const correctChars = state.correctCharacters || 0;
    const errors = state.incorrectCharacters || 0;
    const totalChars = Math.max(state.typedCharacters || 0, correctChars + errors);

    if (typeof TypingEngine !== 'undefined') {
        return TypingEngine.calculateAccuracy(correctChars, totalChars);
    }
    if (totalChars === 0) return 100;
    return Math.min(100, Math.round((correctChars / totalChars) * 100));
}

function getRankFromWPM(wpm) {
    if (typeof TypingEngine !== 'undefined') {
        const tier = TypingEngine.getSkillTier(wpm);
        if (tier) return tier.name;
    }
    if (wpm >= 105) return 'Elite';
    if (wpm >= 85) return 'Master';
    if (wpm >= 65) return 'Pro';
    if (wpm >= 45) return 'Advanced';
    if (wpm >= 25) return 'Intermediate';
    return 'Beginner';
}

function getDifficultyFromMode(mode) {
    switch(mode) {
        case 'pro': return 'hard';
        case 'phone': return 'easy';
        default: return 'medium';
    }
}

function calculateAverageWordTime(timings) {
    if (!timings || timings.length === 0) return 0;
    const sum = timings.reduce((a, b) => a + b, 0);
    return Math.round(sum / timings.length);
}

function calculateConsistency(timings) {
    if (typeof TypingEngine !== 'undefined') {
        return TypingEngine.calculateConsistency(timings);
    }
    if (!timings || timings.length < 2) return 100;
    const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
    if (mean === 0) return 100;
    const variance = timings.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / timings.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean;
    return Math.max(0, Math.min(100, Math.round(100 * (1 - Math.min(cv, 1)))));
}

function calculatePeakWPM(timings) {
    if (!timings || timings.length === 0) return 0;
    
    const fastestTime = Math.min(...timings);
    const secondsPerWord = fastestTime / 1000;
    return Math.round(60 / secondsPerWord);
}

function calculateFatigueIndex(timings) {
    if (!timings || timings.length < 10) return 0;
    
    const firstSegment = timings.slice(0, Math.floor(timings.length * 0.2));
    const lastSegment = timings.slice(-Math.floor(timings.length * 0.2));
    
    if (firstSegment.length === 0 || lastSegment.length === 0) return 0;
    
    const firstAvg = firstSegment.reduce((a, b) => a + b, 0) / firstSegment.length;
    const lastAvg = lastSegment.reduce((a, b) => a + b, 0) / lastSegment.length;
    
    const fatigue = ((lastAvg - firstAvg) / firstAvg) * 100;
    return Math.min(100, Math.max(-100, Math.round(fatigue)));
}

// ==================== KEYSTROKE TRACKING ====================

function trackKeystroke(key, isCorrect, isBackspace, wordComplete = false, word = '') {
    const state = currentMode === 'pro' ? proState : testState;
    const now = Date.now();
    
    // Detect pauses
    if (state.lastKeystrokeTime && (now - state.lastKeystrokeTime) > state.PAUSE_THRESHOLD) {
        state.pauses++;
    }
    state.lastKeystrokeTime = now;
    
    if (isBackspace) {
        // Backspace handling
        state.backspaces++;
        state.totalKeystrokes++;
        
        // Backspace par typedCharacters kam karo
        if (state.typedCharacters > 0) {
            state.typedCharacters--;
        }
    } else {
        // Forward keystroke
        state.typedCharacters++;
        state.totalKeystrokes++;
        
        if (isCorrect) {
            state.correctCharacters++;
            state.currentStreak++;
            if (state.currentStreak > state.bestStreak) {
                state.bestStreak = state.currentStreak;
            }
        } else {
            state.incorrectCharacters++;
            state.currentStreak = 0;
            
            // Check if this is an extra character (beyond word length)
            if (word && state.input && state.input.length > word.length) {
                state.extraCharacters++;
            }
        }
    }
    
    // Log keystroke
    if (!state.keystrokeLog) state.keystrokeLog = [];
    state.keystrokeLog.push({
        timestamp: now,
        key: key,
        isCorrect: isCorrect,
        isBackspace: isBackspace,
        wordComplete: wordComplete
    });
}

function recordWordCompletion(isCorrect) {
    const state = currentMode === 'pro' ? proState : testState;
    const now = Date.now();
    
    if (state.wordStartTime) {
        const timeTaken = now - state.wordStartTime;
        state.wordTimings.push(timeTaken);
    }
    
    // Track word accuracy
    if (isCorrect) {
        state.correctWords++;
    } else {
        state.incorrectWords++;
    }
    
    state.wordStartTime = now;
}

function getCurrentWord() {
    if (currentMode === 'normal') {
        const line = testState.lines[testState.currentLineIndex];
        return line?.[testState.currentWordIndexInLine];
    } else if (currentMode === 'pro') {
        return proState.words[proState.currentWordIndex];
    }
    return null;
}

// ==================== TEXT MANAGEMENT ====================

function loadNewText() {
    const urlParams = new URLSearchParams(window.location.search);
    const duration = urlParams.get('duration') || '5';
    
    const textData = window.getTestText(duration);
    
    testState.texts = textData.texts;
    testState.currentTextIndex = 0;
    testState.textsUsed = textData.texts.map(t => t.id);
    
    // Process words
    const allWords = textData.fullText.match(/\b[\w']+\b|[.,!?;:]|\s+/g)
        .filter(word => word.trim() !== '');
    
    testState.originalTotalWords = allWords.length;
    testState.totalWords = allWords.length;
    testState.words = allWords;
    
    // Break into lines
    testState.lines = [];
    for (let i = 0; i < allWords.length; i += TEST_CONFIG.WORDS_PER_LINE) {
        testState.lines.push(allWords.slice(i, i + TEST_CONFIG.WORDS_PER_LINE));
    }

    testState.lineInputs = testState.lines.map(() => "");
    testState.lineStatus = testState.lines.map(line => new Array(line.length).fill('pending'));
    testState.currentLineIndex = 0;
    testState.currentWordIndexInLine = 0;
    testState.completedWords = 0;
    testState.completedLines = [];
    testState.visibleLines = [0, 1, 2, 3].filter(i => i < testState.lines.length);
    
    resetCharacterTracking();
    initProMode();
}

function resetCharacterTracking() {
    testState.typedCharacters = 0;
    testState.correctCharacters = 0;
    testState.incorrectCharacters = 0;
    testState.backspaces = 0;
    testState.extraCharacters = 0;
    testState.totalKeystrokes = 0;
    testState.wordTimings = [];
    testState.wordStartTime = null;
    testState.keystrokeLog = [];
    testState.pauses = 0;
    testState.currentStreak = 0;
    testState.bestStreak = 0;
    testState.correctWords = 0;
    testState.incorrectWords = 0;
}

function initProMode() {
    const allWords = testState.lines.flat();
    proState.words = allWords;
    proState.totalWords = allWords.length;
    proState.wordStatus = new Array(allWords.length).fill('pending');
    proState.currentWordIndex = 0;
    proState.completedWords = 0;
    proState.input = "";
    proState.completedLines = [];
    
    // Reset tracking
    proState.typedCharacters = 0;
    proState.correctCharacters = 0;
    proState.incorrectCharacters = 0;
    proState.backspaces = 0;
    proState.extraCharacters = 0;
    proState.totalKeystrokes = 0;
    proState.wordTimings = [];
    proState.wordStartTime = Date.now();
    proState.keystrokeLog = [];
    proState.pauses = 0;
    proState.currentStreak = 0;
    proState.bestStreak = 0;
    proState.correctWords = 0;
    proState.incorrectWords = 0;
    
    const wordsPerLine = 8;
    proState.lines = [];
    for (let i = 0; i < allWords.length; i += wordsPerLine) {
        proState.lines.push(allWords.slice(i, i + wordsPerLine));
    }
    
    proState.visibleLines = [0, 1, 2, 3].filter(i => i < proState.lines.length);
}

// ==================== INPUT HANDLING ====================

function handleKeyDown(e) {
    if (testCompleted) return;
    
    if (!timerStarted && timeRemaining > 0 && (e.key.length === 1 || e.key === "Backspace" || e.key === " ")) {
        startTimer();
    }
    
    if (timeRemaining <= 0) return;
    
    if (e.key.length === 1 || e.key === "Backspace" || e.key === " ") {
        e.preventDefault();
    }

    if (currentMode === "normal") {
        handleNormalMode(e);
    } else if (currentMode === "pro") {
        handleProMode(e);
    } else if (currentMode === "phone") {
        handlePhoneMode(e);
    }
    
    renderText();
}

function handleNormalMode(e) {
    const currentLine = testState.lines[testState.currentLineIndex];
    if (!currentLine) return;
    
    const currentWord = currentLine[testState.currentWordIndexInLine];
    const currentInput = testState.lineInputs[testState.currentLineIndex] || "";
    const inputWords = currentInput.split(' ');
    const currentInputWord = inputWords[testState.currentWordIndexInLine] || "";

    if (e.key === "Backspace") {
        if (currentInputWord.length > 0) {
            // Track backspace
            trackKeystroke('Backspace', false, true, false, currentWord);
            inputWords[testState.currentWordIndexInLine] = currentInputWord.slice(0, -1);
            testState.lineInputs[testState.currentLineIndex] = inputWords.join(' ').trim();
        } else if (testState.currentWordIndexInLine > 0) {
            testState.currentWordIndexInLine--;
            testState.completedWords--;
            testState.lineStatus[testState.currentLineIndex][testState.currentWordIndexInLine] = 'pending';
            trackKeystroke('Backspace', false, true, false, currentWord);
        }
    }
    
    else if (e.key === " ") {
        if (currentInputWord.length > 0) {
            const isCorrect = (currentInputWord === currentWord);
            testState.lineStatus[testState.currentLineIndex][testState.currentWordIndexInLine] = isCorrect ? 'correct' : 'incorrect';
            
            // Track space as correct keystroke
            trackKeystroke('Space', true, false, true, currentWord);
            recordWordCompletion(isCorrect);
            
            testState.lineInputs[testState.currentLineIndex] = currentInput + ' ';
            testState.completedWords++;
            
            if (testState.completedWords >= testState.originalTotalWords) {
                checkAndLoadNextText();
            }
            
            if (testState.currentWordIndexInLine + 1 < currentLine.length) {
                testState.currentWordIndexInLine++;
            } else {
                moveToNextLine();
            }
        }
    }
    
    else if (e.key.length === 1) {
        const expectedChar = currentWord[currentInputWord.length] || '';
        const isCorrect = (e.key === expectedChar);
        
        // Track character keystroke
        trackKeystroke(e.key, isCorrect, false, false, currentWord);
        
        inputWords[testState.currentWordIndexInLine] = currentInputWord + e.key;
        testState.lineInputs[testState.currentLineIndex] = inputWords.join(' ').trim();
    }
}

function handleProMode(e) {
    const currentWord = proState.words[proState.currentWordIndex];
    if (!currentWord) return;
    
    if (e.key === "Backspace") {
        if (proState.input.length > 0) {
            trackKeystroke('Backspace', false, true, false, currentWord);
            proState.input = proState.input.slice(0, -1);
        } else if (proState.currentWordIndex > 0) {
            proState.currentWordIndex--;
            proState.completedWords--;
            proState.wordStatus[proState.currentWordIndex] = 'pending';
            proState.input = "";
            trackKeystroke('Backspace', false, true, false, currentWord);
            updateProLines();
        }
    }
    
    else if (e.key === " ") {
        if (proState.input.length > 0) {
            const isCorrect = (proState.input === currentWord);
            proState.wordStatus[proState.currentWordIndex] = isCorrect ? 'correct' : 'incorrect';
            
            trackKeystroke('Space', true, false, true, currentWord);
            recordWordCompletion(isCorrect);
            
            proState.completedWords++;
            proState.currentWordIndex++;
            proState.input = "";
            
            if (proState.completedWords >= proState.totalWords) {
                testState.completedWords = proState.completedWords;
                checkAndLoadNextText();
            }
            
            updateProLines();
        }
    }
    
    else if (e.key.length === 1) {
        const expectedChar = currentWord[proState.input.length] || '';
        const isCorrect = (e.key === expectedChar);
        
        trackKeystroke(e.key, isCorrect, false, false, currentWord);
        proState.input += e.key;
    }
}

function handlePhoneMode(e) {
    const allWords = testState.lines.flat();
    const currentWord = allWords[testState.completedWords] || "Done!";
    const currentInput = testState.lineInputs[testState.currentLineIndex] || "";
    const inputWords = currentInput.split(' ');
    const currentInputWord = inputWords[testState.currentWordIndexInLine] || "";

    if (e.key === "Backspace") {
        if (currentInputWord.length > 0) {
            trackKeystroke('Backspace', false, true, false, currentWord);
            inputWords[testState.currentWordIndexInLine] = currentInputWord.slice(0, -1);
            testState.lineInputs[testState.currentLineIndex] = inputWords.join(' ').trim();
        }
    }
    
    else if (e.key === " ") {
        if (currentInputWord.length > 0) {
            const isCorrect = (currentInputWord === currentWord);
            
            trackKeystroke('Space', true, false, true, currentWord);
            recordWordCompletion(isCorrect);
            
            if (isCorrect) {
                testState.correctWords++;
            } else {
                testState.incorrectWords++;
            }
            
            inputWords[testState.currentWordIndexInLine] = currentInputWord + ' ';
            testState.lineInputs[testState.currentLineIndex] = inputWords.join(' ').trim();
            testState.completedWords++;
            
            if (testState.completedWords >= testState.originalTotalWords) {
                checkAndLoadNextText();
            }
            
            testState.currentLineIndex = Math.floor(testState.completedWords / 8);
            testState.currentWordIndexInLine = testState.completedWords % 8;
        }
    }
    
    else if (e.key.length === 1) {
        const expectedChar = currentWord[currentInputWord.length] || '';
        const isCorrect = (e.key === expectedChar);
        
        trackKeystroke(e.key, isCorrect, false, false, currentWord);
        
        inputWords[testState.currentWordIndexInLine] = currentInputWord + e.key;
        testState.lineInputs[testState.currentLineIndex] = inputWords.join(' ').trim();
    }
}

function moveToNextLine() {
    const currentLineStatus = testState.lineStatus[testState.currentLineIndex];
    const allCompleted = currentLineStatus.every(s => s === 'correct' || s === 'incorrect');
    
    if (allCompleted && testState.currentLineIndex + 1 < testState.lines.length) {
        testState.completedLines.push(testState.currentLineIndex);
        testState.currentLineIndex++;
        testState.currentWordIndexInLine = 0;
        setTimeout(updateVisibleLines, 300);
    }
}

function updateVisibleLines() {
    testState.visibleLines = [
        testState.currentLineIndex,
        testState.currentLineIndex + 1,
        testState.currentLineIndex + 2,
        testState.currentLineIndex + 3
    ].filter(i => i < testState.lines.length);
}

function updateProLines() {
    const currentLineIndex = Math.floor(proState.currentWordIndex / 8);
    
    // Mark completed lines
    if (currentLineIndex > 0) {
        const prevLineStart = (currentLineIndex - 1) * 8;
        const prevLineEnd = currentLineIndex * 8;
        const prevLineWords = proState.wordStatus.slice(prevLineStart, prevLineEnd);
        const allPrevLineCompleted = prevLineWords.every(s => s === 'correct' || s === 'incorrect');
        
        if (allPrevLineCompleted && !proState.completedLines.includes(currentLineIndex - 1)) {
            proState.completedLines.push(currentLineIndex - 1);
        }
    }
    
    proState.visibleLines = [
        currentLineIndex,
        currentLineIndex + 1,
        currentLineIndex + 2,
        currentLineIndex + 3
    ].filter(i => i < proState.lines.length);
}

// ==================== RENDER FUNCTIONS ====================

function renderText() {
    const container = document.getElementById("linesContainer");
    if (!container) return;

    container.innerHTML = currentMode === "normal" ? renderNormal() : 
                         currentMode === "pro" ? renderPro() : renderPhone();
}

function renderNormal() {
    let html = '<div class="lines-wrapper">';

    testState.visibleLines.forEach(lineIndex => {
        const lineWords = testState.lines[lineIndex];
        if (!lineWords) return;

        const isCurrentLine = lineIndex === testState.currentLineIndex;
        const lineStatus = testState.lineStatus[lineIndex];
        const isLineCompleted = lineStatus.every(s => s === 'correct' || s === 'incorrect');
        const hideClass = isLineCompleted ? 'hide-up' : '';

        // Original text line - NO ANIMATION
        html += `<div class="original-line-container ${hideClass}" data-line="${lineIndex}" style="transform: none; transition: none;">`;
        lineWords.forEach((word, i) => {
            const status = lineStatus[i];
            const wordClass = status === 'correct' || status === 'incorrect' ? 'completed-word' : 'pending-word';
            html += `<span class="word ${wordClass}">${word}</span> `;
        });
        html += `</div>`;

        // Input line - NO ANIMATION
        html += `<div class="line-input-container ${hideClass} ${isCurrentLine ? 'active-line' : ''}" data-line="${lineIndex}" style="transform: none; transition: none;">`;
        html += `<div class="input-field" onclick="document.getElementById('userInput').focus();">`;
        
        if (isCurrentLine) {
            html += renderColoredInput(lineIndex, lineWords);
        } else {
            html += `<span class="non-active-input">${testState.lineInputs[lineIndex] || ''}</span>`;
        }
        
        html += `</div></div>`;
    });

    html += `</div>`;
    
    // Stats bar - show real-time stats
    const liveAccuracy = calculateLiveAccuracy();
    const totalCorrectChars = currentMode === 'pro' ? proState.correctCharacters : testState.correctCharacters;
    const totalTypedChars = currentMode === 'pro' ? proState.typedCharacters : testState.typedCharacters;
    const elapsedMinutes = (TEST_CONFIG.DURATION - timeRemaining) / 60;
    const liveWPM = typeof TypingEngine !== 'undefined' ? TypingEngine.calculateNetWPM(totalCorrectChars, Math.max(1, elapsedMinutes * 60)) : (elapsedMinutes > 0 ? Math.round((totalCorrectChars / 5) / elapsedMinutes) : 0);
    
    const progressPercent = testState.totalWords > 0 ? Math.round((testState.completedWords / testState.totalWords) * 100) : 0;
    
    html += `<div class="typing-stats">
        <div class="stat-item">WPM: ${liveWPM > 0 ? liveWPM : 0}</div>
        <div class="stat-item">Chars: ${totalCorrectChars}/${totalTypedChars}</div>
        <div class="stat-item">Accuracy: ${liveAccuracy}%</div>
        <div class="stat-item">Streak: ${currentMode === 'pro' ? proState.currentStreak : testState.currentStreak}</div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${progressPercent}%"></div></div>
    </div>`;
    
    return html;
}

function renderPro() {
    let html = '<div class="pro-mode-wrapper">';
    
    // Reference text - NO ANIMATION
    html += `<div class="full-text">`;
    proState.lines.forEach((lineWords, lineIdx) => {
        const isLineCompleted = proState.completedLines.includes(lineIdx);
        const hideClass = isLineCompleted ? 'hide-up' : '';
        
        html += `<div class="pro-line-wrapper ${hideClass}" style="transform: none; transition: none;">`;
        lineWords.forEach((word, i) => {
            const globalIdx = lineIdx * 8 + i;
            const status = proState.wordStatus[globalIdx];
            let wordClass = 'pending-word';
            if (status === 'correct') wordClass = 'completed-word';
            else if (status === 'incorrect') wordClass = 'completed-word incorrect-word';
            html += `<span class="word ${wordClass}">${word}</span> `;
        });
        html += `</div>`;
    });
    html += `</div>`;
    
    // Input area - NO ANIMATION, NO PLACEHOLDERS
    html += `<div class="pro-input-box" id="proInputField" style="transform: none; transition: none;">`;
    
    proState.visibleLines.forEach(lineIdx => {
        const lineWords = proState.lines[lineIdx];
        if (!lineWords) return;
        
        const isCurrentLine = Math.floor(proState.currentWordIndex / 8) === lineIdx;
        
        html += `<div class="pro-line-wrapper" style="transform: none; transition: none;">`;
        
        lineWords.forEach((word, i) => {
            const globalIdx = lineIdx * 8 + i;
            
            if (globalIdx < proState.currentWordIndex) {
                // Completed word - show with proper color
                const status = proState.wordStatus[globalIdx];
                const isCorrect = status === 'correct';
                html += `<span class="${isCorrect ? 'word-correct' : 'word-incorrect'}">${word}</span> `;
                
            } else if (globalIdx === proState.currentWordIndex) {
                // ✅ Current word ONLY - show with character highlighting
                html += `<span class="pro-current-word">`;
                for (let j = 0; j < proState.input.length; j++) {
                    if (j < word.length) {
                        const isCorrect = proState.input[j] === word[j];
                        html += `<span class="char ${isCorrect ? 'char-correct' : 'char-incorrect'}">${proState.input[j]}</span>`;
                    } else {
                        html += `<span class="char char-incorrect extra-char">${proState.input[j]}</span>`;
                        // Track extra character
                        if (!testCompleted) proState.extraCharacters++;
                    }
                }
                if (proState.input.length < word.length) {
                    // Show remaining part of current word only (no placeholders for future words)
                    html += `<span class="char-remaining-hint">${word.slice(proState.input.length)}</span>`;
                }
                html += `</span>`;
                if (isCurrentLine) html += `<span class="cursor-blink"></span>`;
                html += ` `;
                
            } else {
                // ✅ FUTURE WORDS - COMPLETELY REMOVED (no placeholders)
                // Sirf space add karo for structure but no content
                html += `<span style="display: none;">${word}</span> `;
            }
        });
        
        html += `</div>`;
    });
    
    html += `</div>`;
    
    // Stats
    const accuracy = calculateLiveAccuracy();
    const elapsedMinutes = (TEST_CONFIG.DURATION - timeRemaining) / 60;
    const liveWPM = typeof TypingEngine !== 'undefined' ? TypingEngine.calculateNetWPM(proState.correctCharacters, Math.max(1, elapsedMinutes * 60)) : (elapsedMinutes > 0 ? Math.round((proState.correctCharacters / 5) / elapsedMinutes) : 0);
    const progressPercent = proState.totalWords > 0 ? Math.round((proState.completedWords / proState.totalWords) * 100) : 0;
    
    html += `<div class="typing-stats">
        <div class="stat-item">WPM: ${liveWPM > 0 ? liveWPM : 0}</div>
        <div class="stat-item">Chars: ${proState.correctCharacters}/${proState.typedCharacters}</div>
        <div class="stat-item">Accuracy: ${accuracy}%</div>
        <div class="stat-item">Streak: ${proState.currentStreak}</div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${progressPercent}%"></div></div>
    </div>`;
    
    return html;
}

function renderPhone() {
    const allWords = testState.lines.flat();
    const currentWord = allWords[testState.completedWords] || "Done!";
    const currentInput = testState.lineInputs[testState.currentLineIndex] || "";
    const inputWords = currentInput.split(' ');
    const currentInputWord = inputWords[testState.currentWordIndexInLine] || "";

    let wordDisplay = '';
    
    for (let i = 0; i < currentInputWord.length; i++) {
        if (i < currentWord.length) {
            const isCorrect = currentInputWord[i] === currentWord[i];
            wordDisplay += `<span class="${isCorrect ? 'correct' : 'incorrect'}">${currentInputWord[i]}</span>`;
        } else {
            wordDisplay += `<span class="incorrect extra-char">${currentInputWord[i]}</span>`;
        }
    }
    
    if (currentInputWord.length < currentWord.length) {
        wordDisplay += `<span class="char-remaining-hint">${currentWord.slice(currentInputWord.length)}</span>`;
    }
    
    wordDisplay += `<span class="cursor-blink"></span>`;

    const accuracy = calculateLiveAccuracy();
    const elapsedMinutes = (TEST_CONFIG.DURATION - timeRemaining) / 60;
    const liveWPM = typeof TypingEngine !== 'undefined' ? TypingEngine.calculateNetWPM(testState.correctCharacters, Math.max(1, elapsedMinutes * 60)) : (elapsedMinutes > 0 ? Math.round((testState.correctCharacters / 5) / elapsedMinutes) : 0);

    return `
        <div class="phone-current-word">${wordDisplay}</div>
        <div class="phone-progress">Word ${testState.completedWords + 1}/${testState.totalWords}</div>
        <div class="phone-stats">
            <span>⌨️ ${testState.correctCharacters}/${testState.typedCharacters}</span>
            <span>🎯 ${accuracy}%</span>
            <span>⚡ ${liveWPM} WPM</span>
            <span>🔥 ${testState.currentStreak}</span>
        </div>
    `;
}

function renderColoredInput(lineIndex, lineWords) {
    const lineInput = testState.lineInputs[lineIndex] || "";
    const currentWordIndex = testState.currentWordIndexInLine;
    const inputWords = lineInput.split(' ');
    let result = '';
    let cursorPlaced = false;
    
    inputWords.forEach((inputWord, i) => {
        if (i < currentWordIndex) {
            const expectedWord = lineWords[i] || '';
            const isCorrect = inputWord === expectedWord;
            result += `<span class="${isCorrect ? 'word-correct' : 'word-incorrect'}">${inputWord}</span> `;
            
        } else if (i === currentWordIndex) {
            const expectedWord = lineWords[i] || '';
            result += `<span class="current-word-container">`;
            
            // Color each character
            for (let j = 0; j < inputWord.length; j++) {
                if (j < expectedWord.length) {
                    const isCorrect = inputWord[j] === expectedWord[j];
                    result += `<span class="char ${isCorrect ? 'char-correct' : 'char-incorrect'}">${inputWord[j]}</span>`;
                } else {
                    result += `<span class="char char-incorrect extra-char">${inputWord[j]}</span>`;
                }
            }
            
            // Show remaining hint
            if (inputWord.length < expectedWord.length) {
                result += `<span class="char-remaining-hint">${expectedWord.slice(inputWord.length)}</span>`;
            }
            
            result += `</span>`;
            result += `<span class="cursor-blink"></span>`;
            cursorPlaced = true;
        }
    });
    
    if (!cursorPlaced) {
        const currentWord = lineWords[currentWordIndex] || '';
        result += `<span class="cursor-blink"></span>`;
        if (currentWord) result += `<span class="char-remaining-hint">${currentWord}</span>`;
    }
    
    return result;
}

function checkAndLoadNextText() {
    // Implementation for loading more text if needed
    console.log("Text completed");
}

// ==================== MODE CONTROL ====================

// ✅ FIXED: switchMode function (already here, no duplicate in HTML)
window.switchMode = function(mode) {
    if (timerStarted && timeRemaining > 0 && timeRemaining < initialDuration) {
        alert('Cannot switch mode while timer is running!');
        return;
    }
    
    currentMode = mode;
    testCompleted = false;
    
    if (mode === 'normal') {
        loadNewText();
    } else if (mode === 'pro') {
        initProMode();
    } else if (mode === 'phone') {
        // Phone mode just uses normal state but with phone rendering
        testState.completedWords = 0;
        testState.currentLineIndex = 0;
        testState.currentWordIndexInLine = 0;
        testState.completedLines = [];
        testState.lineInputs = testState.lines.map(() => "");
        testState.lineStatus = testState.lines.map(line => new Array(line.length).fill('pending'));
        testState.visibleLines = [0, 1, 2, 3].filter(i => i < testState.lines.length);
    }
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(mode)) {
            btn.classList.add('active');
        }
    });
    
    renderText();
};

// ✅ FIXED: resetTest function (already here, no duplicate in HTML)
window.resetTest = function() {
    timeRemaining = initialDuration;
    timerStarted = false;
    testCompleted = false;
    
    const timerElement = document.getElementById('timer');
    if (timerElement) timerElement.textContent = formatTimeMMSS(timeRemaining);
    
    const timerContainer = document.querySelector('.timer-container');
    if (timerContainer) timerContainer.classList.remove('timer-critical');
    
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('disabled');
        btn.style.pointerEvents = 'auto';
        btn.style.opacity = '1';
    });
    
    if (currentMode === 'normal') {
        loadNewText();
    } else if (currentMode === 'pro') {
        initProMode();
    } else if (currentMode === 'phone') {
        testState.completedWords = 0;
        testState.currentLineIndex = 0;
        testState.currentWordIndexInLine = 0;
        testState.completedLines = [];
        testState.lineInputs = testState.lines.map(() => "");
        testState.lineStatus = testState.lines.map(line => new Array(line.length).fill('pending'));
        testState.visibleLines = [0, 1, 2, 3].filter(i => i < testState.lines.length);
    }
    
    renderText();
    
    setTimeout(() => {
        document.getElementById('userInput')?.focus();
    }, 100);
};

// ==================== INITIALIZATION ====================

function initializeTest() {
    loadNewText();
    renderText();
    
    const timerElement = document.getElementById('timer');
    if (timerElement) timerElement.textContent = formatTimeMMSS(timeRemaining);
    
    document.addEventListener('keydown', handleKeyDown);
    
    document.addEventListener('click', () => {
        if (!testCompleted) document.getElementById('userInput')?.focus();
    });
    
    setTimeout(() => {
        document.getElementById('userInput')?.focus();
    }, 500);
}

// Theme functions
window.toggleTheme = function() {
    document.body.toggleAttribute('data-theme');
    const themeText = document.getElementById('themeText');
    if (themeText) {
        themeText.textContent = document.body.hasAttribute('data-theme') ? 'Light Mode' : 'Dark Mode';
    }
    localStorage.setItem('theme', document.body.hasAttribute('data-theme') ? 'dark' : 'light');
};

window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
};

window.closePopup = function() {
    document.getElementById('timeUpPopup').style.display = 'none';
};

window.viewResults = function() {
    window.location.href = '/results/typing-results.html?duration=5&mode=' + currentMode;
};

window.goToHome = function() {
    window.location.href = '/index.html';
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.getTestText !== 'function') {
        console.error('text-manager.js not loaded!');
    }
    
    initializeTest();
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const themeText = document.getElementById('themeText');
        if (themeText) themeText.textContent = 'Light Mode';
    }
});

// Export functions
window.switchMode = switchMode;
window.resetTest = resetTest;
window.toggleTheme = toggleTheme;
window.toggleMobileMenu = toggleMobileMenu;
window.closePopup = closePopup;
window.viewResults = viewResults;
window.goToHome = goToHome;
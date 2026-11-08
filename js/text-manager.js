// text-manager.js - Handles random text selection and infinite text generation

// ===================== CONFIGURATION =====================

const TEXT_CONFIG = {
    // Words needed for each test duration
    durationWords: {
        '1': 86,    // 1 minute test needs ~86 words
        '2': 86,    // 2 minute test also needs ~86 words (faster typists)
        '5': 390,   // 5 minute test needs ~390 words
        '10': 652,  // 10 minute test needs ~652 words
        '15': 833,  // 15 minute test needs ~833 words
        '30': 1418  // 30 minute test needs ~1418 words
    },
    
    // Store used texts to avoid immediate repetition
    recentlyUsed: [],
    maxRecentSize: 10 // Remember last 10 used texts
};

// ===================== TEXT SELECTION =====================

/**
 * Get random text samples from the database
 * @param {number} wordCount - Number of words needed
 * @param {string} duration - Test duration in minutes
 * @returns {Array} Array of text objects
 */
function getRandomTexts(wordCount, duration) {
    const texts = [];
    let remainingWords = wordCount;
    
    while (remainingWords > 0) {
        // Get a random text that hasn't been used recently
        const randomText = getRandomUnusedText();
        
        // Add to texts array
        texts.push(randomText);
        
        // Track used texts
        addToRecentlyUsed(randomText.id);
        
        // Reduce remaining words
        remainingWords -= countWords(randomText.text);
    }
    
    return texts;
}

/**
 * Get a single random text that hasn't been used recently
 */
function getRandomUnusedText() {
    // Make sure TEXT_SAMPLES is available
    if (!window.TEXT_SAMPLES || window.TEXT_SAMPLES.length === 0) {
        console.error('TEXT_SAMPLES not found!');
        return { id: 0, text: "Default text for typing test." };
    }
    
    // Filter out recently used texts
    const availableTexts = window.TEXT_SAMPLES.filter(
        text => !TEXT_CONFIG.recentlyUsed.includes(text.id)
    );
    
    // If all texts have been used, clear recent list and use any
    if (availableTexts.length === 0) {
        TEXT_CONFIG.recentlyUsed = [];
        return window.TEXT_SAMPLES[Math.floor(Math.random() * window.TEXT_SAMPLES.length)];
    }
    
    // Return random from available
    return availableTexts[Math.floor(Math.random() * availableTexts.length)];
}

/**
 * Add text ID to recently used list
 */
function addToRecentlyUsed(textId) {
    TEXT_CONFIG.recentlyUsed.push(textId);
    
    // Keep only last 10
    if (TEXT_CONFIG.recentlyUsed.length > TEXT_CONFIG.maxRecentSize) {
        TEXT_CONFIG.recentlyUsed.shift();
    }
}

/**
 * Count words in a text
 */
function countWords(text) {
    return text.split(/\s+/).length;
}

/**
 * Combine multiple texts into one string
 */
function combineTexts(texts) {
    return texts.map(t => t.text).join(' ');
}

/**
 * Get complete text for a test duration
 */
function getTestText(duration) {
    const wordCount = TEXT_CONFIG.durationWords[duration] || 100;
    const texts = getRandomTexts(wordCount, duration);
    return {
        texts: texts,
        fullText: combineTexts(texts),
        wordCount: wordCount,
        actualWordCount: texts.reduce((sum, t) => sum + countWords(t.text), 0)
    };
}

/**
 * Get next text when current is completed before timer ends
 */
function getNextText() {
    // Get new random text
    return getRandomUnusedText();
}

// Make functions available globally
window.getTestText = getTestText;
window.getNextText = getNextText;
window.countWords = countWords;
window.combineTexts = combineTexts;
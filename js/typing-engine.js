/**
 * ProTypingTest - Standardized Typing Engine & Metrics Utilities
 * Provides unified, mathematically verified WPM and accuracy calculations across all tests,
 * certification modules, and results reporting.
 *
 * International standard: 1 word = 5 keystrokes (characters including spaces).
 */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TypingEngine = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    var WORD_STANDARD_LENGTH = 5;

    /**
     * Calculate Gross Words Per Minute (GWPM).
     * Measures raw typing speed including all typed keystrokes.
     * Formula: (Total Characters Typed / 5) / Time in Minutes
     *
     * @param {number} totalCharsTyped - Total characters typed (forward keystrokes)
     * @param {number} timeInSeconds - Elapsed time in seconds
     * @returns {number} Gross WPM rounded to nearest integer
     */
    function calculateGrossWPM(totalCharsTyped, timeInSeconds) {
        if (!timeInSeconds || timeInSeconds <= 0) return 0;
        var minutes = timeInSeconds / 60;
        var words = (totalCharsTyped || 0) / WORD_STANDARD_LENGTH;
        return Math.max(0, Math.round(words / minutes));
    }

    /**
     * Calculate Net Words Per Minute (NWPM).
     * Measures effective typing speed based on correctly typed characters.
     * Formula: (Correct Characters / 5) / Time in Minutes
     *
     * @param {number} correctChars - Number of correctly matched characters
     * @param {number} timeInSeconds - Elapsed time in seconds
     * @returns {number} Net WPM rounded to nearest integer
     */
    function calculateNetWPM(correctChars, timeInSeconds) {
        if (!timeInSeconds || timeInSeconds <= 0) return 0;
        var minutes = timeInSeconds / 60;
        var words = (correctChars || 0) / WORD_STANDARD_LENGTH;
        return Math.max(0, Math.round(words / minutes));
    }

    /**
     * Calculate Exam Net WPM (penalty deduction standard).
     * Used by government exams (e.g. SSC / Railway) where uncorrected errors
     * deduct directly from the gross word count.
     * Formula: Max(0, Round(((Total Characters / 5) - Uncorrected Errors) / Time in Minutes))
     *
     * @param {number} totalCharsTyped - Total characters typed
     * @param {number} uncorrectedErrors - Number of errors
     * @param {number} timeInSeconds - Elapsed time in seconds
     * @returns {number} Exam Net WPM
     */
    function calculateExamNetWPM(totalCharsTyped, uncorrectedErrors, timeInSeconds) {
        if (!timeInSeconds || timeInSeconds <= 0) return 0;
        var minutes = timeInSeconds / 60;
        var grossWords = (totalCharsTyped || 0) / WORD_STANDARD_LENGTH;
        var netWords = grossWords - (uncorrectedErrors || 0);
        return Math.max(0, Math.round(netWords / minutes));
    }

    /**
     * Calculate Accuracy Percentage.
     * Formula: (Correct Characters / Total Characters Attempted) * 100
     *
     * @param {number} correctChars - Number of correctly typed characters
     * @param {number} totalCharsAttempted - Total characters typed (correct + incorrect)
     * @returns {number} Integer between 0 and 100
     */
    function calculateAccuracy(correctChars, totalCharsAttempted) {
        var total = totalCharsAttempted || 0;
        var correct = correctChars || 0;
        if (total <= 0) return 100;
        if (correct <= 0) return 0;
        var accuracy = Math.round((correct / total) * 100);
        return Math.min(100, Math.max(0, accuracy));
    }

    /**
     * Calculate consistency from an array of per-word durations (in milliseconds).
     * Uses variance: higher consistency means lower variation in typing rhythm.
     *
     * @param {Array<number>} wordTimings - Array of word typing durations in ms
     * @returns {number} Percentage between 0 and 100
     */
    function calculateConsistency(wordTimings) {
        if (!wordTimings || wordTimings.length < 3) return 100;
        var validTimings = wordTimings.filter(function (t) { return typeof t === 'number' && t > 50 && t < 10000; });
        if (validTimings.length < 3) return 100;

        var sum = 0;
        for (var i = 0; i < validTimings.length; i++) {
            sum += validTimings[i];
        }
        var mean = sum / validTimings.length;

        var varianceSum = 0;
        for (var j = 0; j < validTimings.length; j++) {
            varianceSum += Math.pow(validTimings[j] - mean, 2);
        }
        var stdDev = Math.sqrt(varianceSum / validTimings.length);
        var coefficientOfVariation = mean > 0 ? (stdDev / mean) : 0;

        // Map CV (typically 0.15 - 0.90) to a 100-0% score
        var consistency = Math.round(100 - (coefficientOfVariation * 65));
        return Math.min(100, Math.max(10, consistency));
    }

    /**
     * Determine proficiency skill tier based on WPM and Accuracy.
     *
     * @param {number} netWPM - Net words per minute
     * @param {number} accuracy - Accuracy percentage
     * @returns {Object} Tier object with name, level, badge, and description
     */
    function getSkillTier(netWPM, accuracy) {
        var wpm = netWPM || 0;
        var acc = accuracy !== undefined ? accuracy : 100;

        if (wpm >= 100 && acc >= 98) {
            return {
                name: 'Master Typist',
                level: 'master',
                badge: '👑',
                color: '#ef4444',
                description: 'Top-tier proficiency (top 1% of typists). Exceptional speed and accuracy.'
            };
        } else if (wpm >= 80 && acc >= 96) {
            return {
                name: 'Professional',
                level: 'platinum',
                badge: '💎',
                color: '#10b981',
                description: 'Professional typist speed suitable for fast-paced transcription and coding.'
            };
        } else if (wpm >= 60 && acc >= 93) {
            return {
                name: 'Advanced',
                level: 'gold',
                badge: '🥇',
                color: '#f59e0b',
                description: 'Surpasses standard workplace typing requirements. High efficiency.'
            };
        } else if (wpm >= 40 && acc >= 90) {
            return {
                name: 'Intermediate',
                level: 'silver',
                badge: '🥈',
                color: '#3b82f6',
                description: 'Meets average office and standard administrative benchmark (40 WPM).'
            };
        } else if (wpm >= 25 && acc >= 85) {
            return {
                name: 'Developing',
                level: 'bronze',
                badge: '🥉',
                color: '#8b5cf6',
                description: 'Solid foundation. Focus on touch typing and reducing keyboard glances.'
            };
        } else {
            return {
                name: 'Beginner',
                level: 'novice',
                badge: '🌱',
                color: '#6b7280',
                description: 'Starting phase. Focus on proper home row finger placement over speed.'
            };
        }
    }

    /**
     * Perform detailed error analysis by comparing target text with typed input.
     * Returns error frequency by character and recommendations.
     *
     * @param {string} targetText - The text presented to the user
     * @param {string} typedText - The text typed by the user
     * @returns {Object} Analysis containing error counts, top mistyped keys, and advice
     */
    function analyzeTypingErrors(targetText, typedText) {
        var targetWords = (targetText || '').trim().split(/\s+/);
        var typedWords = (typedText || '').trim().split(/\s+/);
        var charErrors = {};
        var totalErrors = 0;
        var wordErrors = 0;

        var minWords = Math.min(targetWords.length, typedWords.length);
        for (var w = 0; w < minWords; w++) {
            var tWord = targetWords[w];
            var uWord = typedWords[w];
            if (tWord !== uWord) {
                wordErrors++;
                var maxLen = Math.max(tWord.length, uWord.length);
                for (var c = 0; c < maxLen; c++) {
                    var tChar = tWord[c] || '';
                    var uChar = uWord[c] || '';
                    if (tChar !== uChar && tChar !== '') {
                        var key = tChar.toLowerCase();
                        charErrors[key] = (charErrors[key] || 0) + 1;
                        totalErrors++;
                    }
                }
            }
        }

        // Sort mistyped characters by count
        var sortedChars = Object.keys(charErrors).map(function (k) {
            return { char: k, count: charErrors[k] };
        }).sort(function (a, b) {
            return b.count - a.count;
        });

        var recommendations = [];
        if (sortedChars.length > 0) {
            var topKeys = sortedChars.slice(0, 3).map(function (s) { return '"' + s.char.toUpperCase() + '"'; }).join(', ');
            recommendations.push('Practice keys ' + topKeys + ' in our Tricky Keys tool to build muscle memory.');
        }
        if (wordErrors > targetWords.length * 0.1) {
            recommendations.push('Slow down your typing pace by 10% to focus on rhythm; speed returns naturally once accuracy hits 95%.');
        } else {
            recommendations.push('Great accuracy control. Maintain this cadence and practice 5-minute tests to build stamina.');
        }

        return {
            totalErrors: totalErrors,
            wordErrors: wordErrors,
            topMistypedKeys: sortedChars.slice(0, 5),
            recommendations: recommendations
        };
    }

    return {
        WORD_STANDARD_LENGTH: WORD_STANDARD_LENGTH,
        calculateGrossWPM: calculateGrossWPM,
        calculateNetWPM: calculateNetWPM,
        calculateExamNetWPM: calculateExamNetWPM,
        calculateAccuracy: calculateAccuracy,
        calculateConsistency: calculateConsistency,
        getSkillTier: getSkillTier,
        analyzeTypingErrors: analyzeTypingErrors
    };
}));


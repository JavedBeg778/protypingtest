/**
 * Authoritative Server-Side Typing Evidence Evaluation Engine
 * Validates test completion evidence against the server-issued challenge
 * without trusting any client-supplied WPM or accuracy figures.
 */

/**
 * Evaluates typing test evidence against the authoritative challenge text.
 *
 * @param {Object} options
 * @param {Object} options.session - Server session object
 * @param {string} options.typedText - Full text typed by user
 * @param {number} options.elapsedMs - Elapsed milliseconds reported by client
 * @param {number} [options.serverNow] - Optional server timestamp override for testing
 * @returns {Object} Authoritative calculation result and eligibility determination
 */
function evaluateTypingEvidence({ session, typedText, elapsedMs, serverNow = Date.now() }) {
    if (!session || !session.challengeText) {
        return {
            valid: false,
            eligible: false,
            error: 'Invalid or missing session reference.'
        };
    }

    // 1. Validate payload size
    if (typeof typedText !== 'string') {
        return {
            valid: false,
            eligible: false,
            error: 'Invalid typing evidence: typedText must be a string.'
        };
    }

    if (typedText.length > 50000) {
        return {
            valid: false,
            eligible: false,
            error: 'Request payload exceeded maximum permissible size (50,000 characters).'
        };
    }

    // 2. Validate elapsed time (finite, positive, realistic)
    const numElapsedMs = Number(elapsedMs);
    if (!Number.isFinite(numElapsedMs) || numElapsedMs <= 0 || isNaN(numElapsedMs)) {
        return {
            valid: false,
            eligible: false,
            error: 'Invalid elapsed time: must be a positive finite number.'
        };
    }

    const serverElapsedMs = serverNow - session.createdAt;

    // Check for impossible speedrun (e.g. client claims 5 min test finished in 2 seconds of real time)
    if (serverElapsedMs < 5000) {
        return {
            valid: false,
            eligible: false,
            error: 'Fabricated test duration: submission received too quickly after session creation.'
        };
    }

    // Client elapsedMs cannot exceed actual server elapsed time by more than a network tolerance buffer (15s)
    if (numElapsedMs > serverElapsedMs + 15000) {
        return {
            valid: false,
            eligible: false,
            error: 'Inconsistent test timing: claimed elapsed time exceeds actual server session duration.'
        };
    }

    // Minimum plausible test duration (at least 20 seconds of real typing)
    if (numElapsedMs < 20000) {
        return {
            valid: false,
            eligible: false,
            error: 'Test duration too short: minimum 20 seconds of typing required for valid certification evaluation.'
        };
    }

    // 3. Authoritative Character & Word Scoring
    const challengeText = session.challengeText;
    const challengeWords = challengeText.trim().split(/\s+/);
    const typedWords = typedText.trim().split(/\s+/);

    let correctChars = 0;
    let totalCharsTyped = 0;
    let incorrectChars = 0;

    // Word-by-word alignment and character evaluation
    for (let i = 0; i < typedWords.length; i++) {
        const typedWord = typedWords[i];
        const expectedWord = challengeWords[i];

        if (!expectedWord) {
            // Extra words typed beyond challenge
            totalCharsTyped += typedWord.length + 1;
            incorrectChars += typedWord.length;
            continue;
        }

        // Compare characters within word
        for (let j = 0; j < typedWord.length; j++) {
            totalCharsTyped++;
            if (j < expectedWord.length && typedWord[j] === expectedWord[j]) {
                correctChars++;
            } else {
                incorrectChars++;
            }
        }

        // Space character between words
        if (i < typedWords.length - 1) {
            totalCharsTyped++;
            correctChars++; // Space counted as correct word separator
        }
    }

    // Elapsed minutes
    const elapsedMinutes = numElapsedMs / 60000;

    // Gross WPM: (Total Keystrokes / 5) / Minutes
    const grossWpm = Math.round((totalCharsTyped / 5) / elapsedMinutes);

    // Net WPM: (Correct Keystrokes / 5) / Minutes
    const netWpm = Math.max(0, Math.round((correctChars / 5) / elapsedMinutes));

    // Accuracy: (Correct / Total) * 100
    const accuracy = totalCharsTyped > 0 
        ? Math.min(100, Math.max(0, Math.round((correctChars / totalCharsTyped) * 100))) 
        : 100;

    // Safety checks for non-finite or negative values
    if (!Number.isFinite(grossWpm) || !Number.isFinite(netWpm) || !Number.isFinite(accuracy)) {
        return {
            valid: false,
            eligible: false,
            error: 'Mathematical computation failure: non-finite score generated.'
        };
    }

    // 4. Verify against official level criteria
    const eligible = (netWpm >= session.minWpm) && (accuracy >= session.minAccuracy);

    return {
        valid: true,
        eligible: eligible,
        grossWpm: grossWpm,
        netWpm: netWpm,
        accuracy: accuracy,
        correctChars: correctChars,
        totalChars: totalCharsTyped,
        incorrectChars: incorrectChars,
        elapsedSeconds: Math.round(numElapsedMs / 1000),
        reason: eligible 
            ? 'Score meets or exceeds tier requirements.'
            : `Score does not meet criteria for ${session.levelName}. Required: ${session.minWpm} WPM, ${session.minAccuracy}% Accuracy. Calculated: ${netWpm} WPM, ${accuracy}% Accuracy.`
    };
}

module.exports = {
    evaluateTypingEvidence
};

const fs = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { CERT_CRITERIA, CERT_CHALLENGES } = require('./cert-config');

// Path for persistent serverless session store file
const STORE_FILE = process.env.PTT_SESSION_STORE_PATH || path.join(os.tmpdir(), 'ptt-cert-sessions.json');

// In-memory cache for fast, atomic access within process lifecycle
const sessionCache = new Map();
const rateLimitCache = new Map();

// Load sessions from disk on startup if available
function loadFromDisk() {
    try {
        if (fs.existsSync(STORE_FILE)) {
            const raw = fs.readFileSync(STORE_FILE, 'utf8');
            const data = JSON.parse(raw);
            if (Array.isArray(data)) {
                const now = Date.now();
                data.forEach(item => {
                    // Keep unexpired or recently completed sessions (for replay defense)
                    if (item && item.id && (item.expiresAt > now || (item.issued && now - item.issuedAt < 86400000))) {
                        sessionCache.set(item.id, item);
                    }
                });
            }
        }
    } catch (e) {
        // Disk read failure should not crash; fallback to memory store
    }
}

// Persist sessions to disk atomically
function saveToDisk() {
    try {
        const now = Date.now();
        const activeSessions = [];
        for (const session of sessionCache.values()) {
            // Keep active sessions + issued sessions within 24h
            if (session.expiresAt > now || (session.issued && now - session.issuedAt < 86400000)) {
                activeSessions.push(session);
            }
        }
        // Write to temporary file then rename for atomic replacement
        const tempPath = STORE_FILE + '.' + crypto.randomBytes(6).toString('hex') + '.tmp';
        fs.writeFileSync(tempPath, JSON.stringify(activeSessions), 'utf8');
        fs.renameSync(tempPath, STORE_FILE);
    } catch (e) {
        // Disk write failure handled gracefully
    }
}

// Initialize on module load
loadFromDisk();

/**
 * Creates an unpredictable, server-bound test session.
 *
 * @param {Object} options
 * @param {string} options.level - Certification level ('bronze', 'silver', 'gold', etc.)
 * @param {string} options.candidate - Candidate name (optional)
 * @param {string} options.clientIp - Request client IP for rate limiting
 * @returns {Object} Session object including client challenge
 */
function createSession({ level, candidate, clientIp }) {
    const levelKey = (level || '').toLowerCase().replace(/\s+certificate/i, '').trim();
    const criteria = CERT_CRITERIA[levelKey];

    if (!criteria) {
        const err = new Error(`Invalid certificate tier requested: "${level}"`);
        err.code = 'ERR_INVALID_TIER';
        throw err;
    }

    // Unpredictable 256-bit cryptographic session ID
    const sessionId = 'sess_' + crypto.randomBytes(32).toString('hex');

    // Select random official challenge text for the tier
    const challengePool = CERT_CHALLENGES[levelKey] || CERT_CHALLENGES['bronze'];
    const challengeIndex = crypto.randomInt(0, challengePool.length);
    const challengeText = challengePool[challengeIndex];
    const textHash = crypto.createHash('sha256').update(challengeText, 'utf8').digest('hex');

    const now = Date.now();
    // Expiration: Expected test duration + 5 minutes grace period for network & reading
    const allocatedDurationMs = criteria.durationSec * 1000;
    const gracePeriodMs = 300000; // 5 minutes
    const expiresAt = now + allocatedDurationMs + gracePeriodMs;

    const session = {
        id: sessionId,
        level: levelKey,
        levelName: criteria.name,
        expectedDurationSec: criteria.durationSec,
        minWpm: criteria.minWpm,
        minAccuracy: criteria.minAccuracy,
        challengeText: challengeText,
        textHash: textHash,
        candidate: (candidate || '').trim().slice(0, 50),
        createdAt: now,
        expiresAt: expiresAt,
        issued: false,
        issuedAt: null,
        certificateId: null,
        clientIpHash: clientIp ? crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 16) : 'unknown'
    };

    sessionCache.set(sessionId, session);
    saveToDisk();

    return {
        sessionId: session.id,
        level: session.level,
        levelName: session.levelName,
        expectedDurationSec: session.expectedDurationSec,
        minWpm: session.minWpm,
        minAccuracy: session.minAccuracy,
        challengeText: session.challengeText,
        expiresAt: session.expiresAt
    };
}

/**
 * Retrieves a session by ID.
 *
 * @param {string} sessionId
 * @returns {Object|null}
 */
function getSession(sessionId) {
    if (!sessionId || typeof sessionId !== 'string') return null;
    return sessionCache.get(sessionId) || null;
}

/**
 * Consumes a session upon successful certificate signing, enforcing one-time use.
 *
 * @param {string} sessionId
 * @param {string} certificateId
 * @param {Object} scoreSummary
 * @returns {boolean} True if successfully consumed
 */
function consumeSession(sessionId, certificateId, scoreSummary = {}) {
    const session = sessionCache.get(sessionId);
    if (!session) return false;

    session.issued = true;
    session.issuedAt = Date.now();
    session.certificateId = certificateId;
    session.scoreSummary = scoreSummary;

    saveToDisk();
    return true;
}

/**
 * Enforces rate limiting per IP hash.
 *
 * @param {string} ip - Client IP
 * @param {string} action - Action identifier (e.g. 'create_session', 'sign_cert')
 * @param {number} limit - Maximum requests allowed in window
 * @param {number} windowMs - Window in milliseconds
 * @returns {boolean} True if allowed, false if rate limited
 */
function checkRateLimit(ip, action, limit = 20, windowMs = 60000) {
    if (!ip) return true; // Fail open for rate limiting if IP unknown
    const ipHash = crypto.createHash('sha256').update(ip + ':' + action).digest('hex').slice(0, 16);
    const now = Date.now();

    const record = rateLimitCache.get(ipHash) || { count: 0, resetAt: now + windowMs };
    if (now > record.resetAt) {
        record.count = 1;
        record.resetAt = now + windowMs;
        rateLimitCache.set(ipHash, record);
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count++;
    rateLimitCache.set(ipHash, record);
    return true;
}

/**
 * Resets store state for testing.
 */
function resetForTesting() {
    sessionCache.clear();
    rateLimitCache.clear();
    try {
        if (fs.existsSync(STORE_FILE)) {
            fs.unlinkSync(STORE_FILE);
        }
    } catch (e) {}
}

module.exports = {
    createSession,
    getSession,
    consumeSession,
    checkRateLimit,
    resetForTesting
};

const crypto = require('crypto');

// Known weak or committed keys that MUST be rejected to ensure authenticity
const PROHIBITED_KEYS = new Set([
    'PTT_PRODUCTION_HMAC_SECRET_KEY_v2_2026',
    'PROTYPINGTEST2026',
    '12345678901234567890123456789012',
    'abcdefghijklmnopqrstuvwxyz123456',
    'default_secret_key_change_in_production'
]);

/**
 * Validates and retrieves the server signing secret.
 * Fails closed if missing, too short (< 32 bytes), or matches a known insecure key.
 *
 * @param {string} envVarName - Environment variable name (default: CERT_SIGNING_SECRET)
 * @returns {string} Validated secret key string
 * @throws {Error} If secret is missing, insecure, or invalid
 */
function getSigningSecret(envVarName = 'CERT_SIGNING_SECRET') {
    const secret = process.env[envVarName];

    if (!secret || typeof secret !== 'string') {
        const err = new Error('Signing secret is missing in server environment (CERT_SIGNING_SECRET required).');
        err.code = 'ERR_SECRET_MISSING';
        throw err;
    }

    const byteLen = Buffer.byteLength(secret, 'utf8');
    if (byteLen < 32) {
        const err = new Error(`Insecure signing secret: key material is ${byteLen} bytes; minimum 32 bytes (256 bits) required.`);
        err.code = 'ERR_SECRET_TOO_SHORT';
        throw err;
    }

    if (PROHIBITED_KEYS.has(secret.trim())) {
        const err = new Error('Insecure signing secret: hardcoded or prohibited default key detected.');
        err.code = 'ERR_SECRET_PROHIBITED';
        throw err;
    }

    // Check for trivial repeated characters (e.g. "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    const uniqueChars = new Set(secret).size;
    if (uniqueChars < 8) {
        const err = new Error('Insecure signing secret: insufficient entropy in key material.');
        err.code = 'ERR_SECRET_LOW_ENTROPY';
        throw err;
    }

    return secret;
}

/**
 * Constant-time comparison between two hex-encoded signatures to prevent timing side-channels.
 *
 * @param {string} sigA - First signature (hex)
 * @param {string} sigB - Second signature (hex)
 * @returns {boolean} True if identical, false otherwise
 */
function timingSafeCompare(sigA, sigB) {
    if (!sigA || !sigB || typeof sigA !== 'string' || typeof sigB !== 'string') {
        return false;
    }

    try {
        const bufA = Buffer.from(sigA, 'hex');
        const bufB = Buffer.from(sigB, 'hex');

        if (bufA.length === 0 || bufA.length !== bufB.length) {
            return false;
        }

        return crypto.timingSafeEqual(bufA, bufB);
    } catch (e) {
        return false;
    }
}

module.exports = {
    getSigningSecret,
    timingSafeCompare
};

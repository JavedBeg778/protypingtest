const assert = require('assert');
const crypto = require('crypto');

// Generate a valid 256-bit test signing secret (32+ bytes of high entropy)
const TEST_VALID_SECRET = 'PTT_TEST_SECURE_KEY_32_BYTES_ENTROPY_2026_RANDOM_xyz789';

// Reset environment
process.env.CERT_SIGNING_SECRET = TEST_VALID_SECRET;

const { getSigningSecret, timingSafeCompare } = require('../netlify/functions/utils/secret-manager');
const { createSession, getSession, consumeSession, resetForTesting } = require('../netlify/functions/utils/session-store');
const { evaluateTypingEvidence } = require('../netlify/functions/utils/scoring-engine');
const createSessionHandler = require('../netlify/functions/create-session').handler;
const signCertHandler = require('../netlify/functions/sign-cert').handler;
const verifyCertHandler = require('../netlify/functions/verify-cert').handler;

console.log('===================================================================');
console.log('🔒 RUNNING CERTIFICATE SECURITY & HARDENING VERIFICATION SUITE');
console.log('===================================================================\n');

async function runTestSuite() {
    let passed = 0;
    let failed = 0;

    function test(name, fn) {
        try {
            fn();
            console.log(`  ✓ ${name}`);
            passed++;
        } catch (e) {
            console.error(`  ❌ FAIL: ${name} ->`, e.message);
            failed++;
        }
    }

    async function asyncTest(name, fn) {
        try {
            await fn();
            console.log(`  ✓ ${name}`);
            passed++;
        } catch (e) {
            console.error(`  ❌ FAIL: ${name} ->`, e.message);
            failed++;
        }
    }

    // -------------------------------------------------------------
    // SECTION 1: Signing Secret Validation & Fallback Eradication
    // -------------------------------------------------------------
    console.log('--- Section 1: Insecure Secret Fallback Eradication ---');

    test('Missing secret fails closed (ERR_SECRET_MISSING)', () => {
        delete process.env.CERT_SIGNING_SECRET;
        assert.throws(() => {
            getSigningSecret('CERT_SIGNING_SECRET');
        }, /missing in server environment/i);
    });

    test('Short secret (< 32 bytes) fails closed (ERR_SECRET_TOO_SHORT)', () => {
        process.env.CERT_SIGNING_SECRET = 'too_short_key_12345';
        assert.throws(() => {
            getSigningSecret('CERT_SIGNING_SECRET');
        }, /minimum 32 bytes/i);
    });

    test('Hardcoded placeholder secret fails closed (ERR_SECRET_PROHIBITED)', () => {
        process.env.CERT_SIGNING_SECRET = 'PTT_PRODUCTION_HMAC_SECRET_KEY_v2_2026';
        assert.throws(() => {
            getSigningSecret('CERT_SIGNING_SECRET');
        }, /prohibited default key/i);
    });

    test('Low entropy secret fails closed (ERR_SECRET_LOW_ENTROPY)', () => {
        process.env.CERT_SIGNING_SECRET = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'; // 32 bytes but 1 unique char
        assert.throws(() => {
            getSigningSecret('CERT_SIGNING_SECRET');
        }, /insufficient entropy/i);
    });

    test('Valid 256-bit secret succeeds', () => {
        process.env.CERT_SIGNING_SECRET = TEST_VALID_SECRET;
        const secret = getSigningSecret('CERT_SIGNING_SECRET');
        assert.strictEqual(secret, TEST_VALID_SECRET);
    });

    await asyncTest('sign-cert handler fails closed with HTTP 500 when secret missing', async () => {
        delete process.env.CERT_SIGNING_SECRET;
        const res = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({ sessionId: 'dummy' })
        });
        assert.strictEqual(res.statusCode, 500);
        const data = JSON.parse(res.body);
        assert.ok(data.error.includes('unavailable'));
        // Restore secret
        process.env.CERT_SIGNING_SECRET = TEST_VALID_SECRET;
    });

    await asyncTest('verify-cert handler fails closed with HTTP 500 when secret missing', async () => {
        delete process.env.CERT_SIGNING_SECRET;
        const res = await verifyCertHandler({
            httpMethod: 'GET',
            queryStringParameters: { cert: 'any_token' }
        });
        assert.strictEqual(res.statusCode, 500);
        const data = JSON.parse(res.body);
        assert.ok(data.error.includes('unavailable'));
        // Restore secret
        process.env.CERT_SIGNING_SECRET = TEST_VALID_SECRET;
    });

    // -------------------------------------------------------------
    // SECTION 2: Anti-Arbitrary Signing & Server Sessions
    // -------------------------------------------------------------
    console.log('\n--- Section 2: Server-Side Sessions & Anti-Arbitrary Signing ---');

    await asyncTest('Rejects direct API call without sessionId', async () => {
        const res = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                candidate: 'Hacker User',
                wpm: 120,
                accuracy: 99,
                level: 'master'
            })
        });
        assert.strictEqual(res.statusCode, 400);
        const data = JSON.parse(res.body);
        assert.ok(data.error.includes('Direct score signing prohibited') || data.error.includes('sessionId'));
    });

    await asyncTest('Rejects nonexistent sessionId', async () => {
        const res = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                sessionId: 'sess_fake_1234567890abcdef',
                candidate: 'Test',
                typedText: 'Some text',
                elapsedMs: 60000
            })
        });
        assert.strictEqual(res.statusCode, 400);
        const data = JSON.parse(res.body);
        assert.ok(data.error.includes('Invalid or nonexistent session ID'));
    });

    await asyncTest('Rejects invalid certificate tier', async () => {
        const res = await createSessionHandler({
            httpMethod: 'POST',
            body: JSON.stringify({ level: 'super_galaxy_tier' })
        });
        assert.strictEqual(res.statusCode, 400);
        const data = JSON.parse(res.body);
        assert.ok(data.error.includes('Invalid certificate tier'));
    });

    await asyncTest('Rejects negative or non-finite elapsed time', async () => {
        resetForTesting();
        const sessRes = await createSessionHandler({
            httpMethod: 'POST',
            body: JSON.stringify({ level: 'silver', candidate: 'Dev' })
        });
        const sessionData = JSON.parse(sessRes.body);

        for (const badTime of [-5000, 0, 'abc', NaN, Infinity]) {
            const res = await signCertHandler({
                httpMethod: 'POST',
                body: JSON.stringify({
                    sessionId: sessionData.sessionId,
                    candidate: 'Dev',
                    typedText: 'Some typing',
                    elapsedMs: badTime
                })
            });
            assert.strictEqual(res.statusCode, 400, `Should reject elapsedMs: ${badTime}`);
        }
    });

    await asyncTest('Rejects test duration that is too short (< 20 seconds)', async () => {
        resetForTesting();
        const sessRes = await createSessionHandler({
            httpMethod: 'POST',
            body: JSON.stringify({ level: 'bronze' })
        });
        const sessionData = JSON.parse(sessRes.body);

        const res = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                sessionId: sessionData.sessionId,
                candidate: 'Speedy',
                typedText: sessionData.challengeText,
                elapsedMs: 5000 // Only 5 seconds
            })
        });
        assert.strictEqual(res.statusCode, 400);
        const data = JSON.parse(res.body);
        assert.ok(data.error.includes('too short') || data.error.includes('Fabricated'));
    });

    await asyncTest('Rejects expired test sessions', async () => {
        resetForTesting();
        const sess = createSession({ level: 'bronze', candidate: 'Late User' });
        // Manually artificially expire the session
        const stored = getSession(sess.sessionId);
        stored.expiresAt = Date.now() - 1000;

        const res = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                sessionId: sess.sessionId,
                candidate: 'Late User',
                typedText: sess.challengeText,
                elapsedMs: 60000
            })
        });
        assert.strictEqual(res.statusCode, 400);
        const data = JSON.parse(res.body);
        assert.ok(data.error.includes('expired'));
    });

    await asyncTest('Ignores client-supplied scores and calculates true score from evidence', async () => {
        resetForTesting();
        // User claims to have 120 WPM on Bronze, but typed poorly
        const sess = createSession({ level: 'bronze', candidate: 'Cheater' });
        
        // Advance time slightly to satisfy anti-instant check
        const stored = getSession(sess.sessionId);
        stored.createdAt = Date.now() - 65000;

        // User typed garbled text
        const garbledText = 'xyz abc qwe 123 456';
        const res = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                sessionId: sess.sessionId,
                candidate: 'Cheater',
                wpm: 120, // Claimed high score
                accuracy: 99, // Claimed high accuracy
                typedText: garbledText,
                elapsedMs: 60000
            })
        });
        assert.strictEqual(res.statusCode, 400);
        const data = JSON.parse(res.body);
        assert.ok(data.error.includes('does not meet criteria') || data.error.includes('Ineligible'));
        assert.ok(data.calculated.netWpm < 25);
    });

    await asyncTest('Prevents session replay (one-time issuance defense)', async () => {
        resetForTesting();
        const sess = createSession({ level: 'bronze', candidate: 'Replay Candidate' });
        const stored = getSession(sess.sessionId);
        stored.createdAt = Date.now() - 65000;

        // First submission with eligible typed text
        const firstRes = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                sessionId: sess.sessionId,
                candidate: 'Replay Candidate',
                typedText: sess.challengeText,
                elapsedMs: 60000
            })
        });
        assert.strictEqual(firstRes.statusCode, 200, 'First submission should succeed');

        // Second submission with exact same sessionId (Replay attack)
        const secondRes = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                sessionId: sess.sessionId,
                candidate: 'Replay Candidate',
                typedText: sess.challengeText,
                elapsedMs: 60000
            })
        });
        assert.strictEqual(secondRes.statusCode, 409, 'Replay attempt must return HTTP 409 Conflict');
        const secondData = JSON.parse(secondRes.body);
        assert.ok(secondData.error.includes('replay detected'));
    });

    // -------------------------------------------------------------
    // SECTION 3: Cryptographic Verification & Tamper Resistance
    // -------------------------------------------------------------
    console.log('\n--- Section 3: Constant-Time HMAC-SHA256 Verification ---');

    await asyncTest('Valid end-to-end certification workflow generates verifiable certificate', async () => {
        resetForTesting();
        // 1. Create session
        const sessRes = await createSessionHandler({
            httpMethod: 'POST',
            body: JSON.stringify({ level: 'gold', candidate: 'Kavita Patel' })
        });
        assert.strictEqual(sessRes.statusCode, 200);
        const sessionData = JSON.parse(sessRes.body);

        // Advance session time to simulate 72s test duration (84 words in 72s = 70 WPM)
        const stored = getSession(sessionData.sessionId);
        stored.createdAt = Date.now() - 75000;

        // 2. Sign certificate with matching challenge text (approx 70 WPM in 72s)
        const signRes = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                sessionId: sessionData.sessionId,
                candidate: 'Kavita Patel',
                typedText: sessionData.challengeText,
                elapsedMs: 72000
            })
        });
        assert.strictEqual(signRes.statusCode, 200);
        const signData = JSON.parse(signRes.body);
        assert.strictEqual(signData.success, true);
        assert.strictEqual(signData.candidate, 'Kavita Patel');
        assert.strictEqual(signData.level, 'Gold Certificate');
        assert.ok(signData.wpm >= 60, `Expected >= 60 WPM, got ${signData.wpm}`);
        assert.ok(signData.accuracy >= 95, `Expected >= 95%, got ${signData.accuracy}`);
        assert.ok(signData.token);

        // 3. Verify certificate token via verify-cert
        const verifyRes = await verifyCertHandler({
            httpMethod: 'GET',
            queryStringParameters: { cert: signData.token }
        });
        assert.strictEqual(verifyRes.statusCode, 200);
        const verifyData = JSON.parse(verifyRes.body);
        assert.strictEqual(verifyData.valid, true);
        assert.strictEqual(verifyData.authentic, true);
        assert.strictEqual(verifyData.data.candidate, 'Kavita Patel');
        assert.strictEqual(verifyData.data.wpm, signData.wpm);
        assert.strictEqual(verifyData.data.accuracy, signData.accuracy);
        assert.strictEqual(verifyData.data.level, 'Gold Certificate');
        assert.strictEqual(verifyData.data.certId, signData.certId);
    });

    await asyncTest('Tampered payload data is rejected by signature verification', async () => {
        resetForTesting();
        const sess = createSession({ level: 'silver', candidate: 'Original Name' });
        const stored = getSession(sess.sessionId);
        stored.createdAt = Date.now() - 65000;

        const signRes = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                sessionId: sess.sessionId,
                candidate: 'Original Name',
                typedText: sess.challengeText,
                elapsedMs: 60000
            })
        });
        assert.strictEqual(signRes.statusCode, 200, 'Original session should sign successfully');
        const token = JSON.parse(signRes.body).token;
        const decoded = Buffer.from(token, 'base64').toString('utf8');

        // Tamper: Modify candidate name
        const tamperedPayload = decoded.replace('Original Name', 'Forged Name');
        const tamperedToken = Buffer.from(tamperedPayload, 'utf8').toString('base64');

        const verifyRes = await verifyCertHandler({
            httpMethod: 'GET',
            queryStringParameters: { cert: tamperedToken }
        });
        assert.strictEqual(verifyRes.statusCode, 200);
        const verifyData = JSON.parse(verifyRes.body);
        assert.strictEqual(verifyData.valid, false);
        assert.strictEqual(verifyData.authentic, false);
        assert.ok(verifyData.error.includes('mismatch') || verifyData.error.includes('altered'));
    });

    await asyncTest('Tampered signature bytes are rejected', async () => {
        resetForTesting();
        const sess = createSession({ level: 'silver', candidate: 'Student' });
        const stored = getSession(sess.sessionId);
        stored.createdAt = Date.now() - 65000;

        const signRes = await signCertHandler({
            httpMethod: 'POST',
            body: JSON.stringify({
                sessionId: sess.sessionId,
                candidate: 'Student',
                typedText: sess.challengeText,
                elapsedMs: 60000
            })
        });
        assert.strictEqual(signRes.statusCode, 200, 'Session should sign successfully');
        const token = JSON.parse(signRes.body).token;
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const parts = decoded.split('|');

        // Corrupt signature hex string
        parts[parts.length - 1] = '00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff';
        const corruptedToken = Buffer.from(parts.join('|'), 'utf8').toString('base64');

        const verifyRes = await verifyCertHandler({
            httpMethod: 'GET',
            queryStringParameters: { cert: corruptedToken }
        });
        assert.strictEqual(verifyRes.statusCode, 200);
        const verifyData = JSON.parse(verifyRes.body);
        assert.strictEqual(verifyData.valid, false);
        assert.strictEqual(verifyData.authentic, false);
    });

    // -------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------
    console.log('\n===================================================================');
    console.log(`🏁 CERTIFICATE SECURITY TEST SUMMARY:`);
    console.log(`   Passed: ${passed}`);
    console.log(`   Failed: ${failed}`);
    console.log('===================================================================');

    if (failed > 0) {
        process.exit(1);
    }
}

runTestSuite().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});

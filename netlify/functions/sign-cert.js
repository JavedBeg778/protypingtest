const crypto = require('crypto');
const { getSigningSecret } = require('./utils/secret-manager');
const { getSession, consumeSession, checkRateLimit } = require('./utils/session-store');
const { evaluateTypingEvidence } = require('./utils/scoring-engine');

exports.handler = async function(event, context) {
    // Only accept POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // 1. Validate server signing secret - fail closed if missing or insecure
    let serverSecret;
    try {
        serverSecret = getSigningSecret('CERT_SIGNING_SECRET');
    } catch (secErr) {
        // Controlled 500 error; never leak key material or stack trace
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Server configuration error: certificate signing service is temporarily unavailable.' 
            })
        };
    }

    // 2. Request size limit check (max 64 KB)
    const rawBody = event.body || '';
    if (rawBody.length > 65536) {
        return {
            statusCode: 413,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Request payload exceeded maximum permissible size (64 KB).' })
        };
    }

    // 3. Client IP rate limiting (max 15 signing submissions per 10 minutes)
    const headers = event.headers || {};
    const clientIp = headers['client-ip'] || 
                     headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                     headers['x-real-ip'] || 
                     '127.0.0.1';

    if (!checkRateLimit(clientIp, 'sign_cert', 15, 600000)) {
        return {
            statusCode: 429,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Too many certificate verification requests. Please wait before submitting again.' })
        };
    }

    try {
        const body = JSON.parse(rawBody || '{}');
        const { sessionId, candidate, typedText, elapsedMs } = body;

        // 4. Reject arbitrary / direct signing attempts without server session
        if (!sessionId || typeof sessionId !== 'string') {
            return {
                statusCode: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Direct score signing prohibited. A valid server-bound "sessionId" is required.' 
                })
            };
        }

        // 5. Look up session in durable session store
        const session = getSession(sessionId);
        if (!session) {
            return {
                statusCode: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Invalid or nonexistent session ID. Please restart the certification test.' })
            };
        }

        // 6. Check session replay (one-time issuance defense)
        if (session.issued) {
            return {
                statusCode: 409,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Session replay detected. This test session has already been used to issue a certificate.' 
                })
            };
        }

        // 7. Check session expiration
        const now = Date.now();
        if (now > session.expiresAt) {
            return {
                statusCode: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Session expired. Certification tests must be completed and submitted within the allocated duration.' 
                })
            };
        }

        // 8. Independently calculate and validate scores from submitted typing evidence
        const evaluation = evaluateTypingEvidence({
            session: session,
            typedText: typedText,
            elapsedMs: elapsedMs,
            serverNow: now
        });

        if (!evaluation.valid) {
            return {
                statusCode: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: evaluation.error || 'Invalid test evidence submission.' })
            };
        }

        // If score is ineligible, burn the session so it cannot be tampered with or replayed
        if (!evaluation.eligible) {
            consumeSession(sessionId, 'INELIGIBLE', evaluation);
            return {
                statusCode: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: evaluation.reason,
                    calculated: {
                        netWpm: evaluation.netWpm,
                        grossWpm: evaluation.grossWpm,
                        accuracy: evaluation.accuracy,
                        requiredWpm: session.minWpm,
                        requiredAccuracy: session.minAccuracy
                    }
                })
            };
        }

        // 9. Candidate name sanitation
        const cleanName = (candidate || session.candidate || 'Typing Candidate').trim().slice(0, 50);

        // 10. Generate authoritative verified certificate ID and date
        const dateStr = new Date().toISOString().slice(0, 10);
        const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
        const certId = `PTT-${dateStr.replace(/-/g, '')}-${randomSuffix}`;

        // 11. Consume session BEFORE generating response (enforces single-use)
        consumeSession(sessionId, certId, evaluation);

        // 12. Construct authoritative signed payload (server metrics only!)
        // Format: Candidate|NetWPM|Accuracy|TierName|IssueDate|CertificateID
        const payloadString = `${cleanName}|${evaluation.netWpm}|${evaluation.accuracy.toFixed(1)}|${session.levelName}|${dateStr}|${certId}`;

        // Generate HMAC-SHA256 signature using validated server secret
        const signature = crypto.createHmac('sha256', serverSecret)
            .update(payloadString)
            .digest('hex');

        // Combined token: Base64(payloadString + '|' + signature)
        const rawToken = `${payloadString}|${signature}`;
        const token = Buffer.from(rawToken, 'utf8').toString('base64');

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, must-revalidate'
            },
            body: JSON.stringify({
                success: true,
                verified: true,
                certId: certId,
                token: token,
                candidate: cleanName,
                wpm: evaluation.netWpm,
                grossWpm: evaluation.grossWpm,
                accuracy: evaluation.accuracy,
                level: session.levelName,
                date: dateStr,
                verifyUrl: `/certificate/verify?cert=${token}`,
                disclaimer: 'Non-Accreditation Notice: This certificate verifies results from an online practice test on ProTypingTest.in. It is intended for self-assessment and skills demonstration, not as a statutory government qualification.'
            })
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: 'Internal server error while processing certificate signing.' })
        };
    }
};

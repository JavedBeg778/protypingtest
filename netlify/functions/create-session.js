const { createSession, checkRateLimit } = require('./utils/session-store');

exports.handler = async function(event, context) {
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

    try {
        const headers = event.headers || {};
        const clientIp = headers['client-ip'] || 
                         headers['x-forwarded-for']?.split(',')[0]?.trim() || 
                         headers['x-real-ip'] || 
                         '127.0.0.1';

        // Apply rate limit: max 30 session initializations per minute per IP
        if (!checkRateLimit(clientIp, 'create_session', 30, 60000)) {
            return {
                statusCode: 429,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Too many test sessions initiated. Please wait a minute before starting another test.' })
            };
        }

        const body = JSON.parse(event.body || '{}');
        const { level, candidate } = body;

        if (!level || typeof level !== 'string') {
            return {
                statusCode: 400,
                headers: { 
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Missing or invalid "level" parameter (bronze, silver, gold, platinum, diamond, master).' })
            };
        }

        const session = createSession({
            level: level,
            candidate: candidate,
            clientIp: clientIp
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, must-revalidate'
            },
            body: JSON.stringify({
                success: true,
                sessionId: session.sessionId,
                level: session.level,
                levelName: session.levelName,
                expectedDurationSec: session.expectedDurationSec,
                minWpm: session.minWpm,
                minAccuracy: session.minAccuracy,
                challengeText: session.challengeText,
                expiresAt: session.expiresAt
            })
        };
    } catch (err) {
        const statusCode = err.code === 'ERR_INVALID_TIER' ? 400 : 500;
        return {
            statusCode: statusCode,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: err.message || 'Failed to initialize certification session.' })
        };
    }
};

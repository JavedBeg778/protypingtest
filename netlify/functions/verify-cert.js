const crypto = require('crypto');
const { getSigningSecret, timingSafeCompare } = require('./utils/secret-manager');
const { CERT_CRITERIA } = require('./utils/cert-config');

exports.handler = async function(event, context) {
    const params = event.queryStringParameters || {};
    let token = params.cert || params.token;

    if (!token && event.httpMethod === 'POST') {
        try {
            const body = JSON.parse(event.body || '{}');
            token = body.token || body.cert;
        } catch (e) {}
    }

    if (!token) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ valid: false, error: 'Missing certificate token parameter.' })
        };
    }

    // 1. Validate server secret - fail closed if missing or insecure
    let serverSecret;
    try {
        serverSecret = getSigningSecret('CERT_SIGNING_SECRET');
    } catch (secErr) {
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                valid: false,
                error: 'Server configuration error: certificate verification service is temporarily unavailable.'
            })
        };
    }

    try {
        const decoded = Buffer.from(token, 'base64').toString('utf8');
        const parts = decoded.split('|');

        if (parts.length < 7) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    valid: false,
                    authentic: false,
                    error: 'Malformed certificate token format.'
                })
            };
        }

        const [candidate, wpmStr, accStr, level, date, certId, receivedSignature] = parts;
        const payloadString = `${candidate}|${wpmStr}|${accStr}|${level}|${date}|${certId}`;

        // Compute expected HMAC-SHA256 signature
        const expectedSignature = crypto.createHmac('sha256', serverSecret)
            .update(payloadString)
            .digest('hex');

        // Constant-time evaluation to prevent timing side-channels
        const isAuthentic = timingSafeCompare(expectedSignature, receivedSignature);

        if (!isAuthentic) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    valid: false,
                    authentic: false,
                    error: 'Digital signature mismatch. This certificate token has been altered or was not signed by the ProTypingTest server.'
                })
            };
        }

        const wpm = parseInt(wpmStr, 10);
        const accuracy = parseFloat(accStr);

        // Verify criteria for level
        const levelKey = (level || '').toLowerCase().replace(/\s+certificate/i, '').trim();
        const criteria = CERT_CRITERIA[levelKey];
        if (criteria && (wpm < criteria.minWpm || accuracy < criteria.minAccuracy)) {
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({
                    valid: false,
                    authentic: false,
                    error: `Ineligible metrics: Score does not satisfy requirements for ${level}.`
                })
            };
        }

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'public, max-age=300'
            },
            body: JSON.stringify({
                valid: true,
                authentic: true,
                data: {
                    candidate: candidate,
                    wpm: wpm,
                    accuracy: accuracy,
                    level: level,
                    date: date,
                    certId: certId,
                    type: 'Performance-Based Typing Skill Milestone',
                    disclaimer: 'This certificate documents results achieved on an online practice test on ProTypingTest.in. It is not an accredited qualification from a statutory testing authority.'
                }
            })
        };
    } catch (err) {
        return {
            statusCode: 400,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
                valid: false,
                authentic: false,
                error: 'Failed to parse certificate token.'
            })
        };
    }
};

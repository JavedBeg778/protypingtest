const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const url = require('url');

// Valid test secret for testing environment
process.env.CERT_SIGNING_SECRET = 'PTT_TEST_SECURE_KEY_32_BYTES_ENTROPY_2026_RANDOM_xyz789';

// Import Netlify serverless handlers for complete end-to-end integration
const createSessionHandler = require('../netlify/functions/create-session').handler;
const signCertHandler = require('../netlify/functions/sign-cert').handler;
const verifyCertHandler = require('../netlify/functions/verify-cert').handler;
const { getSession, resetForTesting } = require('../netlify/functions/utils/session-store');

const PORT = 9555;
const CDP_PORT = 9556;
const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
    ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
    : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

// Helper for MIME types
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

// 1. Local HTTP Server with Netlify Function Mocking and Extensionless URL Resolution
function startTestServer() {
    return new Promise((resolve) => {
        const rootDir = path.resolve(__dirname, '..');
        const server = http.createServer(async (req, res) => {
            const parsed = new URL(req.url, `http://localhost:${PORT}`);
            let pathname = parsed.pathname;

            // Mock Netlify API endpoints
            if (pathname === '/api/cert-session' || pathname === '/.netlify/functions/create-session') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    const event = { httpMethod: req.method, body, headers: req.headers };
                    const result = await createSessionHandler(event, {});
                    res.writeHead(result.statusCode, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(result.body);
                });
                return;
            }

            if (pathname === '/api/sign-cert' || pathname === '/.netlify/functions/sign-cert') {
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', async () => {
                    const event = { httpMethod: req.method, body, headers: req.headers };
                    const result = await signCertHandler(event, {});
                    res.writeHead(result.statusCode, {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(result.body);
                });
                return;
            }

            if (pathname === '/api/verify-cert' || pathname === '/.netlify/functions/verify-cert') {
                const event = {
                    httpMethod: req.method,
                    queryStringParameters: Object.fromEntries(parsed.searchParams.entries()),
                    headers: req.headers
                };
                const result = await verifyCertHandler(event, {});
                res.writeHead(result.statusCode, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(result.body);
                return;
            }

            // Static file resolution
            if (pathname === '/') pathname = '/index.html';
            let filePath = path.join(rootDir, pathname);

            // If path has no extension and file does not exist, try .html
            if (!path.extname(filePath) && !fs.existsSync(filePath)) {
                if (fs.existsSync(filePath + '.html')) {
                    filePath = filePath + '.html';
                } else if (fs.existsSync(path.join(filePath, 'index.html'))) {
                    filePath = path.join(filePath, 'index.html');
                }
            }

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                const contentType = MIME_TYPES[ext] || 'application/octet-stream';
                res.writeHead(200, { 'Content-Type': contentType });
                fs.createReadStream(filePath).pipe(res);
            } else {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>');
            }
        });

        server.listen(PORT, () => {
            resolve(server);
        });
    });
}

// 2. Headless Chrome Controller via CDP
class BrowserController {
    constructor() {
        this.chromeProcess = null;
        this.tmpDir = null;
        this.ws = null;
        this.msgId = 1;
        this.pendingRequests = new Map();
        this.consoleErrors = [];
    }

    async launch() {
        this.tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ptt-browser-reg-'));
        this.chromeProcess = spawn(CHROME_PATH, [
            '--headless=new',
            `--remote-debugging-port=${CDP_PORT}`,
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-gpu',
            '--disable-popup-blocking',
            `--user-data-dir=${this.tmpDir}`,
            'about:blank'
        ]);

        // Wait for CDP endpoint readiness
        let connected = false;
        for (let i = 0; i < 25; i++) {
            await new Promise(r => setTimeout(r, 200));
            try {
                const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/version`);
                if (res.ok) {
                    connected = true;
                    break;
                }
            } catch (e) {
                // waiting...
            }
        }

        if (!connected) {
            throw new Error('Failed to connect to headless Chrome CDP port ' + CDP_PORT);
        }

        // Connect to active page target
        const targetsRes = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
        const targets = await targetsRes.json();
        const page = targets.find(t => t.type === 'page') || targets[0];

        this.ws = new WebSocket(page.webSocketDebuggerUrl);

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.id && this.pendingRequests.has(data.id)) {
                const cb = this.pendingRequests.get(data.id);
                this.pendingRequests.delete(data.id);
                cb(data);
            }
            if (data.method === 'Runtime.consoleAPICalled' && data.params?.type === 'error') {
                const text = data.params.args?.map(a => a.value || a.description).join(' ');
                this.consoleErrors.push(text);
            }
            if (data.method === 'Runtime.exceptionThrown') {
                const text = data.params.exceptionDetails?.text || 'Uncaught exception';
                this.consoleErrors.push(text);
            }
        };

        await new Promise(r => this.ws.onopen = r);

        await this.send('Page.enable');
        await this.send('Runtime.enable');
        await this.send('DOM.enable');
    }

    send(method, params = {}) {
        return new Promise((resolve) => {
            const id = this.msgId++;
            this.pendingRequests.set(id, resolve);
            this.ws.send(JSON.stringify({ id, method, params }));
        });
    }

    async setViewport(isMobile = false) {
        if (isMobile) {
            await this.send('Emulation.setDeviceMetricsOverride', {
                width: 375,
                height: 812,
                deviceScaleFactor: 3,
                mobile: true,
                screenOrientation: { angle: 0, type: 'portraitPrimary' }
            });
            await this.send('Emulation.setUserAgentOverride', {
                userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
            });
        } else {
            await this.send('Emulation.setDeviceMetricsOverride', {
                width: 1280,
                height: 800,
                deviceScaleFactor: 1,
                mobile: false
            });
            await this.send('Emulation.setUserAgentOverride', {
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
            });
        }
    }

    async navigate(pathname) {
        this.consoleErrors = [];
        const targetUrl = `http://localhost:${PORT}${pathname}`;
        await this.send('Page.navigate', { url: targetUrl });
        // Allow page load and initial JS execution
        await new Promise(r => setTimeout(r, 600));
    }

    async evaluate(expression) {
        const res = await this.send('Runtime.evaluate', {
            expression: expression,
            returnByValue: true,
            awaitPromise: true
        });
        if (res.result?.exceptionDetails) {
            throw new Error(`Evaluation error: ${res.result.exceptionDetails.text}`);
        }
        return res.result?.result?.value;
    }

    async close() {
        if (this.ws) {
            try { this.ws.close(); } catch (e) {}
        }
        if (this.chromeProcess) {
            try { this.chromeProcess.kill(); } catch (e) {}
        }
        await new Promise(r => setTimeout(r, 500));
        if (this.tmpDir && fs.existsSync(this.tmpDir)) {
            try { fs.rmSync(this.tmpDir, { recursive: true, force: true }); } catch (e) {}
        }
    }
}

// 3. Test Runner
async function runBrowserRegressions() {
    console.log('===============================================================');
    console.log('🚀 PROTYPINGTEST LIVE BROWSER REGRESSION TEST SUITE');
    console.log('   Testing Real Headless Chrome DOM, Viewports, & Interactivity');
    console.log('===============================================================\n');

    const server = await startTestServer();
    console.log(`✓ Local test server active at http://localhost:${PORT}`);

    const browser = new BrowserController();
    await browser.launch();
    console.log('✓ Headless Chrome attached via CDP (Remote Debugging)\n');

    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    function assert(desc, condition, details = '') {
        totalTests++;
        if (condition) {
            passedTests++;
            console.log(`  ✓ ${desc}`);
        } else {
            failedTests++;
            console.error(`  ❌ FAIL: ${desc} ${details ? '(' + details + ')' : ''}`);
        }
    }

    try {
        // -------------------------------------------------------------
        // SUITE 1: Responsive Navigation & Layout (Desktop + Mobile)
        // -------------------------------------------------------------
        console.log('--- Suite 1: Responsive Navigation & Layout ---');
        
        // Desktop Viewport
        await browser.setViewport(false);
        await browser.navigate('/');
        const desktopTitle = await browser.evaluate('document.title');
        assert('Desktop: Home page loads with valid title', /protypingtest/i.test(desktopTitle), desktopTitle);

        const desktopNavCount = await browser.evaluate('document.querySelectorAll(".test-nav a, nav a").length');
        assert('Desktop: Navigation menu contains valid internal links', desktopNavCount >= 6, `Count: ${desktopNavCount}`);

        const desktopNoOverflow = await browser.evaluate('document.documentElement.scrollWidth <= window.innerWidth');
        assert('Desktop: No horizontal viewport overflow', desktopNoOverflow);

        // Mobile Viewport
        await browser.setViewport(true);
        await browser.navigate('/');
        const mobileMenuBtn = await browser.evaluate('document.querySelector(".mobile-menu-btn") !== null');
        assert('Mobile: Hamburger menu button rendered', mobileMenuBtn);

        // Test opening mobile menu
        await browser.evaluate('if (typeof toggleMobileMenu === "function") toggleMobileMenu();');
        const mobileMenuDisplay = await browser.evaluate('document.getElementById("mobileMenu")?.style?.display');
        assert('Mobile: Hamburger menu toggle functions cleanly', mobileMenuDisplay === 'block' || mobileMenuDisplay === '', mobileMenuDisplay);

        const mobileNoOverflow = await browser.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2');
        assert('Mobile: Responsive viewport prevents horizontal scroll', mobileNoOverflow);

        // -------------------------------------------------------------
        // SUITE 2: All 6 Typing Test Durations (1, 2, 5, 10, 15, 30 min)
        // -------------------------------------------------------------
        console.log('\n--- Suite 2: Typing Tests Across All 6 Durations ---');
        const testDurations = [
            { min: 1, path: '/tests/typing-test-1-minute', expectedTimer: '1:00' },
            { min: 2, path: '/tests/typing-test-2-minute', expectedTimer: '2:00' },
            { min: 5, path: '/tests/typing-test-5-minute', expectedTimer: '5:00' },
            { min: 10, path: '/tests/typing-test-10-minute', expectedTimer: '10:00' },
            { min: 15, path: '/tests/typing-test-15-minute', expectedTimer: '15:00' },
            { min: 30, path: '/tests/typing-test-30-minute', expectedTimer: '30:00' }
        ];

        for (const t of testDurations) {
            await browser.setViewport(false);
            await browser.navigate(t.path);

            const initialTimer = await browser.evaluate('document.getElementById("timer")?.textContent?.trim()');
            assert(`${t.min}-Minute Test: Initial timer displays ${t.expectedTimer}`, initialTimer === t.expectedTimer, `Got: ${initialTimer}`);

            const hasLinesContainer = await browser.evaluate('document.getElementById("linesContainer") !== null');
            assert(`${t.min}-Minute Test: Lines container rendered for typing words`, hasLinesContainer);

            const engineLoaded = await browser.evaluate('typeof TypingEngine !== "undefined" && typeof TypingEngine.calculateNetWPM === "function"');
            assert(`${t.min}-Minute Test: TypingEngine shared utility loaded in browser scope`, engineLoaded);

            // Trigger typing test start via handleKeyDown
            await browser.evaluate('if (typeof handleKeyDown === "function") { handleKeyDown({ key: "a", preventDefault: ()=>{} }); }');
            await new Promise(r => setTimeout(r, 200));

            const timerActive = await browser.evaluate('document.querySelector(".mode-btn.disabled") !== null || (typeof timerInterval !== "undefined" && timerInterval !== null)');
            assert(`${t.min}-Minute Test: Test engine activates upon user keystroke`, timerActive);

            // Verify reset functionality
            await browser.evaluate('if (typeof resetTest === "function") resetTest();');
            const resetTimer = await browser.evaluate('document.getElementById("timer")?.textContent?.trim()');
            assert(`${t.min}-Minute Test: Reset test restores initial timer state`, resetTimer === t.expectedTimer, `Got: ${resetTimer}`);
        }

        // -------------------------------------------------------------
        // SUITE 3: Typing Lessons & Typing Games
        // -------------------------------------------------------------
        console.log('\n--- Suite 3: Typing Lessons & Interactive Tools ---');
        await browser.navigate('/tools/typing-lessons');
        const lessonsCount = await browser.evaluate('document.querySelectorAll(".lesson-card, .level-card, .module-card, .lessons-grid").length');
        assert('Typing Lessons: Practice modules rendered in browser', lessonsCount > 0, `Found: ${lessonsCount}`);

        const keyboardLoaded = await browser.evaluate('document.querySelector(".target-keys, .current-lesson, .lesson-input") !== null');
        assert('Typing Lessons: Interactive lesson prompt & input elements present', keyboardLoaded);

        await browser.navigate('/tools/typing-games');
        const gamesGrid = await browser.evaluate('document.querySelectorAll(".game-card, .game-item, .game-option, .game-preview, .play-btn").length');
        assert('Typing Games: Game selection arena rendered', gamesGrid > 0, `Found: ${gamesGrid}`);

        // -------------------------------------------------------------
        // SUITE 4: Hardened Certificate Security Workflow
        // -------------------------------------------------------------
        console.log('\n--- Suite 4: Serverless Certificate Security Workflow ---');
        await browser.navigate('/certificate/typing-certificate');
        
        const certTitle = await browser.evaluate('document.querySelector("h1")?.textContent?.trim()');
        assert('Certificate Page: Header rendered', certTitle.includes('Certification'), certTitle);

        const disclaimerPresent = await browser.evaluate('document.querySelector(".accreditation-disclaimer") !== null');
        assert('Certificate Page: Transparent non-accreditation notice rendered', disclaimerPresent);

        // 1. Direct signing attempt without server session must be rejected (Anti-Arbitrary Signing)
        const directSignResult = await browser.evaluate(`
            (async () => {
                const resp = await fetch('/api/sign-cert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        candidate: 'Hacker User',
                        wpm: 120,
                        accuracy: 99,
                        level: 'master'
                    })
                });
                return { status: resp.status, data: await resp.json() };
            })()
        `);
        assert('Server Sign API: Direct signing without server session rejected (HTTP 400)', directSignResult?.status === 400);

        // 2. Initialize authentic server session
        const sessResult = await browser.evaluate(`
            (async () => {
                const resp = await fetch('/api/cert-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        candidate: 'Suresh Kumar',
                        level: 'gold'
                    })
                });
                return { status: resp.status, data: await resp.json() };
            })()
        `);
        assert('Server Session API: HTTP 200 with challenge text & session ID', sessResult?.status === 200 && sessResult?.data?.sessionId);
        const validSessionId = sessResult?.data?.sessionId;
        const challengeText = sessResult?.data?.challengeText;

        // Advance session time in store to simulate realistic 75s typing duration (85 words in 75s = 68 WPM)
        const stored = getSession(validSessionId);
        if (stored) {
            stored.createdAt = Date.now() - 78000;
        }

        // 3. Submit typing evidence with valid session
        const signResult = await browser.evaluate(`
            (async () => {
                const resp = await fetch('/api/sign-cert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: '${validSessionId}',
                        candidate: 'Suresh Kumar',
                        typedText: ${JSON.stringify(challengeText)},
                        elapsedMs: 75000
                    })
                });
                return { status: resp.status, data: await resp.json() };
            })()
        `);

        assert('Server Sign API: HTTP 200 with authentic signature for eligible typing evidence', signResult?.status === 200 && signResult?.data?.token);
        const validToken = signResult?.data?.token;

        // 4. Session Replay Attack Defense (attempting to use the same session again)
        const replayResult = await browser.evaluate(`
            (async () => {
                const resp = await fetch('/api/sign-cert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sessionId: '${validSessionId}',
                        candidate: 'Suresh Kumar',
                        typedText: ${JSON.stringify(challengeText)},
                        elapsedMs: 75000
                    })
                });
                return { status: resp.status, data: await resp.json() };
            })()
        `);
        assert('Server Sign API: Session replay rejected with HTTP 409 Conflict', replayResult?.status === 409);

        // 5. Test Verification page with Authentic Token (?cert=...)
        await browser.navigate(`/certificate/verify?cert=${encodeURIComponent(validToken)}`);
        await new Promise(r => setTimeout(r, 600));

        const verifiedBoxDisplay = await browser.evaluate('document.getElementById("verifiedBox")?.style?.display');
        assert('Verify Page: Authentic token verified and verifiedBox displayed', verifiedBoxDisplay === 'block', `Display: ${verifiedBoxDisplay}`);

        const verifiedCandidate = await browser.evaluate('document.getElementById("valCandidate")?.textContent?.trim()');
        assert('Verify Page: Decoded candidate name matches signed payload', verifiedCandidate === 'Suresh Kumar', `Got: ${verifiedCandidate}`);

        // 6. Test Verification page with Tampered/Forged Token
        const tamperedToken = validToken.slice(0, -6) + 'ABCDEF';
        await browser.navigate(`/certificate/verify?cert=${encodeURIComponent(tamperedToken)}`);
        await new Promise(r => setTimeout(r, 600));

        const invalidBoxDisplay = await browser.evaluate('document.getElementById("invalidBox")?.style?.display');
        assert('Verify Page: Tampered signature rejected and invalidBox displayed', invalidBoxDisplay === 'block', `Display: ${invalidBoxDisplay}`);

        // -------------------------------------------------------------
        // SUITE 5: Results Page Metric Extraction & Analysis
        // -------------------------------------------------------------
        console.log('\n--- Suite 5: Results Page Metrics & Guidance ---');
        await browser.navigate('/pages/results?wpm=74&acc=96&time=60&gross=77&errors=2');
        await new Promise(r => setTimeout(r, 500));

        const resultsLoaded = await browser.evaluate('document.querySelector(".results-container, .results-main, #resultsCard, h1") !== null');
        assert('Results Page: Metrics and summary layout rendered in browser', resultsLoaded);

        // -------------------------------------------------------------
        // SUITE 6: Blog Articles Quality & Responsive Layout
        // -------------------------------------------------------------
        console.log('\n--- Suite 6: Blog Pages Quality & Responsive Layout ---');
        const blogPages = [
            '/blog/ssc-typing-guide',
            '/blog/finger-placement',
            '/blog/how-to-increase-typing-speed',
            '/blog/typing-games-vs-practice'
        ];

        for (const bp of blogPages) {
            await browser.setViewport(false);
            await browser.navigate(bp);

            const h1Count = await browser.evaluate('document.querySelectorAll("h1").length');
            assert(`Blog (${bp}): Exactly one H1 heading found`, h1Count === 1, `H1 count: ${h1Count}`);

            const hasPlaceholdCo = await browser.evaluate('document.body.innerHTML.includes("placehold.co")');
            assert(`Blog (${bp}): Zero placehold.co dummy images present`, !hasPlaceholdCo);

            const hasFakeTestimonials = await browser.evaluate('document.body.innerHTML.includes("What Our Community Says") || document.body.innerHTML.includes("Michael T. from New York")');
            assert(`Blog (${bp}): Zero fake testimonials present`, !hasFakeTestimonials);

            // Test Mobile Viewport
            await browser.setViewport(true);
            await browser.navigate(bp);
            const blogNoOverflow = await browser.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 2');
            assert(`Blog (${bp}): Mobile layout has zero horizontal overflow`, blogNoOverflow);
        }

        // -------------------------------------------------------------
        // SUITE 7: Contact Form Validation & Usability
        // -------------------------------------------------------------
        console.log('\n--- Suite 7: Contact Form Usability ---');
        await browser.setViewport(false);
        await browser.navigate('/pages/contact');

        const contactFormExists = await browser.evaluate('document.querySelector("form, #contactForm, .contact-form") !== null');
        assert('Contact Page: Form elements rendered cleanly', contactFormExists);

        const emailFieldExists = await browser.evaluate('document.querySelector("input[type=email], #email, input[name=email]") !== null');
        assert('Contact Page: Email input field present', emailFieldExists);

    } finally {
        await browser.close();
        await new Promise(r => server.close(r));
        console.log('\n✓ Headless Chrome & test server terminated gracefully.');
    }

    console.log('\n===============================================================');
    console.log(`🏁 BROWSER REGRESSION TEST SUMMARY:`);
    console.log(`   Total Tests:  ${totalTests}`);
    console.log(`   Passed Tests: ${passedTests}`);
    console.log(`   Failed Tests: ${failedTests}`);
    console.log('===============================================================');

    if (failedTests > 0) {
        process.exit(1);
    }
}

runBrowserRegressions().catch(err => {
    console.error('Fatal Browser Test Error:', err);
    process.exit(1);
});

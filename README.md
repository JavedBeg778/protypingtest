# ProTypingTest — Professional Typing Platform

A fast, lightweight, and modern typing practice and assessment platform built with vanilla HTML5, CSS3, ES6+ JavaScript, and Netlify Serverless Functions.

Production Site: [https://protypingtest.in](https://protypingtest.in)  
GitHub Backup: [https://github.com/JavedBeg778/protypingtest.git](https://github.com/JavedBeg778/protypingtest.git)

---

## 🌟 Key Features

1. **Multi-Duration Typing Tests:**
   - 1-Minute, 2-Minute, 5-Minute, 10-Minute, 15-Minute (SSC DEST simulation), and 30-Minute endurance tests.
   - Powered by a shared, standardized typing engine (`js/typing-engine.js`) ensuring 100% mathematical parity across durations.
2. **Interactive Practice Tools:**
   - **Typing Lessons:** Structured beginner to advanced touch typing curriculum.
   - **Typing Games:** Gamified practice arena for finger agility.
   - **Typing Benchmark:** Algorithmic speed and accuracy assessment with skill tier percentiles.
   - **Tricky Keys:** Targeted drills for problematic symbols, brackets, and capital letters.
   - **Bigram Blitz:** High-frequency English bigram fluency training.
   - **Story Typing:** Flow state typing using classic public-domain literature.
3. **Hardened Typing Skill Certification:**
   - Cryptographically verifiable skill certificates (Bronze, Silver, Gold, Platinum, Diamond, Master).
   - Server-side session management (`/api/cert-session`) bound to challenge passages and authoritative timestamps.
   - Server-side typing evidence evaluation (`/api/sign-cert`) that independently scores raw text input and rejects arbitrary client scores.
   - Anti-replay defense (one-time issuance enforcement returning HTTP 409 Conflict).
   - HMAC-SHA256 signature generation with constant-time verification (`crypto.timingSafeEqual`).
   - Honest, transparent non-accreditation disclosures for self-assessment.
4. **Educational Content Archive:**
   - 25 original, in-depth guides covering official government typing rules (SSC CGL DEST, IBPS, EPFO SSA), biomechanics, neuromuscular chunking, and ergonomics.
5. **Clean Technical SEO & Standards:**
   - Extensionless canonical and OpenGraph/Twitter URLs.
   - Strict single-H1 heading hierarchy.
   - Zero deceptive statistics, manufactured reviews, or fake schema markups.
   - Valid `ads.txt` and segmented XML sitemaps.
   - Full compliance with Google AdSense Publisher Policies (detailed in [`ADSENSE_READINESS_REPORT.md`](ADSENSE_READINESS_REPORT.md)).

---

## 🏗️ Repository Architecture

```text
ProTypingTest/
├── index.html                  # Homepage & primary practice hub
├── 404.html                    # Helpful error recovery page
├── _headers                    # Security headers (CSP, HSTS, frame-ancestors)
├── _redirects                  # Netlify clean URL rewrites & API redirects
├── netlify.toml                # Netlify configuration & function bindings
├── ads.txt                     # Authorized Google AdSense publisher declaration
├── robots.txt                  # Search crawler directives
├── sitemap.xml                 # XML sitemap index
├── sitemap-*.xml               # Segmented child sitemaps (main, tests, blog, tools, pages)
├── assets/                     # Static images, icons, and author assets
├── auth/                       # Client login and registration pages
├── blog/                       # 25 authoritative typing guides & tutorials
├── certificate/                # Skill certificate generator & verification UI
├── css/                        # Modular stylesheet system (components, tests, tools)
├── js/                         # Typing engine, text manager, and tool scripts
├── netlify/functions/          # Serverless endpoints (cert-session, sign-cert, verify-cert)
├── pages/                      # About, Contact, Privacy Policy, Terms, FAQ, Disclaimer
├── results/                    # Post-test dynamic score analysis
├── scripts/                    # Validation scripts (validate_sitemap.js)
├── test/                       # Test suites (unit, integration, certificate, site audit)
├── tests/                      # HTML test runners for all 6 durations
├── tools/                      # Interactive training tools (Lessons, Games, Benchmark)
├── ADSENSE_READINESS_REPORT.md # Comprehensive compliance and technical audit report
├── README.md                   # Project documentation & recovery manual
└── .gitignore                  # Git exclusions for secrets, caches, and dependencies
```

---

## 🚀 Running the Project Locally

Because the frontend is static HTML, CSS, and Vanilla JavaScript, you can run it using any static web server:

### Option A: Using `serve` (Node.js)
```bash
npx serve .
```

### Option B: Using Python
```bash
# Python 3
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.

### Option C: Using Netlify CLI (Includes Functions)
To test Netlify serverless functions locally:
```bash
npm install -g netlify-cli
export CERT_SIGNING_SECRET="your-32-byte-secret-key-here"
netlify dev
```

---

## ⚙️ Environment Variables & Deployment

### Required Environment Variable

| Variable Name | Required | Description | Minimum Length |
| :--- | :---: | :--- | :---: |
| `CERT_SIGNING_SECRET` | **Yes (in production)** | Cryptographic HMAC-SHA256 signing secret for certificates | 32 bytes (256 bits) |

> [!IMPORTANT]
> The serverless functions fail closed with **HTTP 500** if `CERT_SIGNING_SECRET` is missing, shorter than 32 bytes, or matches known prohibited default patterns. This prevents unverified or counterfeit certificates from being generated.

To generate a secure 256-bit random key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Deploying to Netlify

1. Fork or push this repository to GitHub.
2. In the [Netlify Dashboard](https://app.netlify.com/), click **Add new site** $\to$ **Import an existing project**.
3. Select this GitHub repository (`protypingtest`).
4. Configure build settings:
   - **Build command:** *(leave empty or `npm test`)*
   - **Publish directory:** `.`
   - **Functions directory:** `netlify/functions`
5. Under **Site configuration** $\to$ **Environment variables**, add:
   - Key: `CERT_SIGNING_SECRET`
   - Value: *(your generated 64-character hex secret)*
6. Click **Deploy Site**.

---

## 🧪 Running Automated Tests

The repository includes comprehensive automated test suites that do not require external test runners:

```bash
# 1. Typing Engine Unit Tests
node test/typing-engine.test.js

# 2. Engine Cross-Duration Mathematical Parity
node test/engine-integration.test.js

# 3. Serverless Certificate Security & Replay Defense (18 tests)
node test/certificate.test.js

# 4. Site-Wide Quality & AdSense Compliance Audit (56 HTML files)
node test/site-audit.test.js

# 5. Sitemap URL & Extensionless Route Health Check
node scripts/validate_sitemap.js

# 6. Full Live Browser Regression Suite (Requires Chrome)
node test/browser-regression.test.js
```

---

## 🔄 Disaster Recovery & Local File Restoration

If local files are lost, corrupted, or need to be set up on a new development machine:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/JavedBeg778/protypingtest.git
   cd protypingtest
   ```
2. **Verify Repository Integrity:**
   ```bash
   node test/typing-engine.test.js
   node test/engine-integration.test.js
   node test/certificate.test.js
   node test/site-audit.test.js
   node scripts/validate_sitemap.js
   ```
3. **Configure Local Environment (for Functions testing):**
   ```bash
   # Set environment variable in your shell
   # Linux / macOS:
   export CERT_SIGNING_SECRET="your-32-byte-secret-key-here"
   # Windows (PowerShell):
   $env:CERT_SIGNING_SECRET="your-32-byte-secret-key-here"
   ```
4. **Launch Local Server:**
   ```bash
   npx serve .
   ```

---

## 📜 License & Disclaimers

- **License:** Proprietary. Copyright © 2026 ProTypingTest.in. All rights reserved.
- **Skill Certification Disclaimer:** Certificates issued by ProTypingTest verify results from online practice assessments on ProTypingTest.in. They are designed for self-assessment and practical skills demonstration, and do not constitute government-accredited qualifications or statutory civil service credentials.

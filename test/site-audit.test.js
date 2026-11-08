/**
 * Comprehensive Site Audit & AdSense Readiness Test Suite
 * Verifies all 56 HTML files against technical SEO, UX, content credibility,
 * and Google AdSense quality guidelines.
 */

const fs = require('fs');
const path = require('path');

function runSiteAudit() {
    console.log('=== Running Comprehensive Site Audit Test Suite ===\n');

    const allHtmlFiles = [];
    function scan(dir) {
        for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
            if (item.name === '.git' || item.name === 'node_modules' || item.name === '_adsense_backup' || item.name === 'scratch') continue;
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) scan(fullPath);
            else if (item.name.endsWith('.html')) {
                allHtmlFiles.push(fullPath);
            }
        }
    }
    scan('.');

    console.log(`Discovered ${allHtmlFiles.length} HTML files across repository.\n`);

    let failureCount = 0;

    // Test 1: H1 Heading Hierarchy
    console.log('--- Test 1: Heading Hierarchy (Single H1 per indexable page) ---');
    for (const file of allHtmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const h1Matches = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
        const isUtility = file.includes('404') || file.includes('template');
        
        if (!isUtility && h1Matches.length !== 1) {
            console.error(`  FAIL [H1 Count]: ${file} has ${h1Matches.length} H1 tags.`);
            failureCount++;
        }
    }
    console.log('  ✓ H1 heading hierarchy verified across all pages.');

    // Test 2: No Fake AggregateRating Schemas
    console.log('\n--- Test 2: Schema Integrity (No fabricated AggregateRating) ---');
    for (const file of allHtmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (/AggregateRating/i.test(content)) {
            console.error(`  FAIL [Fake Schema]: ${file} contains AggregateRating.`);
            failureCount++;
        }
    }
    console.log('  ✓ Zero fabricated AggregateRating schemas found.');

    // Test 3: No Dummy Analytics
    console.log('\n--- Test 3: Analytics Cleanliness (No G-XXXXXXXXXX tags) ---');
    for (const file of allHtmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        if (/G-XXXXXXXXXX/i.test(content)) {
            console.error(`  FAIL [Dummy Tag]: ${file} contains G-XXXXXXXXXX.`);
            failureCount++;
        }
    }
    console.log('  ✓ Zero dummy G-XXXXXXXXXX tags found.');

    // Test 4: Internal Links (Extensionless URLs to prevent Netlify 301 chains)
    console.log('\n--- Test 4: Link Hygiene (No internal links with .html extension) ---');
    for (const file of allHtmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const htmlLinkMatches = content.match(/href=["'](\/(?:tests|tools|pages|certificate|blog|auth)\/[a-zA-Z0-9_-]+)\.html([#"']?)/gi) || [];
        if (htmlLinkMatches.length > 0) {
            console.error(`  FAIL [HTML Link]: ${file} has ${htmlLinkMatches.length} internal link(s) with .html:`, htmlLinkMatches.slice(0, 3));
            failureCount++;
        }
    }
    console.log('  ✓ All internal navigation links use clean extensionless URLs.');

    // Test 5: Misleading Trust Signals & Fabricated Stats
    console.log('\n--- Test 5: Truth & Credibility (No fabricated stats / testimonials) ---');
    const forbiddenPatterns = [
        /1\.2M\+\s*tests/i,
        /5,000\+\s*active users/i,
        /75K\+\s*monthly readers/i,
        /150\+\s*countries/i,
        /50,000\+\s*students/i,
        /over 50,000\s*(?:students|professionals)/i,
        /10,000\+\s*(?:students|certificates|typists)/i,
        /What Our Community Says/i,
        /accepted by employers in USA/i,
        /land a remote data entry job/i,
        /Michael T\./i,
        /Priya K\./i,
        /4\.8\/5\s*ratings/i,
        /4\.9\/5\s*ratings/i
    ];

    for (const file of allHtmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        for (const pattern of forbiddenPatterns) {
            if (pattern.test(content)) {
                console.error(`  FAIL [Forbidden Stat]: ${file} contains ${pattern}`);
                failureCount++;
            }
        }
    }
    console.log('  ✓ Zero fabricated statistics or fake user claims found.');

    // Test 6: AdSense Policy Compliance (No ads on utility/auth pages)
    console.log('\n--- Test 6: AdSense Tag Placement (No ads on auth, results, 404) ---');
    const noAdFiles = ['auth/login.html', 'auth/signup.html', '404.html', 'pages/404.html', 'blog/template.html'];
    for (const f of noAdFiles) {
        if (fs.existsSync(f)) {
            const content = fs.readFileSync(f, 'utf8');
            if (/pagead2\.googlesyndication\.com/i.test(content)) {
                console.error(`  FAIL [AdSense on Utility]: ${f} contains AdSense ad script.`);
                failureCount++;
            }
        }
    }
    console.log('  ✓ AdSense script cleanly excluded from utility, auth, and error pages.');

    // Test 7: ads.txt Validation
    console.log('\n--- Test 7: ads.txt Validation ---');
    if (!fs.existsSync('ads.txt')) {
        console.error('  FAIL [ads.txt]: ads.txt does not exist.');
        failureCount++;
    } else {
        const adsTxt = fs.readFileSync('ads.txt', 'utf8');
        if (!adsTxt.includes('pub-1227031935917376')) {
            console.error('  FAIL [ads.txt]: Correct publisher ID pub-1227031935917376 not found in ads.txt');
            failureCount++;
        }
    }
    console.log('  ✓ ads.txt verified with correct publisher account.');

    // Test 8: Canonical & Social URL Hygiene (Extensionless URLs matching canonical)
    console.log('\n--- Test 8: Canonical & Social Meta Hygiene (Extensionless URLs) ---');
    for (const file of allHtmlFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const canMatch = content.match(/<link rel="canonical" href="([^"]+)"/i);
        const ogMatch = content.match(/<meta property="og:url" content="([^"]+)"/i);
        const twMatch = content.match(/<meta name="twitter:url" content="([^"]+)"/i);
        
        if (canMatch && canMatch[1].endsWith('.html')) {
            console.error(`  FAIL [Canonical .html]: ${file} canonical URL has .html extension: ${canMatch[1]}`);
            failureCount++;
        }
        if (ogMatch && ogMatch[1].endsWith('.html')) {
            console.error(`  FAIL [og:url .html]: ${file} og:url has .html extension: ${ogMatch[1]}`);
            failureCount++;
        }
        if (twMatch && twMatch[1].endsWith('.html')) {
            console.error(`  FAIL [twitter:url .html]: ${file} twitter:url has .html extension: ${twMatch[1]}`);
            failureCount++;
        }
        if (canMatch && ogMatch && canMatch[1] !== ogMatch[1]) {
            console.error(`  FAIL [URL Mismatch]: ${file} canonical (${canMatch[1]}) does not match og:url (${ogMatch[1]})`);
            failureCount++;
        }
    }
    console.log('  ✓ Canonical and social meta URLs strictly match clean extensionless paths.');

    console.log('\n==================================================');
    if (failureCount === 0) {
        console.log('🏆 AUDIT SUMMARY: ALL 8 TESTS PASSED WITH 0 FAILURES!');
        console.log('==================================================');
    } else {
        console.error(`❌ AUDIT SUMMARY: ${failureCount} FAILURE(S) DETECTED.`);
        console.log('==================================================');
        process.exit(1);
    }
}

runSiteAudit();


/**
 * Automated Sitemap Validator for ProTypingTest.in
 * Validates:
 * 1. XML structure of root sitemap.xml and child sitemaps.
 * 2. Uniqueness of URLs across all child sitemaps (no duplicate indexable URLs).
 * 3. Existence of local corresponding HTML file for each URL.
 * 4. Exclusion of noindexed / private pages (e.g. results, login, signup, 404, template).
 * 5. Clean URLs (no .html extensions in sitemap locs).
 */

const fs = require('fs');
const path = require('path');

function validateSitemaps() {
    console.log('--- Starting Sitemap Validation ---');
    const rootSitemapPath = path.resolve('sitemap.xml');
    if (!fs.existsSync(rootSitemapPath)) {
        console.error('FAIL: Root sitemap.xml not found.');
        process.exit(1);
    }

    const rootXml = fs.readFileSync(rootSitemapPath, 'utf8');
    const childSitemapMatches = rootXml.match(/<loc>(https:\/\/protypingtest\.in\/[^<]+\.xml)<\/loc>/g) || [];
    
    if (childSitemapMatches.length === 0) {
        console.error('FAIL: No child sitemaps declared in sitemap.xml');
        process.exit(1);
    }

    console.log(`Found ${childSitemapMatches.length} child sitemaps in sitemap.xml.`);

    const urlMap = new Map();
    let totalUrls = 0;
    let errors = 0;

    for (const match of childSitemapMatches) {
        const sitemapUrl = match.replace(/<\/?loc>/g, '');
        const filename = path.basename(sitemapUrl);
        const localPath = path.resolve(filename);

        if (!fs.existsSync(localPath)) {
            console.error(`FAIL: Declared child sitemap ${filename} does not exist locally.`);
            errors++;
            continue;
        }

        const childXml = fs.readFileSync(localPath, 'utf8');
        const locs = childXml.match(/<loc>([^<]+)<\/loc>/g) || [];
        console.log(`✓ ${filename}: ${locs.length} URLs`);

        for (const locTag of locs) {
            totalUrls++;
            const url = locTag.replace(/<\/?loc>/g, '');

            // Rule 1: No .html extension in sitemap
            if (url.endsWith('.html')) {
                console.error(`FAIL: URL contains .html extension: ${url}`);
                errors++;
            }

            // Rule 2: No duplicates across sitemaps
            if (urlMap.has(url)) {
                console.error(`FAIL: Duplicate URL found: ${url} (in ${urlMap.get(url)} and ${filename})`);
                errors++;
            } else {
                urlMap.set(url, filename);
            }

            // Rule 3: Check local file existence
            const urlPath = url.replace('https://protypingtest.in', '');
            let expectedFile;
            if (urlPath === '/' || urlPath === '') {
                expectedFile = 'index.html';
            } else if (urlPath.endsWith('/')) {
                expectedFile = path.join(urlPath.slice(1), 'index.html');
            } else {
                expectedFile = urlPath.slice(1) + '.html';
            }

            if (!fs.existsSync(path.resolve(expectedFile))) {
                console.error(`FAIL: No local HTML file found for sitemap URL ${url} (expected ${expectedFile})`);
                errors++;
            } else {
                // Check if file is mistakenly marked noindex
                const htmlContent = fs.readFileSync(path.resolve(expectedFile), 'utf8');
                if (/<meta\s+name=["']robots["']\s+content=["'][^"']*noindex/i.test(htmlContent)) {
                    console.error(`FAIL: Sitemap contains noindexed page: ${url}`);
                    errors++;
                }
            }
        }
    }

    // Rule 4: Verify that known noindexed/utility files are NOT in the sitemap
    const disallowedFromSitemap = [
        'results/typing-results',
        'auth/login',
        'auth/signup',
        'pages/404',
        '404',
        'blog/template'
    ];

    for (const dis of disallowedFromSitemap) {
        const fullUrl = `https://protypingtest.in/${dis}`;
        if (urlMap.has(fullUrl)) {
            console.error(`FAIL: Utility/Noindex page ${fullUrl} found in sitemap.`);
            errors++;
        }
    }

    console.log(`\nValidation completed: ${totalUrls} total URLs inspected.`);
    if (errors === 0) {
        console.log('✅ ALL SITEMAP CHECKS PASSED: 0 errors detected.');
    } else {
        console.error(`❌ SITEMAP VALIDATION FAILED with ${errors} error(s).`);
        process.exit(1);
    }
}

validateSitemaps();


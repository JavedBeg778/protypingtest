// main.js - Core functionality for Pro Typing Test
// Updated for AdSense approval

// Global state
const AppState = {
    currentPage: window.location.pathname.split('/').pop() || 'index.html',
    theme: localStorage.getItem('theme') || 'light'
};

// ==================== THEME MANAGEMENT ====================

// Toggle theme function
function toggleTheme() {
    const body = document.body;
    const themeText = document.getElementById('themeText');
    
    if (body.hasAttribute('data-theme')) {
        body.removeAttribute('data-theme');
        if (themeText) themeText.textContent = 'Dark Mode';
        localStorage.setItem('theme', 'light');
        AppState.theme = 'light';
        updateThemeIcon();
    } else {
        body.setAttribute('data-theme', 'dark');
        if (themeText) themeText.textContent = 'Light Mode';
        localStorage.setItem('theme', 'dark');
        AppState.theme = 'dark';
        updateThemeIcon();
    }
}

// Update theme icon
function updateThemeIcon() {
    const themeBtn = document.querySelector('.theme-btn');
    if (!themeBtn) return;
    
    const isDark = document.body.hasAttribute('data-theme');
    const lightIcon = themeBtn.querySelector('.light-icon');
    const darkIcon = themeBtn.querySelector('.dark-icon');
    
    if (lightIcon && darkIcon) {
        if (isDark) {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'inline';
        } else {
            lightIcon.style.display = 'inline';
            darkIcon.style.display = 'none';
        }
    }
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeText = document.getElementById('themeText');
    
    if (savedTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if (themeText) themeText.textContent = 'Light Mode';
        AppState.theme = 'dark';
    } else {
        document.body.removeAttribute('data-theme');
        if (themeText) themeText.textContent = 'Dark Mode';
        AppState.theme = 'light';
    }
    updateThemeIcon();
}

// ==================== HOME BUTTON ACTIVE STATE ====================

// Set active state for Home button based on current page
function setHomeButtonState() {
    const homeButton = document.getElementById('homeButton');
    if (!homeButton) return;
    
    const currentPath = window.location.pathname;
    const isHomePage = currentPath.endsWith('index.html') || 
                       currentPath === '/' || 
                       currentPath === '' ||
                       currentPath.endsWith('/');
    
    if (isHomePage) {
        homeButton.classList.add('active');
    } else {
        homeButton.classList.remove('active');
    }
}

// Set active state for navigation items
function setActiveNavItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    document.querySelectorAll('.sidebar-nav li a').forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const pageFromHref = href.startsWith('/') ? href.substring(1) : href;
            
            if (pageFromHref === currentPage || 
                (currentPage === '' && pageFromHref === 'index.html') ||
                (currentPage === 'index.html' && pageFromHref === '')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });
}

// ==================== MOBILE MENU ====================

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    if (menu) {
        const isVisible = menu.style.display === 'block';
        menu.style.display = isVisible ? 'none' : 'block';
    }
}

// Close mobile menu on window resize
function handleResize() {
    const menu = document.getElementById('mobileMenu');
    if (window.innerWidth > 992 && menu) {
        menu.style.display = 'none';
    }
}

// ==================== UTILITY FUNCTIONS ====================

// Format number with commas
function formatNumber(num) {
    if (!num && num !== 0) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format time in MM:SS
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format date
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Share functionality
function shareResult(platform, wpm, accuracy) {
    const wpmValue = wpm || document.getElementById('resultWPM')?.textContent || '0';
    const accuracyValue = accuracy || document.getElementById('resultAccuracy')?.textContent || '0%';
    
    const text = `I typed ${wpmValue} WPM with ${accuracyValue} accuracy on Pro Typing Test! 🚀`;
    const url = window.location.href;
    
    if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=typing,protypingtest`, '_blank', 'width=600,height=400');
    } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
    } else if (platform === 'copy') {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Result copied to clipboard!');
        }).catch(() => {
            alert('Result copied to clipboard!');
        });
    }
}

// Show toast notification
function showToast(message, duration = 3000) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent-primary);
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, duration);
}

// ==================== TEST RESULTS MANAGEMENT ====================

// Save test results to sessionStorage
function saveTestResults(results) {
    if (!results) return;
    sessionStorage.setItem('typingTestResults', JSON.stringify(results));
}

// Load test results from sessionStorage
function loadTestResults() {
    const results = sessionStorage.getItem('typingTestResults');
    return results ? JSON.parse(results) : null;
}

// Clear test results
function clearTestResults() {
    sessionStorage.removeItem('typingTestResults');
}

// Save user preferences
function saveUserPreference(key, value) {
    const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    prefs[key] = value;
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
}

// Load user preferences
function loadUserPreference(key, defaultValue) {
    const prefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    return prefs[key] !== undefined ? prefs[key] : defaultValue;
}

// ==================== ANALYTICS ====================

// Track page view (simple)
function trackPageView(pageName) {
    console.log(`Page viewed: ${pageName}`);
    // You can add Google Analytics here after AdSense approval
}

// Track test completion
function trackTestCompletion(duration, wpm, accuracy) {
    console.log(`Test completed: ${duration}s, WPM: ${wpm}, Accuracy: ${accuracy}`);
    // Store in localStorage for user stats
    const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
    testHistory.push({
        date: new Date().toISOString(),
        duration: duration,
        wpm: wpm,
        accuracy: accuracy
    });
    // Keep only last 50 tests
    while (testHistory.length > 50) testHistory.shift();
    localStorage.setItem('testHistory', JSON.stringify(testHistory));
}

// Get user stats
function getUserStats() {
    const testHistory = JSON.parse(localStorage.getItem('testHistory') || '[]');
    if (testHistory.length === 0) return null;
    
    const wpmValues = testHistory.map(t => t.wpm);
    const bestWPM = Math.max(...wpmValues);
    const avgWPM = Math.round(wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length);
    const totalTests = testHistory.length;
    
    return { bestWPM, avgWPM, totalTests };
}

// ==================== SCROLL TO TOP ====================

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ==================== EVENT LISTENERS ====================

// Setup global event listeners
function setupEventListeners() {
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl + N for new test
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            if (document.querySelector('.test-page') && typeof resetTest === 'function') {
                resetTest();
            }
        }
        
        // Ctrl + T for theme toggle
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Escape key
        if (e.key === 'Escape') {
            const userInput = document.getElementById('userInput');
            if (userInput && userInput.value.length > 0) {
                if (confirm('Exit test? Your progress will be lost.')) {
                    window.location.href = '/index.html';
                }
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Prevent accidental navigation during test
    window.addEventListener('beforeunload', (e) => {
        const userInput = document.getElementById('userInput');
        if (userInput && userInput.value.length > 0 && 
            !window.location.pathname.includes('results')) {
            e.preventDefault();
            e.returnValue = 'You have an ongoing test. Are you sure you want to leave?';
        }
    });
    
    // Add scroll to top button
    window.addEventListener('scroll', () => {
        const scrollBtn = document.querySelector('.scroll-top-btn');
        if (window.scrollY > 500) {
            if (!scrollBtn) {
                const btn = document.createElement('button');
                btn.className = 'scroll-top-btn';
                btn.innerHTML = '↑';
                btn.onclick = scrollToTop;
                btn.style.cssText = `
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    background: var(--accent-primary);
                    color: white;
                    border: none;
                    cursor: pointer;
                    font-size: 20px;
                    z-index: 999;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                `;
                document.body.appendChild(btn);
            }
        } else if (scrollBtn) {
            scrollBtn.remove();
        }
    });
}

// ==================== INITIALIZATION ====================

// Initialize everything on page load
function init() {
    // Load saved theme
    loadTheme();
    
    // Set active states for navigation
    setHomeButtonState();
    setActiveNavItem();
    
    // Setup event listeners
    setupEventListeners();
    
    
    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    console.log('Pro Typing Test initialized');
    console.log('Current page:', AppState.currentPage);
}

// Run init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ==================== EXPORT FUNCTIONS TO GLOBAL SCOPE ====================
window.toggleTheme = toggleTheme;
window.loadTheme = loadTheme;
window.toggleMobileMenu = toggleMobileMenu;
window.formatNumber = formatNumber;
window.formatTime = formatTime;
window.formatDate = formatDate;
window.shareResult = shareResult;
window.showToast = showToast;
window.saveTestResults = saveTestResults;
window.loadTestResults = loadTestResults;
window.clearTestResults = clearTestResults;
window.saveUserPreference = saveUserPreference;
window.loadUserPreference = loadUserPreference;
window.trackTestCompletion = trackTestCompletion;
window.getUserStats = getUserStats;
window.scrollToTop = scrollToTop;
window.setHomeButtonState = setHomeButtonState;
window.setActiveNavItem = setActiveNavItem;
window.AppState = AppState;
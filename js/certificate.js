/* ================= PROFESSIONAL TYPING CERTIFICATION LOGIC ================= */
/* Complete JavaScript for Pro Typing Test Certification Page */

// Certification levels configuration
const certLevels = {
    'bronze': {
        name: 'Bronze Certificate',
        icon: '🥉',
        wpmTarget: 25,
        accuracyTarget: 85,
        duration: 120,
        words: 50
    },
    'silver': {
        name: 'Silver Certificate',
        icon: '🥈',
        wpmTarget: 40,
        accuracyTarget: 90,
        duration: 180,
        words: 80
    },
    'gold': {
        name: 'Gold Certificate',
        icon: '🥇',
        wpmTarget: 60,
        accuracyTarget: 95,
        duration: 300,
        words: 150
    },
    'platinum': {
        name: 'Platinum Certificate',
        icon: '💎',
        wpmTarget: 80,
        accuracyTarget: 97,
        duration: 300,
        words: 200
    },
    'diamond': {
        name: 'Diamond Certificate',
        icon: '💠',
        wpmTarget: 100,
        accuracyTarget: 98,
        duration: 300,
        words: 250
    },
    'master': {
        name: 'Master Certificate',
        icon: '👑',
        wpmTarget: 120,
        accuracyTarget: 99,
        duration: 600,
        words: 400
    }
};

// Certification texts for each level
const certTexts = {
    'bronze': [
        "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
        "Typing is a valuable skill in today's digital world. It helps you communicate faster and more efficiently with others.",
        "Practice makes perfect when it comes to typing. Start with simple words and gradually increase your speed."
    ],
    'silver': [
        "Learning to type properly takes time and practice. The key is to focus on accuracy first, then speed will naturally follow. Regular practice is essential for building muscle memory.",
        "Touch typing is the ability to type without looking at the keyboard. This skill can significantly increase your typing speed and reduce errors over time.",
        "Good posture and proper hand positioning are crucial for comfortable typing. Keep your wrists straight and fingers curved."
    ],
    'gold': [
        "The history of typing dates back to the invention of the typewriter in the 19th century. Since then, keyboards have become an essential tool for communication in both personal and professional settings.",
        "Ergonomics plays a crucial role in typing efficiency. Proper posture, hand positioning, and regular breaks can prevent strain and injury during long typing sessions.",
        "Consistent daily practice is more effective than long practice sessions once a week. Even fifteen minutes each day can lead to significant improvement."
    ],
    'platinum': [
        "Cognitive research shows that typing fluency is linked to language processing in the brain. As typing becomes automatic, more cognitive resources are available for higher-level thinking and content creation.",
        "The QWERTY keyboard layout was designed to prevent mechanical jams in early typewriters. Despite more efficient layouts being available, it remains the global standard for typing.",
        "Professional typists often achieve speeds of 80+ WPM through dedicated practice. This level of proficiency requires excellent muscle memory and focus."
    ],
    'diamond': [
        "Professional typists can achieve speeds of over 100 words per minute through years of dedicated practice. This level of proficiency requires excellent muscle memory and concentration under pressure.",
        "In competitive typing, every millisecond counts. Top typists use specialized keyboards and techniques to maximize their speed while maintaining exceptional accuracy.",
        "The connection between mind and fingers becomes seamless at advanced typing levels. Thoughts flow directly to the screen without conscious effort."
    ],
    'master': [
        "The world record for typing speed exceeds 200 words per minute, achieved using stenotype machines. This demonstrates the incredible potential of human adaptability when combined with optimal tools and techniques.",
        "Mastering typing is not just about speed; it's about developing a seamless connection between thought and expression. At the highest levels, typing becomes an extension of the mind itself.",
        "Elite typists often develop their own unique techniques and keyboard layouts. The journey to master typing is deeply personal and rewarding."
    ]
};

// Global state variables
let currentCert = null;
let currentSessionId = null;
let certActive = false;
let certText = '';
let certWords = [];
let startTime = null;
let timerInterval = null;
let timeLeft = 0;
let userInput = '';
let wordIndex = 0;
let correctChars = 0;
let totalChars = 0;
let errors = 0;

// Load certificates from localStorage
let certificates = JSON.parse(localStorage.getItem('proTypingCertificates') || '[]');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadCertificateStats();
    loadCertificateGallery();
    loadLeaderboard();
    setupInputListener();
});

// Load certificate statistics
function loadCertificateStats() {
    const certificatesEarned = certificates.length;
    const bestWPM = certificates.length > 0 ? Math.max(...certificates.map(c => c.wpm)) : 0;
    
    const levelOrder = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'];
    let highestIndex = -1;
    certificates.forEach(cert => {
        const idx = levelOrder.indexOf(cert.level);
        if (idx > highestIndex) highestIndex = idx;
    });
    const highestLevel = highestIndex >= 0 ? levelOrder[highestIndex].charAt(0).toUpperCase() + levelOrder[highestIndex].slice(1) : '-';
    
    const certificatesEarnedElem = document.getElementById('certificatesEarned');
    const highestLevelElem = document.getElementById('highestLevel');
    const bestWPMelem = document.getElementById('bestWPM');
    
    if (certificatesEarnedElem) certificatesEarnedElem.textContent = certificatesEarned;
    if (highestLevelElem) highestLevelElem.textContent = highestLevel;
    if (bestWPMelem) bestWPMelem.textContent = bestWPM;
}

// Load certificate gallery
function loadCertificateGallery() {
    const container = document.getElementById('certificateGallery');
    if (!container) return;
    
    if (certificates.length === 0) {
        container.innerHTML = '<div class="no-certificates">No certificates yet. Take a test to earn your first certificate!</div>';
        return;
    }
    
    const recentCertificates = [...certificates].reverse().slice(0, 6);
    
    container.innerHTML = recentCertificates.map(cert => `
        <div class="gallery-item" onclick="viewCertificate('${cert.id}')">
            <div class="gallery-icon">${cert.icon}</div>
            <div class="gallery-title">${cert.level.charAt(0).toUpperCase() + cert.level.slice(1)} Certificate</div>
            <div class="gallery-date">${cert.date}</div>
        </div>
    `).join('');
}

// Load leaderboard
function loadLeaderboard() {
    const container = document.getElementById('certLeaderboard');
    if (!container) return;
    
    const userCertCounts = {};
    certificates.forEach(cert => {
        const name = cert.candidate || 'Typing User';
        userCertCounts[name] = (userCertCounts[name] || 0) + 1;
    });
    
    const leaderboardData = Object.entries(userCertCounts).map(([name, count]) => ({ name, count }));
    leaderboardData.sort((a, b) => b.count - a.count);
    const top5 = leaderboardData.slice(0, 5);
    
    if (top5.length === 0) {
        container.innerHTML = '<div class="no-data">No certificates yet. Be the first!</div>';
        return;
    }
    
    container.innerHTML = top5.map(item => `
        <div class="leaderboard-item">
            <span class="leaderboard-name">${item.name}</span>
            <span class="leaderboard-score">${item.count} certs</span>
        </div>
    `).join('');
}

window.startCertification = async function(level) {
    if (certActive) {
        alert('A test is already in progress. Please complete or cancel it first.');
        return;
    }
    
    let candidateName = prompt("Please enter your Full Name for the certificate (your certificate will be verifiable under this name):", localStorage.getItem('proTypingCandidateName') || "");
    if (candidateName === null) {
        return; // Cancel clicked
    }
    candidateName = candidateName.trim() || "Typing User";
    localStorage.setItem('proTypingCandidateName', candidateName);

    currentCert = level;
    certActive = true;
    const config = certLevels[level];
    
    // Initialize server-bound test session for authentic certificate issuance
    currentSessionId = null;
    let selectedChallenge = null;
    try {
        const sessRes = await fetch('/api/cert-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: level, candidate: candidateName })
        });
        if (sessRes.ok) {
            const sessData = await sessRes.json();
            if (sessData.success && sessData.sessionId) {
                currentSessionId = sessData.sessionId;
                selectedChallenge = sessData.challengeText;
            }
        }
    } catch (netErr) {
        console.warn('Server session API offline; test running in local offline self-practice mode.');
    }

    if (!selectedChallenge) {
        const texts = certTexts[level] || certTexts['bronze'];
        const randomIndex = Math.floor(Math.random() * texts.length);
        selectedChallenge = texts[randomIndex];
    }

    certText = selectedChallenge;
    certWords = certText.split(' ');
    
    timeLeft = config.duration;
    userInput = '';
    wordIndex = 0;
    correctChars = 0;
    totalChars = 0;
    errors = 0;
    startTime = null;
    
    const levelsGrid = document.getElementById('certLevelsGrid');
    const testArea = document.getElementById('testArea');
    const resultArea = document.getElementById('resultArea');
    
    if (levelsGrid) levelsGrid.style.display = 'none';
    if (testArea) testArea.style.display = 'block';
    if (resultArea) resultArea.style.display = 'none';
    
    const certLevelElem = document.getElementById('certLevel');
    const targetWPMelem = document.getElementById('targetWPM');
    const targetAccuracyElem = document.getElementById('targetAccuracy');
    const timerElem = document.getElementById('timer');
    const totalWordsElem = document.getElementById('totalWords');
    const testTextElem = document.getElementById('testText');
    
    if (certLevelElem) certLevelElem.textContent = config.name + ' Test';
    if (targetWPMelem) targetWPMelem.textContent = config.wpmTarget;
    if (targetAccuracyElem) targetAccuracyElem.textContent = config.accuracyTarget + '%';
    if (timerElem) timerElem.textContent = formatTime(timeLeft);
    if (totalWordsElem) totalWordsElem.textContent = config.words;
    if (testTextElem) testTextElem.innerHTML = highlightText(certText, '');
    
    const userInputElem = document.getElementById('userInput');
    if (userInputElem) {
        userInputElem.value = '';
        userInputElem.focus();
    }
    
    const liveWPMelem = document.getElementById('liveWPM');
    const liveAccuracyElem = document.getElementById('liveAccuracy');
    const liveProgressElem = document.getElementById('liveProgress');
    const liveErrorsElem = document.getElementById('liveErrors');
    const progressFillElem = document.getElementById('progressFill');
    
    if (liveWPMelem) liveWPMelem.textContent = '0';
    if (liveAccuracyElem) liveAccuracyElem.textContent = '100%';
    if (liveProgressElem) liveProgressElem.textContent = `0/${certWords.length}`;
    if (liveErrorsElem) liveErrorsElem.textContent = '0';
    if (progressFillElem) progressFillElem.style.width = '0%';
    
    if (testArea) testArea.scrollIntoView({ behavior: 'smooth' });
};

// Format time (MM:SS)
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Highlight text based on user input
function highlightText(text, input) {
    const words = text.split(' ');
    const inputWords = input.split(' ');
    
    return words.map((word, i) => {
        if (i < inputWords.length - 1) {
            const isCorrect = word === inputWords[i];
            return `<span class="${isCorrect ? 'correct-word' : 'incorrect-word'}">${word}</span>`;
        } else if (i === inputWords.length - 1) {
            const inputWord = inputWords[i] || '';
            let highlighted = '';
            for (let j = 0; j < word.length; j++) {
                if (j < inputWord.length) {
                    if (word[j] === inputWord[j]) {
                        highlighted += `<span class="correct-char">${word[j]}</span>`;
                    } else {
                        highlighted += `<span class="incorrect-char">${word[j]}</span>`;
                    }
                } else {
                    highlighted += `<span class="pending-char">${word[j]}</span>`;
                }
            }
            return `<span class="current-word">${highlighted}</span>`;
        } else {
            return `<span class="future-word">${word}</span>`;
        }
    }).join(' ');
}

// Start timer
function startCertTimer() {
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        const timerElem = document.getElementById('timer');
        if (timerElem) timerElem.textContent = formatTime(timeLeft);
        
        const config = certLevels[currentCert];
        const totalDuration = config.duration;
        const progress = ((totalDuration - timeLeft) / totalDuration) * 100;
        const progressFillElem = document.getElementById('progressFill');
        if (progressFillElem) progressFillElem.style.width = progress + '%';
        
        if (timeLeft <= 0) {
            endCertification(false);
        }
    }, 1000);
}

// Calculate current WPM
function calculateWPM() {
    if (!startTime) return 0;
    const minutes = (Date.now() - startTime) / 60000;
    const wordsTyped = correctChars / 5;
    return Math.round(wordsTyped / minutes);
}

// Setup input listener
function setupInputListener() {
    const userInputElem = document.getElementById('userInput');
    if (!userInputElem) return;
    
    userInputElem.addEventListener('input', function(e) {
        if (!certActive) return;
        
        const input = e.target.value;
        
        if (!startTime && input.length > 0) {
            startTime = Date.now();
            startCertTimer();
        }
        
        const testTextElem = document.getElementById('testText');
        if (testTextElem) testTextElem.innerHTML = highlightText(certText, input);
        
        const inputWords = input.split(' ');
        let correct = 0;
        let total = 0;
        let errs = 0;
        
        for (let i = 0; i < inputWords.length - 1; i++) {
            if (i < certWords.length) {
                if (inputWords[i] === certWords[i]) {
                    correct += certWords[i].length;
                } else {
                    errs++;
                }
                total += certWords[i].length;
            }
        }
        
        const currentWordIndex = inputWords.length - 1;
        if (currentWordIndex < certWords.length && inputWords[currentWordIndex]) {
            const currentWord = certWords[currentWordIndex];
            const currentInput = inputWords[currentWordIndex];
            
            for (let j = 0; j < currentInput.length; j++) {
                if (j < currentWord.length) {
                    if (currentInput[j] === currentWord[j]) {
                        correct++;
                    } else {
                        errs++;
                    }
                    total++;
                }
            }
        }
        
        correctChars = correct;
        totalChars = total;
        errors = errs;
        
        const wpm = calculateWPM();
        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
        
        const liveWPMelem = document.getElementById('liveWPM');
        const liveAccuracyElem = document.getElementById('liveAccuracy');
        const liveProgressElem = document.getElementById('liveProgress');
        const liveErrorsElem = document.getElementById('liveErrors');
        
        if (liveWPMelem) liveWPMelem.textContent = wpm;
        if (liveAccuracyElem) liveAccuracyElem.textContent = accuracy + '%';
        if (liveProgressElem) liveProgressElem.textContent = `${inputWords.length - 1}/${certWords.length}`;
        if (liveErrorsElem) liveErrorsElem.textContent = errors;
        
        if (inputWords.length - 1 >= certWords.length && input.endsWith(' ')) {
            endCertification(true);
        }
    });
}

// End certification test
function endCertification(passed) {
    if (!certActive) return;
    
    certActive = false;
    if (timerInterval) clearInterval(timerInterval);
    
    const config = certLevels[currentCert];
    const wpm = calculateWPM();
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
    const passedTest = wpm >= config.wpmTarget && accuracy >= config.accuracyTarget;
    
    if (passedTest) {
        const candidateName = localStorage.getItem('proTypingCandidateName') || 'Typing User';
        const certificate = {
            id: Date.now().toString(),
            level: currentCert,
            name: config.name,
            icon: config.icon,
            wpm: wpm,
            accuracy: accuracy,
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            candidate: candidateName,
            certId: 'PTT-' + Date.now().toString().slice(-8)
        };
        const elapsedMs = startTime ? (Date.now() - startTime) : (config.duration * 1000);
        certificate.sessionId = currentSessionId;
        certificates.push(certificate);
        localStorage.setItem('proTypingCertificates', JSON.stringify(certificates));
        requestServerSignature(certificate, userInput, elapsedMs, currentSessionId);
        
        loadCertificateStats();
        loadCertificateGallery();
        loadLeaderboard();
    }
    
    const testArea = document.getElementById('testArea');
    const resultArea = document.getElementById('resultArea');
    const levelsGrid = document.getElementById('certLevelsGrid');
    
    if (testArea) testArea.style.display = 'none';
    if (resultArea) resultArea.style.display = 'block';
    if (levelsGrid && !passedTest) levelsGrid.style.display = 'grid';
    
    const certCard = document.getElementById('certificateCard');
    if (certCard) certCard.setAttribute('data-level', currentCert);
    
    const certIcon = document.getElementById('certIcon');
    const certTitle = document.getElementById('certTitle');
    const certBadge = document.getElementById('certBadge');
    const resultWPM = document.getElementById('resultWPM');
    const resultAccuracy = document.getElementById('resultAccuracy');
    const testDurationElem = document.getElementById('testDuration');
    const resultMessage = document.getElementById('resultMessage');
    const certIdElem = document.getElementById('certId');
    
    if (certIcon) certIcon.textContent = config.icon;
    if (certTitle) certTitle.textContent = config.name;
    if (certBadge) {
        certBadge.textContent = passedTest ? 'PASSED' : 'NOT PASSED';
        certBadge.style.background = passedTest ? '#10b981' : '#ef4444';
    }
    if (resultWPM) resultWPM.textContent = wpm;
    if (resultAccuracy) resultAccuracy.textContent = accuracy + '%';
    if (testDurationElem) testDurationElem.textContent = Math.floor(config.duration / 60) + ' minutes';
    
    let message = '';
    if (passedTest) {
        message = `🎉 Congratulations! You've earned the ${config.name}! 🎉\nYour score meets all requirements. Download or share your certificate now!`;
    } else {
        if (wpm < config.wpmTarget && accuracy < config.accuracyTarget) {
            message = `📈 You need ${config.wpmTarget} WPM and ${config.accuracyTarget}% accuracy. Keep practicing!`;
        } else if (wpm < config.wpmTarget) {
            message = `⚡ Great accuracy! You need ${config.wpmTarget} WPM. Practice for more speed.`;
        } else {
            message = `🎯 Great speed! You need ${config.accuracyTarget}% accuracy. Focus on typing correctly.`;
        }
    }
    if (resultMessage) resultMessage.textContent = message;
    
    if (passedTest && certIdElem) {
        const latestCert = certificates[certificates.length - 1];
        certIdElem.textContent = latestCert.certId;
    } else if (certIdElem) {
        certIdElem.textContent = '-';
    }
}

// Cancel certification
window.cancelCertification = function() {
    if (confirm('Cancel this certification test? Your progress will be lost.')) {
        certActive = false;
        currentSessionId = null;
        if (timerInterval) clearInterval(timerInterval);
        
        const testArea = document.getElementById('testArea');
        const levelsGrid = document.getElementById('certLevelsGrid');
        const resultArea = document.getElementById('resultArea');
        
        if (testArea) testArea.style.display = 'none';
        if (levelsGrid) levelsGrid.style.display = 'grid';
        if (resultArea) resultArea.style.display = 'none';
        
        const userInputElem = document.getElementById('userInput');
        if (userInputElem) userInputElem.value = '';
    }
};

// Retake certification
window.retakeCertification = function() {
    const resultArea = document.getElementById('resultArea');
    const levelsGrid = document.getElementById('certLevelsGrid');
    
    currentSessionId = null;
    if (resultArea) resultArea.style.display = 'none';
    if (levelsGrid) levelsGrid.style.display = 'grid';
    
    const userInputElem = document.getElementById('userInput');
    if (userInputElem) userInputElem.value = '';
};

// View certificate
window.viewCertificate = function(id) {
    const cert = certificates.find(c => c.id == id);
    if (!cert) return;
    
    const config = certLevels[cert.level];
    
    const certCard = document.getElementById('certificateCard');
    if (certCard) certCard.setAttribute('data-level', cert.level);
    
    const certIcon = document.getElementById('certIcon');
    const certTitle = document.getElementById('certTitle');
    const certBadge = document.getElementById('certBadge');
    const candidateName = document.getElementById('candidateName');
    const certDate = document.getElementById('certDate');
    const testDurationElem = document.getElementById('testDuration');
    const resultWPM = document.getElementById('resultWPM');
    const resultAccuracy = document.getElementById('resultAccuracy');
    const resultMessage = document.getElementById('resultMessage');
    const certIdElem = document.getElementById('certId');
    
    if (certIcon) certIcon.textContent = cert.icon;
    if (certTitle) certTitle.textContent = cert.name;
    if (certBadge) {
        certBadge.textContent = 'PASSED';
        certBadge.style.background = '#10b981';
    }
    if (candidateName) candidateName.textContent = cert.candidate;
    if (certDate) certDate.textContent = cert.date;
    if (testDurationElem) testDurationElem.textContent = Math.floor(config.duration / 60) + ' minutes';
    if (resultWPM) resultWPM.textContent = cert.wpm;
    if (resultAccuracy) resultAccuracy.textContent = cert.accuracy + '%';
    if (resultMessage) resultMessage.textContent = `You earned this ${cert.name} on ${cert.date}. Certificate ID: ${cert.certId}`;
    if (certIdElem) certIdElem.textContent = cert.certId;
    
    const levelsGrid = document.getElementById('certLevelsGrid');
    const resultArea = document.getElementById('resultArea');
    
    if (levelsGrid) levelsGrid.style.display = 'none';
    if (resultArea) resultArea.style.display = 'block';
    
    if (resultArea) resultArea.scrollIntoView({ behavior: 'smooth' });
};

// Download certificate
window.downloadCertificate = function() {
    const level = document.getElementById('certTitle')?.textContent || 'Certificate';
    const wpm = document.getElementById('resultWPM')?.textContent || '0';
    const accuracy = document.getElementById('resultAccuracy')?.textContent || '0%';
    const date = document.getElementById('certDate')?.textContent || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const certId = document.getElementById('certId')?.textContent || 'PTT-' + Date.now().toString().slice(-8);
    const candidateName = document.getElementById('candidateName')?.textContent || localStorage.getItem('proTypingCandidateName') || 'Typing User';
    
    // Find active certificate object or build one
    let activeCert = certificates.find(c => c.certId === certId);
    if (!activeCert) {
        activeCert = {
            candidate: candidateName,
            wpm: parseInt(wpm, 10) || 0,
            accuracy: parseInt(accuracy, 10) || 0,
            level: currentCert || 'bronze',
            name: level,
            date: date,
            certId: certId
        };
    }
    
    const token = generateVerificationToken(activeCert);
    const verifyUrl = `${window.location.origin}/certificate/verify?cert=${token}`;

    const certificateHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Typing Skills Certificate - ${level} - ${candidateName}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; text-align: center; padding: 40px 20px; background: #f0f4fd; color: #1e293b; }
        .certificate { max-width: 820px; margin: 0 auto; border: 8px double #3b82f6; padding: 45px 35px; background: #ffffff; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
        .brand { color: #3b82f6; font-size: 1.3rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
        h1 { color: #0f172a; font-size: 2.2rem; margin-bottom: 6px; }
        .level-title { font-size: 1.5rem; color: #2563eb; font-weight: 600; margin-bottom: 24px; }
        .cert-text { font-size: 1.05rem; color: #64748b; margin-bottom: 10px; }
        .candidate-name { font-size: 2rem; color: #0f172a; font-weight: 800; border-bottom: 2px solid #e2e8f0; display: inline-block; padding: 4px 30px 10px; margin-bottom: 20px; }
        .scores { display: flex; justify-content: center; gap: 40px; margin: 25px 0; }
        .score-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 28px; }
        .score-value { font-size: 2.2rem; font-weight: 800; color: #2563eb; }
        .score-label { color: #64748b; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        .meta-grid { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; margin-top: 30px; padding-top: 20px; font-size: 0.92rem; color: #64748b; }
        .verify-box { margin-top: 20px; padding: 12px; background: #f1f5f9; border-radius: 8px; font-size: 0.85rem; word-break: break-all; }
        .verify-box a { color: #2563eb; text-decoration: none; font-weight: 600; }
        .disclaimer { margin-top: 25px; padding-top: 15px; border-top: 1px dashed #cbd5e1; font-size: 0.78rem; color: #94a3b8; line-height: 1.5; }
        @media print { body { background: white; padding: 0; } .certificate { box-shadow: none; border-width: 4px; } }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="brand">ProTypingTest.in</div>
        <h1>Certificate of Achievement</h1>
        <div class="level-title">${level}</div>
        <p class="cert-text">This certifies that</p>
        <div class="candidate-name">${candidateName}</div>
        <p class="cert-text">has successfully completed an online typing skills assessment with verified results:</p>
        <div class="scores">
            <div class="score-box">
                <div class="score-value">${wpm}</div>
                <div class="score-label">Words Per Minute</div>
            </div>
            <div class="score-box">
                <div class="score-value">${accuracy}</div>
                <div class="score-label">Accuracy</div>
            </div>
        </div>
        <div class="meta-grid">
            <div><strong>Date of Issue:</strong> ${date}</div>
            <div><strong>Certificate ID:</strong> ${certId}</div>
        </div>
        <div class="verify-box">
            Verify this milestone online: <a href="${verifyUrl}" target="_blank" rel="noopener">${verifyUrl}</a>
        </div>
        <div class="disclaimer">
            <strong>Non-Accreditation Notice:</strong> This certificate is issued based on self-administered online typing assessments on ProTypingTest.in for skill tracking and milestone recognition. It is not an accredited academic degree or statutory government qualification.
        </div>
    </div>
</body>
</html>`;
    
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protypingtest-${level.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Certificate downloaded! Open it in any browser or press Ctrl+P to save as PDF.');
};

// Verification token generator
function generateVerificationToken(cert) {
    if (cert && cert.token) return cert.token;
    const dataStr = `${cert.candidate || 'Typing Candidate'}|${cert.wpm}|${cert.accuracy}|${cert.level}|${cert.date}|${cert.certId || 'PTT-LOCAL'}`;
    const tokenInput = `${dataStr}|UNSIGNED-OFFLINE-RECORD`;
    try {
        return btoa(unescape(encodeURIComponent(tokenInput)));
    } catch (e) {
        return btoa(tokenInput);
    }
}

// Request authentic cryptographic signature from server based on submitted typing evidence
async function requestServerSignature(cert, typedText, elapsedMs, sessionId) {
    if (!sessionId) {
        console.warn('No active server session. Certificate recorded as local offline practice achievement.');
        return;
    }

    try {
        const response = await fetch('/api/sign-cert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: sessionId,
                candidate: cert.candidate,
                typedText: typedText,
                elapsedMs: elapsedMs
            })
        });

        const result = await response.json();
        if (response.ok && result.success && result.token) {
            cert.token = result.token;
            cert.certId = result.certId;
            cert.wpm = result.wpm; // Authoritative server-calculated Net WPM
            cert.accuracy = result.accuracy; // Authoritative server-calculated Accuracy
            cert.serverSigned = true;

            const idx = certificates.findIndex(c => c.id === cert.id);
            if (idx !== -1) {
                certificates[idx] = cert;
                localStorage.setItem('proTypingCertificates', JSON.stringify(certificates));
            }

            const certIdElem = document.getElementById('certId');
            if (certIdElem) certIdElem.textContent = cert.certId;

            const resultWPM = document.getElementById('resultWPM');
            if (resultWPM) resultWPM.textContent = cert.wpm;

            const resultAccuracy = document.getElementById('resultAccuracy');
            if (resultAccuracy) resultAccuracy.textContent = cert.accuracy + '%';
        } else {
            console.warn('Server certificate signature validation rejected:', result.error);
        }
    } catch (e) {
        console.warn('Server verification endpoint offline. Certificate saved as local self-practice record.');
    }
}

// Share certificate
window.shareCertificate = function() {
    if (certificates.length === 0) {
        alert('No certificates available to share.');
        return;
    }
    
    const certId = document.getElementById('certId')?.textContent || '';
    let cert = certificates.find(c => c.certId === certId);
    
    if (!cert || certId === '-' || certId === '') {
        cert = certificates[certificates.length - 1];
    }
    
    const token = generateVerificationToken(cert);
    const verifyUrl = `${window.location.origin}/certificate/verify.html?cert=${token}`;
    const text = `I just earned the ${cert.name} on ProTypingTest.in with ${cert.wpm} WPM and ${cert.accuracy}% accuracy! Verify my certificate here: ${verifyUrl} 🎉`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Verifiable Typing Certificate',
            text: text,
            url: verifyUrl
        }).catch(() => {
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
};

// Copy to clipboard helper
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Verification link and achievement copied to clipboard! Share it on your LinkedIn or resume.');
    }).catch(() => {
        alert('📤 Share your achievement: ' + text);
    });
}
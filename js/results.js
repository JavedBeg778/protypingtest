/* ================= PROFESSIONAL RESULTS ENGINE v4.0 ================= */
/* Complete JavaScript for Pro Typing Test Results Page */
/* AdSense Optimized - High Quality Interactive Features */

class TypingResults {
    
    static CONFIG = {
        HISTORY_LIMIT: 50,
        DEFAULT_GOAL: 40,
        WORD_STANDARD: 5,
        GRAPH_COLORS: {
            excellent: 'linear-gradient(180deg, #10b981, #059669)',
            good: 'linear-gradient(180deg, #f59e0b, #d97706)',
            average: 'linear-gradient(180deg, #3b82f6, #2563eb)',
            beginner: 'linear-gradient(180deg, #8b5cf6, #7c3aed)',
            poor: 'linear-gradient(180deg, #ef4444, #dc2626)',
            zero: 'linear-gradient(180deg, #9ca3af, #6b7280)'
        },
        RANKS: [
            { name: 'Novice', min: 0, max: 20, color: '#9ca3af' },
            { name: 'Beginner', min: 21, max: 40, color: '#8b5cf6' },
            { name: 'Intermediate', min: 41, max: 60, color: '#3b82f6' },
            { name: 'Advanced', min: 61, max: 80, color: '#f59e0b' },
            { name: 'Expert', min: 81, max: 100, color: '#10b981' },
            { name: 'Master', min: 101, max: 999, color: '#ef4444' }
        ],
        CERTIFICATE_REQUIREMENTS: {
            wpm: 40,
            accuracy: 90,
            consistency: 85
        }
    };

    constructor() {
        this.data = this.getDefaultData();
        this.hasData = false;
        this.elements = {};
        this.graphType = 'wpm';
        
        this.init();
    }

    init() {
        this.cacheElements();
        this.loadData();
        this.renderAll();
        this.attachEvents();
        this.loadQuickStats();
        
        if (!this.hasData) {
            this.showNoDataMessage();
        }
    }

    getDefaultData() {
        return {
            wpm: 0,
            grossWPM: 0,
            netWPM: 0,
            accuracy: 0,
            consistency: 100,
            peakWPM: 0,
            rank: 'Novice',
            wordsTyped: 0,
            correctWords: 0,
            incorrectWords: 0,
            totalChars: 0,
            correctChars: 0,
            incorrectChars: 0,
            backspaces: 0,
            errorRate: 0,
            errorCount: 0,
            bestStreak: 0,
            pauses: 0,
            fatigueIndex: 0,
            testDuration: "2",
            testMode: "normal",
            difficulty: "medium",
            timestamp: new Date().toISOString(),
            testId: Date.now()
        };
    }

    cacheElements() {
        const ids = [
            "circleWPM", "circleAccuracy", "circleNetSpeed",
            "testDuration", "testMode", "lastScore", "rank",
            "goalValue", "goalDisplay", "goalDiff", "goalProgress", "goalProgressText",
            "bestEasy", "bestMedium", "bestHard", "bestBenchmark",
            "wordsTyped", "correctWords", "incorrectWords", "bestStreak",
            "totalChars", "correctChars", "incorrectChars", "backspaces",
            "errorRate", "errorCount", "pauses", "fatigueIndex",
            "grossWPM", "peakWPM", "consistency", "certificateStatus"
        ];

        ids.forEach(id => {
            this.elements[id] = document.getElementById(id);
        });
        
        this.elements.scaleItems = document.querySelectorAll(".scale-item");
        this.elements.graphContainer = document.getElementById('graphContainer');
    }

    loadData() {
        // Try to load from sessionStorage (direct test results)
        const saved = sessionStorage.getItem("typingTestResults");
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.wpm > 0 || parsed.correctChars > 0) {
                    this.data = { ...this.getDefaultData(), ...parsed };
                    this.hasData = true;
                    console.log("✅ Loaded from sessionStorage:", this.data);
                    sessionStorage.removeItem("typingTestResults");
                    return;
                }
            } catch (error) {
                console.error("Error loading from sessionStorage:", error);
            }
        }

        // Try to load from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const wpmParam = urlParams.get('wpm');
        const accuracyParam = urlParams.get('accuracy');
        const durationParam = urlParams.get('duration');
        
        if (wpmParam && accuracyParam) {
            this.data.wpm = parseInt(wpmParam);
            this.data.netWPM = parseInt(wpmParam);
            this.data.accuracy = parseInt(accuracyParam);
            this.data.testDuration = durationParam || "2";
            this.hasData = true;
            console.log("✅ Loaded from URL parameters:", this.data);
            return;
        }

        // Try to load from history
        const history = JSON.parse(localStorage.getItem("typingHistory")) || [];
        if (history.length > 0) {
            const lastTest = history[history.length - 1];
            this.data = { ...this.getDefaultData(), ...lastTest };
            this.hasData = true;
            console.log("✅ Loaded from history:", this.data);
        }
    }

    renderAll() {
        if (!this.hasData) {
            this.renderEmptyState();
            return;
        }

        this.renderPrimaryMetrics();
        this.renderWordMetrics();
        this.renderCharacterMetrics();
        this.renderAdvancedMetrics();
        this.renderGoal();
        this.renderScale();
        this.renderRank();
        this.renderGraph();
        this.renderBestScores();
        this.renderCertificateStatus();
        
        this.saveHistory();
    }

    renderPrimaryMetrics() {
        const grossSpeed = this.data.grossWPM || this.data.wpm || 0;
        const netSpeed = this.data.netWPM !== undefined ? this.data.netWPM : this.data.wpm || 0;

        if (this.elements.circleWPM) {
            this.elements.circleWPM.textContent = grossSpeed;
        }
        if (this.elements.circleAccuracy) {
            this.elements.circleAccuracy.textContent = (this.data.accuracy || 100) + '%';
        }
        if (this.elements.circleNetSpeed) {
            this.elements.circleNetSpeed.textContent = netSpeed;
        }
        if (this.elements.testDuration) {
            this.elements.testDuration.textContent = this.data.testDuration + " Minute Test";
        }
        if (this.elements.testMode) {
            const mode = (this.data.testMode || 'normal').charAt(0).toUpperCase() + 
                        (this.data.testMode || 'normal').slice(1);
            this.elements.testMode.textContent = mode + " Mode";
        }
        if (this.elements.lastScore) {
            this.elements.lastScore.textContent = netSpeed + " WPM";
        }
        if (this.elements.grossWPM) {
            this.elements.grossWPM.textContent = grossSpeed;
        }
        if (this.elements.peakWPM) {
            this.elements.peakWPM.textContent = this.data.peakWPM || grossSpeed;
        }
        if (this.elements.consistency) {
            this.elements.consistency.textContent = (this.data.consistency || 100) + '%';
        }
    }

    renderWordMetrics() {
        if (this.elements.wordsTyped) {
            this.elements.wordsTyped.textContent = this.data.wordsTyped || 
                Math.round(this.data.correctChars / 5) || 0;
        }
        if (this.elements.correctWords) {
            this.elements.correctWords.textContent = this.data.correctWords || 0;
        }
        if (this.elements.incorrectWords) {
            this.elements.incorrectWords.textContent = this.data.incorrectWords || 0;
        }
        if (this.elements.bestStreak) {
            this.elements.bestStreak.textContent = this.data.bestStreak || 0;
        }
    }

    renderCharacterMetrics() {
        if (this.elements.totalChars) {
            this.elements.totalChars.textContent = this.data.totalChars || 0;
        }
        if (this.elements.correctChars) {
            this.elements.correctChars.textContent = this.data.correctChars || 0;
        }
        if (this.elements.incorrectChars) {
            this.elements.incorrectChars.textContent = this.data.incorrectChars || 0;
        }
        if (this.elements.backspaces) {
            this.elements.backspaces.textContent = this.data.backspaces || 0;
        }
    }

    renderAdvancedMetrics() {
        if (this.elements.errorRate) {
            const duration = parseInt(this.data.testDuration) || 2;
            const errorRate = Math.round((this.data.errorCount || 0) / duration);
            this.elements.errorRate.textContent = errorRate;
        }
        if (this.elements.errorCount) {
            this.elements.errorCount.textContent = this.data.errorCount || 0;
        }
        if (this.elements.pauses) {
            this.elements.pauses.textContent = this.data.pauses || 0;
        }
        if (this.elements.fatigueIndex) {
            this.elements.fatigueIndex.textContent = (this.data.fatigueIndex || 0) + '%';
        }
    }

    renderRank() {
        const wpm = this.data.wpm;
        let rank = TypingResults.CONFIG.RANKS[0];
        
        for (let i = TypingResults.CONFIG.RANKS.length - 1; i >= 0; i--) {
            if (wpm >= TypingResults.CONFIG.RANKS[i].min) {
                rank = TypingResults.CONFIG.RANKS[i];
                break;
            }
        }
        
        this.data.rank = rank.name;
        if (this.elements.rank) {
            this.elements.rank.textContent = rank.name;
            this.elements.rank.style.color = rank.color;
        }
    }

    renderGoal() {
        const goal = parseInt(localStorage.getItem("typingGoal")) || TypingResults.CONFIG.DEFAULT_GOAL;
        const diff = goal - this.data.wpm;

        if (this.elements.goalValue) {
            this.elements.goalValue.textContent = goal + " WPM";
        }
        if (this.elements.goalDisplay) {
            this.elements.goalDisplay.textContent = goal + " WPM";
        }
        if (this.elements.goalDiff) {
            if (diff > 0) {
                this.elements.goalDiff.textContent = `(${diff} away from goal)`;
                this.elements.goalDiff.style.color = "var(--accent-warning)";
            } else {
                this.elements.goalDiff.textContent = "(🎯 Goal Achieved!)";
                this.elements.goalDiff.style.color = "var(--accent-success)";
            }
        }
        
        const progressPercent = Math.min(100, Math.round((this.data.wpm / goal) * 100));
        if (this.elements.goalProgress) {
            this.elements.goalProgress.style.width = progressPercent + '%';
        }
        if (this.elements.goalProgressText) {
            this.elements.goalProgressText.textContent = progressPercent + '% Complete';
        }
    }

    renderScale() {
        if (!this.elements.scaleItems) return;
        const wpm = this.data.wpm;
        
        this.elements.scaleItems.forEach((item, index) => {
            item.style.opacity = "0.4";
            const label = item.querySelector('.scale-label');
            if (label) label.style.fontWeight = 'normal';
        });

        let index = 0;
        if (wpm >= 85) index = 3;
        else if (wpm >= 45) index = 2;
        else if (wpm >= 25) index = 1;

        if (this.elements.scaleItems[index]) {
            this.elements.scaleItems[index].style.opacity = "1";
            const label = this.elements.scaleItems[index].querySelector('.scale-label');
            if (label) label.style.fontWeight = 'bold';
        }
    }

    renderCertificateStatus() {
        if (!this.elements.certificateStatus) return;

        const wpm = this.data.wpm;
        const acc = this.data.accuracy;
        
        if (wpm >= TypingResults.CONFIG.CERTIFICATE_REQUIREMENTS.wpm && 
            acc >= TypingResults.CONFIG.CERTIFICATE_REQUIREMENTS.accuracy) {
            this.elements.certificateStatus.innerHTML = '✅ Eligible for Certificate! Take the certification test now.';
            this.elements.certificateStatus.style.color = 'var(--accent-success)';
        } else if (wpm >= 30 && acc >= 85) {
            this.elements.certificateStatus.innerHTML = '⚠️ Close to Certificate! Keep practicing.';
            this.elements.certificateStatus.style.color = 'var(--accent-warning)';
        } else {
            this.elements.certificateStatus.innerHTML = '❌ Practice more to earn your certificate. Target: 40+ WPM, 90%+ Accuracy.';
            this.elements.certificateStatus.style.color = 'var(--accent-danger)';
        }
    }

    renderGraph() {
        if (!this.elements.graphContainer) return;
        
        const history = JSON.parse(localStorage.getItem("typingHistory")) || [];
        
        if (history.length === 0) {
            this.elements.graphContainer.innerHTML = `
                <div class="empty-graph">
                    <span>📊</span>
                    <p>No history yet. Complete tests to see your progress!</p>
                    <button onclick="window.location.href='/tests/typing-test-2-minute.html'" style="margin-top: 15px; padding: 10px 20px; background: var(--accent-primary); color: white; border: none; border-radius: 30px; cursor: pointer;">
                        Take a Test
                    </button>
                </div>
            `;
            return;
        }
        
        const recentTests = history.slice(-10).reverse();
        
        let graphHTML = `
            <div class="graph-type-selector">
                <button class="graph-type-btn ${this.graphType === 'wpm' ? 'active' : ''}" data-type="wpm">
                    <span>⚡</span> WPM
                </button>
                <button class="graph-type-btn ${this.graphType === 'accuracy' ? 'active' : ''}" data-type="accuracy">
                    <span>🎯</span> Accuracy
                </button>
                <button class="graph-type-btn ${this.graphType === 'errors' ? 'active' : ''}" data-type="errors">
                    <span>⚠️</span> Errors
                </button>
            </div>
            <div class="graph-wrapper">
                <div class="graph-y-axis" id="graphYAxis"></div>
                <div class="graph-bars-container" id="graphBarsContainer"></div>
            </div>
            <div class="graph-x-axis" id="graphXAxis"></div>
        `;
        
        this.elements.graphContainer.innerHTML = graphHTML;
        
        const graphBarsContainer = document.getElementById('graphBarsContainer');
        const yAxisContainer = document.getElementById('graphYAxis');
        const xAxisContainer = document.getElementById('graphXAxis');
        
        if (!graphBarsContainer) return;
        
        const values = recentTests.map(t => {
            switch(this.graphType) {
                case 'accuracy': return t.accuracy || 0;
                case 'errors': return t.errorCount || 0;
                default: return t.wpm || 0;
            }
        });
        
        const maxValue = Math.max(...values, 1);
        const roundedMax = this.roundUpToNice(maxValue);
        
        // Render Y-axis
        if (yAxisContainer) {
            const ticks = [];
            for (let i = 0; i <= 6; i++) {
                ticks.push(Math.round((roundedMax / 6) * i));
            }
            ticks.reverse();
            yAxisContainer.innerHTML = ticks.map(v => `<div class="y-tick">${v}</div>`).join('');
        }
        
        // Render bars
        let barsHTML = '';
        recentTests.forEach((test, idx) => {
            let value = values[idx];
            let height = (value / roundedMax) * 180;
            let unit = '';
            if (this.graphType === 'accuracy') unit = '%';
            else if (this.graphType === 'errors') unit = '';
            else unit = '';
            
            const barColor = this.getBarColor(value);
            const timeString = this.formatTime(test.timestamp);
            const dateString = this.formatDate(test.timestamp);
            
            barsHTML += `
                <div class="graph-column">
                    <div class="bar-wrapper">
                        <div class="graph-bar" style="height: ${height}px; background: ${barColor};">
                            <span class="bar-tooltip">${value}${unit}</span>
                        </div>
                    </div>
                    <div class="bar-time">${timeString}</div>
                    <div class="bar-date">${dateString}</div>
                </div>
            `;
        });
        
        graphBarsContainer.innerHTML = barsHTML;
        
        // Attach event listeners to graph type buttons
        document.querySelectorAll('.graph-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.graph-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.graphType = btn.dataset.type;
                this.renderGraph();
            });
        });
    }
    
    formatTime(dateStr) {
        if (!dateStr) return "--:--";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "--:--";
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        } catch (e) {
            return "--:--";
        }
    }
    
    formatDate(dateStr) {
        if (!dateStr) return "Unknown";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "Unknown";
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch (e) {
            return "Unknown";
        }
    }

    roundUpToNice(num) {
        if (num <= 10) return 10;
        if (num <= 20) return 20;
        if (num <= 30) return 30;
        if (num <= 40) return 40;
        if (num <= 50) return 50;
        if (num <= 60) return 60;
        if (num <= 70) return 70;
        if (num <= 80) return 80;
        if (num <= 90) return 90;
        return 100;
    }

    getBarColor(value) {
        if (this.graphType === 'accuracy') {
            if (value >= 95) return TypingResults.CONFIG.GRAPH_COLORS.excellent;
            if (value >= 85) return TypingResults.CONFIG.GRAPH_COLORS.good;
            if (value >= 70) return TypingResults.CONFIG.GRAPH_COLORS.average;
            if (value >= 50) return TypingResults.CONFIG.GRAPH_COLORS.beginner;
            return TypingResults.CONFIG.GRAPH_COLORS.poor;
        } else if (this.graphType === 'errors') {
            if (value <= 2) return TypingResults.CONFIG.GRAPH_COLORS.excellent;
            if (value <= 5) return TypingResults.CONFIG.GRAPH_COLORS.good;
            if (value <= 10) return TypingResults.CONFIG.GRAPH_COLORS.average;
            return TypingResults.CONFIG.GRAPH_COLORS.poor;
        } else {
            if (value >= 80) return TypingResults.CONFIG.GRAPH_COLORS.excellent;
            if (value >= 60) return TypingResults.CONFIG.GRAPH_COLORS.good;
            if (value >= 40) return TypingResults.CONFIG.GRAPH_COLORS.average;
            if (value >= 20) return TypingResults.CONFIG.GRAPH_COLORS.beginner;
            if (value > 0) return TypingResults.CONFIG.GRAPH_COLORS.poor;
            return TypingResults.CONFIG.GRAPH_COLORS.zero;
        }
    }

    renderEmptyState() {
        const container = document.querySelector('.results-main');
        if (!container) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'no-data-message';
        messageDiv.innerHTML = `
            <div style="text-align: center; padding: 60px; background: var(--bg-secondary); border-radius: 20px; margin: 30px;">
                <span style="font-size: 64px;">⌨️</span>
                <h2 style="margin: 20px 0;">No Test Results Found</h2>
                <p style="color: var(--text-secondary); margin-bottom: 30px;">
                    Complete a typing test to see your detailed results here.
                </p>
                <button onclick="window.location.href='/tests/typing-test-2-minute.html'" class="action-btn primary" style="background: var(--accent-primary); color: white; border: none; padding: 12px 30px; border-radius: 40px; cursor: pointer;">
                    Take a Test
                </button>
            </div>
        `;
        container.prepend(messageDiv);
    }

    renderBestScores() {
        const best = JSON.parse(localStorage.getItem("typingBestScores")) || {};
        
        if (this.elements.bestEasy) this.elements.bestEasy.textContent = best.easy || best.normal || 0;
        if (this.elements.bestMedium) this.elements.bestMedium.textContent = best.medium || 0;
        if (this.elements.bestHard) this.elements.bestHard.textContent = best.hard || 0;
        if (this.elements.bestBenchmark) this.elements.bestBenchmark.textContent = best.benchmark || best.pro || 0;
        
        // Update best scores with current test if it's higher
        const mode = this.data.testMode || 'normal';
        const currentWPM = this.data.wpm;
        
        if (this.hasData && currentWPM > (best[mode] || 0)) {
            best[mode] = currentWPM;
            localStorage.setItem("typingBestScores", JSON.stringify(best));
        }
        
        const difficulty = this.data.difficulty || 'medium';
        if (this.hasData && currentWPM > (best[difficulty] || 0)) {
            best[difficulty] = currentWPM;
            localStorage.setItem("typingBestScores", JSON.stringify(best));
        }
        
        // Refresh display
        if (this.elements.bestEasy) this.elements.bestEasy.textContent = best.easy || best.normal || 0;
        if (this.elements.bestMedium) this.elements.bestMedium.textContent = best.medium || 0;
        if (this.elements.bestHard) this.elements.bestHard.textContent = best.hard || 0;
        if (this.elements.bestBenchmark) this.elements.bestBenchmark.textContent = best.benchmark || best.pro || 0;
    }

    loadQuickStats() {
        const history = JSON.parse(localStorage.getItem("typingHistory")) || [];
        const totalTests = history.length;
        
        let totalWPM = 0;
        let bestWPM = 0;
        let streak = this.calculateStreak(history);
        
        history.forEach(test => {
            totalWPM += test.wpm || 0;
            if ((test.wpm || 0) > bestWPM) bestWPM = test.wpm || 0;
        });
        
        const avgWPM = totalTests > 0 ? Math.round(totalWPM / totalTests) : 0;
        
        const totalTestsElem = document.getElementById('totalTests');
        const avgWPMelem = document.getElementById('avgWPM');
        const bestWPMOverallElem = document.getElementById('bestWPMOverall');
        const practiceStreakElem = document.getElementById('practiceStreak');
        
        if (totalTestsElem) totalTestsElem.textContent = totalTests;
        if (avgWPMelem) avgWPMelem.textContent = avgWPM;
        if (bestWPMOverallElem) bestWPMOverallElem.textContent = bestWPM;
        if (practiceStreakElem) practiceStreakElem.textContent = streak;
    }
    
    calculateStreak(history) {
        if (history.length === 0) return 0;
        
        let streak = 0;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        const dates = history.map(h => new Date(h.timestamp).toDateString());
        
        if (dates.includes(today)) {
            streak = 1;
            let checkDate = new Date(Date.now() - 86400000);
            while (dates.includes(checkDate.toDateString())) {
                streak++;
                checkDate = new Date(checkDate - 86400000);
            }
        } else if (dates.includes(yesterday)) {
            streak = 1;
            let checkDate = new Date(Date.now() - 172800000);
            while (dates.includes(checkDate.toDateString())) {
                streak++;
                checkDate = new Date(checkDate - 86400000);
            }
        }
        
        return streak;
    }

    saveHistory() {
        if (!this.hasData) return;

        let history = JSON.parse(localStorage.getItem("typingHistory")) || [];

        const lastTest = history[history.length - 1];
        const isDuplicate = lastTest && 
            Math.abs(new Date(lastTest.timestamp || 0).getTime() - Date.now()) < 5000;

        if (!isDuplicate) {
            const historyEntry = {
                timestamp: new Date().toISOString(),
                wpm: this.data.wpm,
                netWPM: this.data.netWPM,
                grossWPM: this.data.grossWPM,
                accuracy: this.data.accuracy,
                consistency: this.data.consistency,
                errorCount: this.data.errorCount,
                wordsTyped: this.data.wordsTyped,
                correctChars: this.data.correctChars,
                incorrectChars: this.data.incorrectChars,
                totalChars: this.data.totalChars,
                duration: this.data.testDuration,
                mode: this.data.testMode,
                difficulty: this.data.difficulty
            };

            history.push(historyEntry);

            if (history.length > TypingResults.CONFIG.HISTORY_LIMIT) {
                history = history.slice(-TypingResults.CONFIG.HISTORY_LIMIT);
            }

            localStorage.setItem("typingHistory", JSON.stringify(history));
            console.log("✅ Saved to history:", historyEntry);
        }
    }

    attachEvents() {
        const editGoalBtn = document.getElementById("editGoalBtn");
        if (editGoalBtn) {
            editGoalBtn.addEventListener("click", () => {
                const currentGoal = localStorage.getItem("typingGoal") || TypingResults.CONFIG.DEFAULT_GOAL;
                const newGoal = prompt("Enter your typing goal (WPM):", currentGoal);
                if (newGoal && !isNaN(newGoal) && parseInt(newGoal) > 0) {
                    localStorage.setItem("typingGoal", parseInt(newGoal));
                    this.renderGoal();
                }
            });
        }
    }

    showNoDataMessage() {
        console.log("No data available to display");
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
    window.typingResults = new TypingResults();
});
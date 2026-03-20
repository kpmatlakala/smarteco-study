// ==========================================
// GAME UI - Rendering & DOM Manipulation
// ==========================================

const UI = {
     // DOM Elements
    introScreen: null,
    gameContainer: null,
    codeEditor: null,
    codeHighlight: null,
    lineNumbers: null,
    consoleOutput: null,
    gameGrid: null,
    robot: null,
    runBtn: null,
    levelModal: null,
    victoryModal: null,
    xpDisplay: null,
    xpValue: null,
    headerTimer: null,
    headerTimerProgress: null,

    init() {
        this.introScreen = document.getElementById('introScreen');
        this.gameContainer = document.getElementById('gameContainer');
        this.codeEditor = document.getElementById('codeEditor');
        this.codeHighlight = document.getElementById('codeHighlight');
        this.lineNumbers = document.getElementById('lineNumbers');
        this.consoleOutput = document.getElementById('consoleOutput');
        this.gameGrid = document.getElementById('gameGrid');
        this.robot = document.getElementById('robot');
        this.runBtn = document.getElementById('runBtn');
        this.levelModal = document.getElementById('levelModal');
        this.victoryModal = document.getElementById('victoryModal');
        this.xpDisplay = document.getElementById('xpDisplay');
        this.xpValue = document.getElementById('xpValue');
        
        // Timer elements
        this.headerTimer = document.getElementById('header-timer');
        this.headerTimerProgress = document.getElementById('header-timer-progress');

        // Set total levels
        document.getElementById('totalLevels').textContent = CODING_LEVELS.length;
    },
    loadLevel(level, levelIdx) {
        // Update UI
        document.getElementById('levelSubtitle').textContent = `Level ${level.id} // ${level.title}`;
        document.getElementById('levelTitle').textContent = level.title;
        document.getElementById('levelDesc').textContent = level.description;
        document.getElementById('conceptTag').textContent = `⚡ ${level.concept}`;
        document.getElementById('currentLevel').textContent = levelIdx + 1;

        // Set editor content
        this.codeEditor.value = level.starterCode;
        this.updateEditor();

        // Clear console
        this.clearConsole();

        // Hide modals
        this.levelModal.classList.remove('active');
    },

    updateEditor() {
        const code = this.codeEditor.value;

        // Update line numbers
        const lines = code.split('\n').length;
        this.lineNumbers.innerHTML = Array.from({ length: Math.max(lines, 1) }, (_, i) => i + 1).join('<br>');

        // Syntax highlighting
        let highlighted = code
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\b(if|else|for|while|let|var|const|function|return)\b/g, '<span class="code-keyword">$1</span>')
            .replace(/\b(robot)\b/g, '<span class="code-function">$1</span>')
            .replace(/\b(moveRight|moveLeft|moveUp|moveDown|canMoveRight|canMoveLeft|canMoveUp|canMoveDown)\b/g, '<span class="code-method">$1</span>')
            .replace(/(\/\/.*)/g, '<span class="code-comment">$1</span>');

        this.codeHighlight.innerHTML = highlighted + '<br><br>';
    },

    syncScroll() {
        this.codeHighlight.scrollTop = this.codeEditor.scrollTop;
        this.lineNumbers.scrollTop = this.codeEditor.scrollTop;
    },

    handleTab(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.codeEditor.selectionStart;
            const end = this.codeEditor.selectionEnd;
            this.codeEditor.value = this.codeEditor.value.substring(0, start) + '  ' + this.codeEditor.value.substring(end);
            this.codeEditor.selectionStart = this.codeEditor.selectionEnd = start + 2;
            this.updateEditor();
        }
    },

    log(msg, type = 'info') {
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });
        const line = document.createElement('div');
        line.className = 'console-line';

        let msgClass = 'console-msg';
        if (type === 'error') msgClass = 'console-error';
        if (type === 'warn') msgClass = 'console-warn';

        line.innerHTML = `
            <span class="console-time">[${time}]</span>
            <span class="${msgClass}">${this.escapeHtml(msg)}</span>
        `;
        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    clearConsole() {
        this.consoleOutput.innerHTML = '';
    },

    showHint(hint) {
        this.log('💡 HINT: ' + hint, 'warn');
    },

    buildGrid(level, gameState) {
        this.gameGrid.innerHTML = '';
        this.gameGrid.style.gridTemplateColumns = `repeat(${level.gridSize}, 1fr)`;

        for (let y = 0; y < level.gridSize; y++) {
            for (let x = 0; x < level.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                const type = level.grid[y][x];

                if (type === 'WALL') cell.classList.add('cell-wall');
                else if (type === 'START') cell.classList.add('cell-start');
                else if (type === 'GOAL') cell.classList.add('cell-goal');
                else cell.classList.add('cell-empty');

                this.gameGrid.appendChild(cell);
            }
        }

        this.updateRobotPosition(gameState);
    },

    updateRobotPosition(gameState) {
        const cellSize = 64;
        this.robot.style.left = (12 + gameState.robotPos.x * cellSize) + 'px';
        this.robot.style.top = (12 + gameState.robotPos.y * cellSize) + 'px';
        this.robot.className = 'robot ' + gameState.robotDir.toLowerCase();
    },

    updateXP(xp) {
        if (this.xpValue) {
            this.xpValue.textContent = xp;
        }
    },

    // ===== TIMER METHODS =====
    updateTimer(sessionTime, sessionDuration) {
        if (!this.headerTimer || !this.headerTimerProgress) return;
        
        const mins = Math.floor(sessionTime / 60);
        const secs = sessionTime % 60;
        this.headerTimer.textContent = `${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`;
        
        const progress = (sessionTime / sessionDuration) * 100;
        this.headerTimerProgress.style.width = Math.min(progress, 100) + '%';
    },

    resetTimer() {
        if (this.headerTimer) {
            this.headerTimer.textContent = '00:00';
        }
        if (this.headerTimerProgress) {
            this.headerTimerProgress.style.width = '0%';
        }
    },

    showLevelComplete(xpReward) {
        document.getElementById('completionMessage').textContent = `Excellent coding! +${xpReward} XP earned.`;
        this.levelModal.classList.add('active');
    },

    showVictory() {
        this.victoryModal.classList.add('active');
    },

    showAchievement(title, desc) {
        // Optional achievement popup
        console.log(`Achievement: ${title} - ${desc}`);
    },

    setRunningState(isRunning) {
        if (isRunning) {
            this.runBtn.classList.add('running');
            this.runBtn.innerHTML = '<span class="spin">↻</span> STOP';
        } else {
            this.runBtn.classList.remove('running');
            this.runBtn.innerHTML = '<span>▶</span> RUN CODE';
        }
        this.codeEditor.disabled = isRunning;
    }
};
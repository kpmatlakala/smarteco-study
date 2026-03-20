// ==========================================
// GAME MAIN - Core Logic & State
// ==========================================

const Game = {
    // Game State
    currentLevelIdx: 0,
    robotPos: { x: 0, y: 0 },
    robotDir: 'RIGHT',
    isRunning: false,
    executionAbort: false,
    totalXP: 0,

    // Session tracking
    sessionInterval: null,
    sessionTime: 0,
    sessionDuration: 1500, // 25 minutes

    // DOM Elements
    introScreen: null,
    gameContainer: null,

    init() {
        // Initialize UI
        UI.init();

        // Cache additional DOM elements
        this.introScreen = document.getElementById('introScreen');
        this.gameContainer = document.getElementById('gameContainer');

        // Load XP from shared state
        if (window.SmartEco) {
            this.totalXP = SmartEco.state.xp;
            UI.updateXP(this.totalXP);

            // Start session if not already active
            if (!SmartEco.state.sessionActive) {
                SmartEco.startSession();
            }

            // Listen for session updates
            SmartEco.addListener((event, data, state) => {
                if (event === 'sessionTime') {
                    UI.updateTimer(state.sessionTime, state.sessionDuration);
                }
            });
        }

        // Start timer update interval
        this.startTimerUpdates();

        this.createParticles();
        this.loadLevel(0);

        // Editor events
        UI.codeEditor.addEventListener('input', () => UI.updateEditor());
        UI.codeEditor.addEventListener('scroll', () => UI.syncScroll());
        UI.codeEditor.addEventListener('keydown', (e) => UI.handleTab(e));
    },

    startTimerUpdates() {
        // Update timer every second
        setInterval(() => {
            if (window.SmartEco && SmartEco.state.sessionActive && !SmartEco.state.sessionPaused) {
                const newTime = SmartEco.state.sessionTime + 1;
                SmartEco.updateSessionTime(newTime);
            }
        }, 1000);
    },

    createParticles() {
        const container = document.getElementById('particles');
        for (let i = 0; i < 5; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.width = Math.random() * 300 + 100 + 'px';
            p.style.height = p.style.width;
            p.style.left = Math.random() * 100 + '%';
            p.style.top = Math.random() * 100 + '%';
            p.style.animationDelay = Math.random() * 4 + 's';
            p.style.animationDuration = Math.random() * 4 + 4 + 's';
            container.appendChild(p);
        }
    },

    startGame() {
        this.introScreen.classList.add('hidden');
        this.gameContainer.classList.add('active');
    },

    resetLevel() {
        this.loadLevel(this.currentLevelIdx);
    },

    loadLevel(idx) {
        this.currentLevelIdx = idx;
        const level = CODING_LEVELS[idx];

        // Reset robot position
        this.robotPos = { ...level.startPos };
        this.robotDir = 'RIGHT';

        // Update UI
        UI.loadLevel(level, idx);
        UI.buildGrid(level, this);
        UI.updateRobotPosition(this);
    },

    canMove(dir) {
        const level = CODING_LEVELS[this.currentLevelIdx];
        let nextX = this.robotPos.x;
        let nextY = this.robotPos.y;

        if (dir === 'RIGHT') nextX++;
        else if (dir === 'LEFT') nextX--;
        else if (dir === 'UP') nextY--;
        else if (dir === 'DOWN') nextY++;

        if (nextX < 0 || nextX >= level.gridSize || nextY < 0 || nextY >= level.gridSize) {
            return false;
        }
        return level.grid[nextY][nextX] !== 'WALL';
    },

    async moveRobot(dir) {
        this.robotDir = dir;
        UI.updateRobotPosition(this);

        await this.sleep(100);

        if (!this.canMove(dir)) {
            throw new Error(`Cannot move ${dir} - obstacle detected`);
        }

        if (dir === 'RIGHT') this.robotPos.x++;
        else if (dir === 'LEFT') this.robotPos.x--;
        else if (dir === 'UP') this.robotPos.y--;
        else if (dir === 'DOWN') this.robotPos.y++;

        UI.updateRobotPosition(this);
        UI.log(`Moved ${dir} → [${this.robotPos.x}, ${this.robotPos.y}]`);
        await this.sleep(300);
    },

    async runCode() {
        if (this.isRunning) {
            this.executionAbort = true;
            return;
        }

        this.isRunning = true;
        this.executionAbort = false;
        UI.setRunningState(true);

        const level = CODING_LEVELS[this.currentLevelIdx];
        this.robotPos = { ...level.startPos };
        this.robotDir = 'RIGHT';
        UI.updateRobotPosition(this);
        UI.clearConsole();

        await this.sleep(500);

        try {
            const code = UI.codeEditor.value;
            const cleanCode = code.replace(/\/\/.*/g, '');
            const tokens = Engine.tokenize(cleanCode);
            UI.log(`Parsing ${tokens.length} tokens...`);

            const ast = Engine.parse(tokens);
            UI.log(`Executing ${ast.length} statements...`);

            await this.executeStatements(ast);

            if (!this.executionAbort) {
                if (this.robotPos.x === level.endPos.x && this.robotPos.y === level.endPos.y) {
                    UI.log('✅ TARGET REACHED! Level complete!');
                    await this.sleep(500);

                    // Award XP
                    this.addXP(level.xpReward);
                    
                    // FIXED: Call completeLesson on SmartEco
                    if (window.SmartEco) {
                        SmartEco.completeLesson(`coding_${level.id}`);
                    }

                    UI.showLevelComplete(level.xpReward);
                } else {
                    UI.log('⚠️ Execution finished. Target not reached.', 'warn');
                }
            }
        } catch (err) {
            UI.log('❌ ERROR: ' + err.message, 'error');
        } finally {
            this.isRunning = false;
            UI.setRunningState(false);
            UI.codeEditor.focus();
        }
    },

    async executeStatements(statements) {
        for (const stmt of statements) {
            if (this.executionAbort) break;
            await this.executeNode(stmt);
        }
    },

    async executeNode(node) {
        if (this.executionAbort) return;

        switch (node.type) {
            case 'expression':
                await this.executeExpression(node.code);
                break;
            case 'for':
                await this.executeForLoop(node);
                break;
            case 'if':
                await this.executeIfStatement(node);
                break;
            default:
                throw new Error(`Unknown node type: ${node.type}`);
        }
    },

    async executeForLoop(node) {
        const initMatch = node.init.match(/(?:let|var|const)(\w+)=(\d+)/);
        if (!initMatch) {
            throw new Error(`Invalid loop initialization: "${node.init}"`);
        }

        let value = parseInt(initMatch[2]);

        const condMatch = node.condition.match(/(\w+)([<>=!]+)(\d+)/);
        if (!condMatch) {
            throw new Error(`Invalid loop condition: "${node.condition}"`);
        }

        const operator = condMatch[2];
        const limit = parseInt(condMatch[3]);
        const maxIterations = 100;
        let iterations = 0;

        while (Engine.checkCondition(value, operator, limit)) {
            if (this.executionAbort) break;
            if (iterations++ > maxIterations) {
                throw new Error('Loop exceeded maximum iterations (100)');
            }

            await this.executeStatements(node.body);

            if (node.increment.includes('++')) {
                value++;
            } else if (node.increment.includes('--')) {
                value--;
            } else {
                value++;
            }
        }
    },

    async executeIfStatement(node) {
        const result = await Engine.evaluateCondition(node.condition, this);

        if (result) {
            await this.executeStatements(node.trueBranch);
        } else if (node.falseBranch) {
            await this.executeStatements(node.falseBranch);
        }
    },

    async executeExpression(code) {
        const moveMatch = code.match(/robot\.move(Right|Left|Up|Down)\(\)/);
        if (moveMatch) {
            const dir = moveMatch[1].toUpperCase();
            await this.moveRobot(dir);
            return;
        }

        const varMatch = code.match(/(?:let|var|const)(\w+)=/);
        if (varMatch) {
            UI.log(`Variable declared: ${varMatch[1]}`);
            return;
        }

        if (!code.trim()) return;
        throw new Error(`Unknown command: "${code}"`);
    },

    addXP(amount) {
        this.totalXP += amount;
        UI.updateXP(this.totalXP);

        if (window.SmartEco) {
            SmartEco.addXP(amount);
        }
    },

    nextLevel() {
        if (this.currentLevelIdx < CODING_LEVELS.length - 1) {
            this.loadLevel(this.currentLevelIdx + 1);
        } else {
            UI.showVictory();
            this.addXP(200); // Bonus XP
        }
    },

    showHint() {
        const hint = CODING_LEVELS[this.currentLevelIdx].hint;
        UI.showHint(hint);
    },

    clearConsole() {
        UI.clearConsole();
    },

    returnToDashboard() {
        window.location.href = '../dashboard.html';
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => Game.init());

// Make Game globally accessible for onclick handlers
window.Game = Game;
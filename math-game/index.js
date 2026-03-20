class AutomaticMathChess {
    constructor() {
        // Game state
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentTurn = 'player';
        this.playerColor = 'white';
        this.aiColor = 'black';
        this.gameOver = false;
        
        // Math problem state
        this.currentProblem = null;
        this.selectedPieceType = null;
        this.selectedPiecePosition = null;
        this.bestMove = null;
        
        // Stats
        this.score = 0;
        this.streak = 0;
        this.moves = 0;
        this.captures = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        this.moveHistory = [];
        
        // Grade 8-10 math problems
        this.mathProblems = this.generateGradeSchoolProblems();
        
        // DOM elements
        this.cacheDOM();
        
        // Initialize
        this.init();
    }
    
    cacheDOM() {
        this.chessBoard = document.getElementById('chessBoard');
        this.turnIndicator = document.getElementById('turnIndicator');
        this.capturedPieces = document.getElementById('capturedPieces');
        this.pieceIcon = document.getElementById('selectedPieceIcon');
        this.pieceName = document.getElementById('selectedPieceName');
        this.pieceDesc = document.getElementById('selectedPieceDesc');
        this.problemQuestion = document.getElementById('problemQuestion');
        this.problemTopic = document.getElementById('problemTopic');
        this.difficultyBadge = document.getElementById('difficultyBadge');
        this.answerInput = document.getElementById('answerInput');
        this.submitBtn = document.getElementById('submitBtn');
        this.feedbackMessage = document.getElementById('feedbackMessage');
        this.scoreDisplay = document.getElementById('scoreDisplay');
        this.streakDisplay = document.getElementById('streakDisplay');
        this.movesDisplay = document.getElementById('movesDisplay');
        this.capturesDisplay = document.getElementById('capturesDisplay');
        this.moveHistory = document.getElementById('moveHistory');
        this.hintBtn = document.getElementById('hintBtn');
        this.formulaBtn = document.getElementById('formulaBtn');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.surrenderBtn = document.getElementById('surrenderBtn');
        this.formulaModal = document.getElementById('formulaModal');
        this.modalContent = document.getElementById('modalContent');
    }
    
    initializeBoard() {
        return [
            ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
            ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['', '', '', '', '', '', '', ''],
            ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
            ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
        ];
    }
    
    generateGradeSchoolProblems() {
        return {
            algebra: [
                { question: "Solve for x: 2x + 5 = 13", answer: 4, topic: "Linear Equations", grade: 8 },
                { question: "Solve: 3(x - 4) = 15", answer: 9, topic: "Linear Equations", grade: 8 },
                { question: "Find x: 4x - 7 = 2x + 9", answer: 8, topic: "Equations", grade: 9 },
                { question: "If 5x + 2 = 3x + 12, what is x?", answer: 5, topic: "Equations", grade: 9 },
                { question: "Solve: 2x + 3 = 15", answer: 6, topic: "Linear Equations", grade: 8 },
                { question: "Find x: 7x - 4 = 3x + 8", answer: 3, topic: "Equations", grade: 9 }
            ],
            
            fractions: [
                { question: "Simplify: 3/4 + 1/2 = ? (as decimal)", answer: 1.25, topic: "Fractions", grade: 8 },
                { question: "Convert 3/5 to decimal", answer: 0.6, topic: "Decimals", grade: 8 },
                { question: "What is 25% of 80?", answer: 20, topic: "Percentages", grade: 8 },
                { question: "Simplify: 2/3 × 3/4 = ? (as decimal)", answer: 0.5, topic: "Multiplication", grade: 9 },
                { question: "Convert 7/8 to decimal", answer: 0.875, topic: "Decimals", grade: 8 },
                { question: "What is 15% of 60?", answer: 9, topic: "Percentages", grade: 8 }
            ],
            
            geometry: [
                { question: "Area of rectangle: length 8cm, width 5cm?", answer: 40, topic: "Area", grade: 8 },
                { question: "Perimeter of square with side 6cm?", answer: 24, topic: "Perimeter", grade: 8 },
                { question: "Volume of cube with side 3cm?", answer: 27, topic: "Volume", grade: 9 },
                { question: "Area of triangle: base 10cm, height 6cm?", answer: 30, topic: "Triangle Area", grade: 9 },
                { question: "Area of square with side 7cm?", answer: 49, topic: "Area", grade: 8 },
                { question: "Perimeter of rectangle: length 9cm, width 4cm?", answer: 26, topic: "Perimeter", grade: 8 }
            ],
            
            integers: [
                { question: "Calculate: (-5) + 8 - 3", answer: 0, topic: "Integers", grade: 8 },
                { question: "Solve: 4 × (-3) + 6", answer: -6, topic: "Integers", grade: 8 },
                { question: "Evaluate: 12 ÷ 3 × 2", answer: 8, topic: "Order of Operations", grade: 8 },
                { question: "Calculate: (8 - 3) × 4", answer: 20, topic: "Order of Operations", grade: 8 },
                { question: "Find: (-7) + 12 - 5", answer: 0, topic: "Integers", grade: 8 },
                { question: "Solve: 6 × (-2) + 8", answer: -4, topic: "Integers", grade: 8 }
            ],
            
            exponents: [
                { question: "Calculate: 2³", answer: 8, topic: "Exponents", grade: 9 },
                { question: "√81 = ?", answer: 9, topic: "Square Roots", grade: 9 },
                { question: "Calculate: 3² + 4²", answer: 25, topic: "Pythagoras", grade: 10 },
                { question: "√144 = ?", answer: 12, topic: "Square Roots", grade: 9 },
                { question: "Calculate: 5²", answer: 25, topic: "Exponents", grade: 9 },
                { question: "√49 = ?", answer: 7, topic: "Square Roots", grade: 9 }
            ]
        };
    }
    
    init() {
        this.renderBoard();
        this.bindEvents();
        this.updateTurn();
        this.updateStats();
        this.startPlayerTurn();
    }
    
    bindEvents() {
        this.submitBtn.addEventListener('click', () => this.checkAnswer());
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.checkAnswer();
        });
        
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.formulaBtn.addEventListener('click', () => this.showFormula());
        this.newGameBtn.addEventListener('click', () => this.resetGame());
        this.surrenderBtn.addEventListener('click', () => this.surrender());
        
        const closeBtn = document.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.formulaModal.style.display = 'none';
            });
        }
        
        window.addEventListener('click', (e) => {
            if (e.target === this.formulaModal) {
                this.formulaModal.style.display = 'none';
            }
        });
    }
    
    renderBoard() {
        this.chessBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `board-square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = piece;
                }
                
                // Don't add click handlers for player - game is automatic!
                // But we'll keep for debugging
                square.addEventListener('click', () => {
                    if (!this.gameOver) {
                        console.log(`Square clicked: ${row},${col} - ${piece || 'empty'}`);
                    }
                });
                
                // Show best move highlight if available
                if (this.bestMove && this.bestMove.row === row && this.bestMove.col === col) {
                    square.classList.add('valid-move');
                }
                
                this.chessBoard.appendChild(square);
            }
        }
    }
    
    startPlayerTurn() {
        if (this.gameOver) return;
        
        this.currentTurn = 'player';
        this.updateTurn();
        
        // Automatically select a random piece and find its best move
        this.selectRandomPieceAndFindBestMove();
    }
    
    selectRandomPieceAndFindBestMove() {
        // Find all player pieces with valid moves
        const playerPieces = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && this.isPlayerPiece(piece)) {
                    const moves = this.calculateValidMoves(row, col, piece);
                    if (moves.length > 0) {
                        // Find the best move for this piece
                        const bestMoveForPiece = this.findBestMoveForPiece(row, col, piece, moves);
                        if (bestMoveForPiece) {
                            playerPieces.push({
                                row, col, piece,
                                bestMove: bestMoveForPiece,
                                score: bestMoveForPiece.score
                            });
                        }
                    }
                }
            }
        }
        
        if (playerPieces.length > 0) {
            // Sort by score and pick the best overall move
            playerPieces.sort((a, b) => b.score - a.score);
            const bestOverall = playerPieces[0];
            
            this.selectedPiece = bestOverall.piece;
            this.selectedPiecePosition = { row: bestOverall.row, col: bestOverall.col };
            this.selectedPieceType = this.getPieceType(bestOverall.piece);
            this.bestMove = bestOverall.bestMove;
            
            // Update UI to show selected piece and best move
            this.updatePieceInfo(bestOverall.piece);
            this.generateMathProblem();
            this.renderBoard();
            
            // Highlight the best move on board
            this.showFeedback(
                `🎯 Best move found: ${this.selectedPiece} to ${String.fromCharCode(97 + this.bestMove.col)}${8 - this.bestMove.row}\nSolve the math problem to make this move automatically!`,
                'info'
            );
        } else {
            // No moves available - game over?
            this.gameOver = true;
            this.showFeedback("No moves available! Game over!", 'wrong');
        }
    }
    
    findBestMoveForPiece(row, col, piece, moves) {
        let bestScore = -Infinity;
        let bestMove = null;
        
        const pieceValues = { '♙': 1, '♟': 1, '♘': 3, '♞': 3, '♗': 3, '♝': 3, '♖': 5, '♜': 5, '♕': 9, '♛': 9 };
        
        for (let move of moves) {
            let score = 0;
            
            // Capture bonus
            if (this.board[move.row][move.col]) {
                const capturedPiece = this.board[move.row][move.col];
                score += pieceValues[capturedPiece] || 0;
            }
            
            // Center control bonus
            const centerDist = Math.abs(move.row - 3.5) + Math.abs(move.col - 3.5);
            score += (7 - centerDist) * 0.5;
            
            // Development bonus (early game)
            if (move.row === 2 || move.row === 5) score += 1;
            
            // King safety (don't move into danger - simplified)
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const r = move.row + dr;
                    const c = move.col + dc;
                    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        if (this.board[r][c] && !this.isPlayerPiece(this.board[r][c])) {
                            score -= 0.5; // Adjacent to enemy piece
                        }
                    }
                }
            }
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = { row: move.row, col: move.col, score: bestScore };
            }
        }
        
        return bestMove;
    }
    
    isPlayerPiece(piece) {
        return this.playerColor === 'white' ? 
            '♙♖♘♗♕♔'.includes(piece) : 
            '♟♜♞♝♛♚'.includes(piece);
    }
    
    getPieceType(piece) {
        const typeMap = {
            '♙': 'pawn', '♟': 'pawn',
            '♘': 'knight', '♞': 'knight',
            '♗': 'bishop', '♝': 'bishop',
            '♖': 'rook', '♜': 'rook',
            '♕': 'queen', '♛': 'queen',
            '♔': 'king', '♚': 'king'
        };
        return typeMap[piece] || 'pawn';
    }
    
    updatePieceInfo(piece) {
        const type = this.getPieceType(piece);
        this.pieceIcon.textContent = piece;
        this.pieceName.textContent = type.charAt(0).toUpperCase() + type.slice(1);
        
        const topics = ['Algebra', 'Fractions', 'Geometry', 'Integers', 'Exponents'];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        
        this.pieceDesc.textContent = `Grade 8-10 ${randomTopic}`;
    }
    
    generateMathProblem() {
        // Randomly select a topic
        const topics = ['algebra', 'fractions', 'geometry', 'integers', 'exponents'];
        const randomTopic = topics[Math.floor(Math.random() * topics.length)];
        const problems = this.mathProblems[randomTopic];
        
        if (problems && problems.length > 0) {
            const randomIndex = Math.floor(Math.random() * problems.length);
            this.currentProblem = problems[randomIndex];
            
            this.problemQuestion.textContent = this.currentProblem.question;
            this.problemTopic.textContent = this.currentProblem.topic;
            
            const gradeNames = {8: 'Grade 8', 9: 'Grade 9', 10: 'Grade 10'};
            this.difficultyBadge.textContent = gradeNames[this.currentProblem.grade] || 'Grade 8-10';
            
            const colors = {8: '#4CAF50', 9: '#FF9800', 10: '#f44336'};
            this.difficultyBadge.style.background = colors[this.currentProblem.grade] || '#4CAF50';
        }
        
        this.answerInput.value = '';
        this.answerInput.focus();
    }
    
    calculateValidMoves(row, col, piece) {
        const moves = [];
        const pieceType = this.getPieceType(piece);
        const isWhite = '♙♖♘♗♕♔'.includes(piece);
        
        switch(pieceType) {
            case 'pawn':
                if (isWhite) {
                    if (row > 0 && !this.board[row - 1][col]) {
                        moves.push({ row: row - 1, col });
                        if (row === 6 && !this.board[5][col] && !this.board[4][col]) {
                            moves.push({ row: 4, col });
                        }
                    }
                    if (row > 0 && col > 0 && this.board[row - 1][col - 1] && !this.isPlayerPiece(this.board[row - 1][col - 1])) {
                        moves.push({ row: row - 1, col: col - 1 });
                    }
                    if (row > 0 && col < 7 && this.board[row - 1][col + 1] && !this.isPlayerPiece(this.board[row - 1][col + 1])) {
                        moves.push({ row: row - 1, col: col + 1 });
                    }
                }
                break;
                
            case 'knight':
                const knightMoves = [
                    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
                    [1, -2], [1, 2], [2, -1], [2, 1]
                ];
                for (let [dr, dc] of knightMoves) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        if (!this.board[newRow][newCol] || !this.isPlayerPiece(this.board[newRow][newCol])) {
                            moves.push({ row: newRow, col: newCol });
                        }
                    }
                }
                break;
                
            case 'bishop':
                const bishopDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
                for (let [dr, dc] of bishopDirs) {
                    let newRow = row + dr;
                    let newCol = col + dc;
                    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        if (!this.board[newRow][newCol]) {
                            moves.push({ row: newRow, col: newCol });
                        } else {
                            if (!this.isPlayerPiece(this.board[newRow][newCol])) {
                                moves.push({ row: newRow, col: newCol });
                            }
                            break;
                        }
                        newRow += dr;
                        newCol += dc;
                    }
                }
                break;
                
            case 'rook':
                const rookDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (let [dr, dc] of rookDirs) {
                    let newRow = row + dr;
                    let newCol = col + dc;
                    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        if (!this.board[newRow][newCol]) {
                            moves.push({ row: newRow, col: newCol });
                        } else {
                            if (!this.isPlayerPiece(this.board[newRow][newCol])) {
                                moves.push({ row: newRow, col: newCol });
                            }
                            break;
                        }
                        newRow += dr;
                        newCol += dc;
                    }
                }
                break;
                
            case 'queen':
                const queenDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]];
                for (let [dr, dc] of queenDirs) {
                    let newRow = row + dr;
                    let newCol = col + dc;
                    while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                        if (!this.board[newRow][newCol]) {
                            moves.push({ row: newRow, col: newCol });
                        } else {
                            if (!this.isPlayerPiece(this.board[newRow][newCol])) {
                                moves.push({ row: newRow, col: newCol });
                            }
                            break;
                        }
                        newRow += dr;
                        newCol += dc;
                    }
                }
                break;
                
            case 'king':
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                            if (!this.board[newRow][newCol] || !this.isPlayerPiece(this.board[newRow][newCol])) {
                                moves.push({ row: newRow, col: newCol });
                            }
                        }
                    }
                }
                break;
        }
        
        return moves;
    }
    
    checkAnswer() {
        if (!this.currentProblem || !this.bestMove) {
            this.showFeedback('📚 Wait for your turn!', 'info');
            return;
        }
        
        const userAnswer = parseFloat(this.answerInput.value);
        
        if (isNaN(userAnswer)) {
            this.showFeedback('🔢 Please enter a number!', 'wrong');
            return;
        }
        
        // Allow small tolerance for decimal answers
        let isCorrect = false;
        if (Number.isInteger(this.currentProblem.answer)) {
            isCorrect = Math.round(userAnswer) === this.currentProblem.answer;
        } else {
            isCorrect = Math.abs(userAnswer - this.currentProblem.answer) < 0.01;
        }
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
    }
    
    handleCorrectAnswer() {
        // Execute the best move automatically
        const from = this.selectedPiecePosition;
        const to = this.bestMove;
        
        // Check if capture
        const isCapture = this.board[to.row][to.col] ? true : false;
        if (isCapture) {
            this.captures++;
            this.addToHistory(`Captured ${this.board[to.row][to.col]} with ${this.selectedPiece}`, 'capture');
            this.updateCapturedPieces(this.board[to.row][to.col]);
        }
        
        // Move piece
        this.board[to.row][to.col] = this.selectedPiece;
        this.board[from.row][from.col] = '';
        
        // Update stats
        const gradeBonus = this.currentProblem.grade * 2;
        this.score += 10 + gradeBonus;
        this.streak++;
        this.moves++;
        this.correctAnswers++;
        
        // Add to history
        const fromCol = String.fromCharCode(97 + from.col);
        const fromRow = 8 - from.row;
        const toCol = String.fromCharCode(97 + to.col);
        const toRow = 8 - to.row;
        
        this.addToHistory(
            `✓ Correct! Auto-move: ${this.selectedPiece} ${fromCol}${fromRow} → ${toCol}${toRow} | +${10 + gradeBonus} pts`
        );
        
        this.showFeedback(
            `✓ Correct! +${10 + gradeBonus} points! Piece moved automatically!`,
            'correct'
        );
        
        // Check for checkmate
        this.checkForCheckmate();
        
        if (!this.gameOver) {
            // Switch turn to AI
            this.currentTurn = 'ai';
            this.updateTurn();
            
            // Clear selection
            this.selectedPiece = null;
            this.selectedPiecePosition = null;
            this.bestMove = null;
            
            this.renderBoard();
            this.updateStats();
            
            // AI move after delay
            setTimeout(() => this.makeAIMove(), 1000);
        }
    }
    
    handleWrongAnswer() {
        this.wrongAnswers++;
        
        // WRONG ANSWER = GAME OVER! ❌
        this.gameOver = true;
        
        const correctAnswer = this.currentProblem.answer;
        
        this.addToHistory(
            `❌ WRONG! Game Over! Correct answer was ${correctAnswer}`,
            'wrong'
        );
        
        this.showFeedback(
            `❌ GAME OVER! Correct answer: ${correctAnswer}\nYou answered: ${this.answerInput.value}`,
            'wrong'
        );
        
        // Update final stats
        this.updateStats();
        
        // Disable board
        this.renderBoard();
        
        // Show final score
        setTimeout(() => {
            alert(`🏁 GAME OVER!\n\nFinal Score: ${this.score}\nCorrect Answers: ${this.correctAnswers}\nWrong Answers: ${this.wrongAnswers}\n\nPress New Game to try again!`);
        }, 500);
    }
    
    makeAIMove() {
        if (this.gameOver || this.currentTurn !== 'ai') return;
        
        // Find all black pieces with valid moves
        const blackPieces = [];
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && '♟♜♞♝♛♚'.includes(piece)) {
                    const moves = this.calculateValidMoves(row, col, piece);
                    if (moves.length > 0) {
                        // AI picks a random move (but could be improved)
                        const randomMove = moves[Math.floor(Math.random() * moves.length)];
                        blackPieces.push({ 
                            row, col, piece, 
                            move: randomMove
                        });
                    }
                }
            }
        }
        
        if (blackPieces.length > 0) {
            // AI picks a random piece to move
            const randomPiece = blackPieces[Math.floor(Math.random() * blackPieces.length)];
            
            const from = { row: randomPiece.row, col: randomPiece.col };
            const to = randomPiece.move;
            
            const isCapture = this.board[to.row][to.col] ? true : false;
            if (isCapture) {
                this.addToHistory(`AI captures ${this.board[to.row][to.col]}`, 'capture');
            }
            
            this.board[to.row][to.col] = randomPiece.piece;
            this.board[from.row][from.col] = '';
            
            const fromCol = String.fromCharCode(97 + from.col);
            const fromRow = 8 - from.row;
            const toCol = String.fromCharCode(97 + to.col);
            const toRow = 8 - to.row;
            
            this.addToHistory(
                `AI moves: ${randomPiece.piece} ${fromCol}${fromRow} → ${toCol}${toRow}`
            );
            
            // Check for checkmate after AI move
            this.checkForCheckmate();
            
            if (!this.gameOver) {
                // Start player's turn again
                this.currentTurn = 'player';
                this.updateTurn();
                this.renderBoard();
                
                // Automatically select next best move for player
                setTimeout(() => this.startPlayerTurn(), 500);
            }
        } else {
            // AI has no moves - player wins!
            this.gameOver = true;
            this.showFeedback("🏆 AI has no moves! You win!", 'correct');
        }
    }
    
    updateTurn() {
        if (this.turnIndicator) {
            this.turnIndicator.textContent = this.currentTurn === 'player' ? 'Your Turn - Solve Math!' : 'AI Thinking...';
            this.turnIndicator.className = `turn-indicator ${this.currentTurn === 'player' ? 'player-turn' : 'ai-turn'}`;
        }
    }
    
    updateCapturedPieces(piece) {
        if (this.capturedPieces) {
            const capturedSpan = document.createElement('span');
            capturedSpan.textContent = piece;
            this.capturedPieces.appendChild(capturedSpan);
        }
    }
    
    addToHistory(text, type = 'normal') {
        if (this.moveHistory) {
            const li = document.createElement('li');
            li.textContent = text;
            if (type === 'capture') li.classList.add('capture');
            if (type === 'wrong') li.style.borderLeftColor = '#f44336';
            this.moveHistory.insertBefore(li, this.moveHistory.firstChild);
            
            while (this.moveHistory.children.length > 10) {
                this.moveHistory.removeChild(this.moveHistory.lastChild);
            }
        }
    }
    
    updateStats() {
        if (this.scoreDisplay) this.scoreDisplay.textContent = this.score;
        if (this.streakDisplay) this.streakDisplay.textContent = this.streak;
        if (this.movesDisplay) this.movesDisplay.textContent = this.moves;
        if (this.capturesDisplay) this.capturesDisplay.textContent = this.captures;
    }
    
    showFeedback(message, type) {
        if (this.feedbackMessage) {
            this.feedbackMessage.textContent = message;
            this.feedbackMessage.className = `feedback-message ${type}`;
        }
    }
    
    showHint() {
        if (this.currentProblem) {
            let hint = "";
            if (this.currentProblem.topic === "Linear Equations") {
                hint = "Isolate x by doing the same operation to both sides";
            } else if (this.currentProblem.topic === "Fractions") {
                hint = "Convert to common denominator or use decimals";
            } else if (this.currentProblem.topic === "Area") {
                hint = "Area = length × width";
            } else if (this.currentProblem.topic === "Perimeter") {
                hint = "Add all sides";
            } else if (this.currentProblem.topic === "Integers") {
                hint = "Remember: negative × negative = positive";
            } else if (this.currentProblem.topic === "Exponents") {
                hint = "2³ = 2 × 2 × 2";
            } else {
                hint = "Show your working step by step!";
            }
            this.showFeedback(`💡 Hint: ${hint}`, 'info');
        } else {
            this.showFeedback('📚 Wait for your turn!', 'info');
        }
    }
    
    showFormula() {
        if (this.currentProblem) {
            if (this.modalContent) {
                const formulas = {
                    "Linear Equations": "ax + b = c → x = (c - b)/a",
                    "Fractions": "a/b + c/d = (ad + bc)/bd",
                    "Area": "Rectangle: A = l × w\nTriangle: A = (b × h)/2\nSquare: A = s²",
                    "Perimeter": "Rectangle: P = 2(l + w)\nSquare: P = 4s",
                    "Volume": "Cube: V = s³\nRectangular prism: V = l × w × h",
                    "Integers": "Same signs add, different signs subtract",
                    "Order of Operations": "Brackets → Exponents → × ÷ → + -",
                    "Exponents": "aⁿ = a × a × ... (n times)",
                    "Square Roots": "√a × √a = a",
                    "Pythagoras": "a² + b² = c²"
                };
                
                const formula = formulas[this.currentProblem.topic] || "Show your working step by step!";
                
                this.modalContent.innerHTML = `
                    <h4>${this.currentProblem.topic} - Grade ${this.currentProblem.grade}</h4>
                    <p style="font-size: 1.2em; margin: 20px 0; background: #e3f2fd; padding: 15px; border-radius: 8px;">
                        <strong>Formula:</strong><br>${formula}
                    </p>
                    <p><strong>Question:</strong> ${this.currentProblem.question}</p>
                `;
                this.formulaModal.style.display = 'block';
            }
        } else {
            this.showFeedback('📚 Wait for your turn!', 'info');
        }
    }
    
    checkForCheckmate() {
        const whiteKingExists = this.board.some(row => row.includes('♔'));
        const blackKingExists = this.board.some(row => row.includes('♚'));
        
        if (!whiteKingExists) {
            this.gameOver = true;
            this.showFeedback(
                `🏆 Checkmate! Black wins! Final score: ${this.score}`,
                'info'
            );
            setTimeout(() => {
                alert(`🏁 GAME OVER!\n\nBlack wins by checkmate!\nFinal Score: ${this.score}\nCorrect Answers: ${this.correctAnswers}`);
            }, 500);
        } else if (!blackKingExists) {
            this.gameOver = true;
            this.showFeedback(
                `🏆 Checkmate! You win! Final score: ${this.score}`,
                'info'
            );
            setTimeout(() => {
                alert(`🏆 CONGRATULATIONS!\n\nYou win by checkmate!\nFinal Score: ${this.score}\nCorrect Answers: ${this.correctAnswers}`);
            }, 500);
        }
    }
    
    resetGame() {
        this.board = this.initializeBoard();
        this.selectedPiece = null;
        this.validMoves = [];
        this.currentTurn = 'player';
        this.gameOver = false;
        this.currentProblem = null;
        this.selectedPieceType = null;
        this.selectedPiecePosition = null;
        this.bestMove = null;
        this.score = 0;
        this.streak = 0;
        this.moves = 0;
        this.captures = 0;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;
        
        if (this.moveHistory) this.moveHistory.innerHTML = '';
        if (this.capturedPieces) this.capturedPieces.innerHTML = '';
        
        this.renderBoard();
        this.updateTurn();
        this.updateStats();
        this.startPlayerTurn();
        
        this.showFeedback('📚 New game! Solve math problems to move automatically!', 'info');
    }
    
    surrender() {
        if (confirm('Are you sure you want to surrender?')) {
            this.gameOver = true;
            this.showFeedback('🏳️ You surrendered! Game over.', 'info');
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AutomaticMathChess();
});
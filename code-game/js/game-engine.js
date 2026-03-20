// ==========================================
// GAME ENGINE - Parser & Execution
// ==========================================

const Engine = {
    // Tokenizer - breaks code into meaningful tokens
    tokenize(code) {
        const tokens = [];
        let current = '';
        let inString = false;
        let stringChar = '';

        for (let i = 0; i < code.length; i++) {
            const char = code[i];

            if ((char === '"' || char === "'") && !inString) {
                if (current) tokens.push(current);
                current = char;
                inString = true;
                stringChar = char;
                continue;
            }

            if (char === stringChar && inString) {
                current += char;
                tokens.push(current);
                current = '';
                inString = false;
                continue;
            }

            if (inString) {
                current += char;
                continue;
            }

            if (/\s/.test(char)) {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                continue;
            }

            if (char === '{' || char === '}' || char === '(' || char === ')' ||
                char === ';' || char === ',' ||
                char === '+' || char === '-' || char === '*' || char === '/' ||
                char === '=' || char === '<' || char === '>' || char === '!') {

                const nextChar = code[i + 1] || '';
                const twoChar = char + nextChar;

                if (twoChar === '++' || twoChar === '--' || twoChar === '<=' ||
                    twoChar === '>=' || twoChar === '==' || twoChar === '!=' ||
                    twoChar === '===' || twoChar === '!==' || twoChar === '+=' ||
                    twoChar === '-=' || twoChar === '*=' || twoChar === '/=') {

                    if (current) tokens.push(current);
                    tokens.push(twoChar);
                    current = '';
                    i++;
                    continue;
                }

                if (current) tokens.push(current);
                tokens.push(char);
                current = '';
                continue;
            }

            if (char === '.') {
                if (current) tokens.push(current);
                tokens.push('.');
                current = '';
                continue;
            }

            current += char;
        }

        if (current) tokens.push(current);
        return tokens.filter(t => t !== '');
    },

    // Parser - builds AST from tokens
    parse(tokens) {
        const statements = [];
        let i = 0;

        while (i < tokens.length) {
            const token = tokens[i];

            if (token === ';') {
                i++;
                continue;
            }

            if (token === 'for' && tokens[i + 1] === '(') {
                const loop = this.parseForLoop(tokens, i);
                statements.push(loop.node);
                i = loop.nextIndex;
                continue;
            }

            if (token === 'if' && tokens[i + 1] === '(') {
                const conditional = this.parseIfStatement(tokens, i);
                statements.push(conditional.node);
                i = conditional.nextIndex;
                continue;
            }

            if (token === 'robot' || token === 'let' || token === 'var' || token === 'const') {
                let stmt = '';
                while (i < tokens.length && tokens[i] !== ';' && tokens[i] !== '}') {
                    stmt += tokens[i];
                    i++;
                }
                statements.push({ type: 'expression', code: stmt });
                if (tokens[i] === ';') i++;
                continue;
            }

            if (token !== '{' && token !== '}') {
                let stmt = token;
                i++;
                while (i < tokens.length && tokens[i] !== ';' && tokens[i] !== '}') {
                    stmt += tokens[i];
                    i++;
                }
                statements.push({ type: 'expression', code: stmt });
                if (tokens[i] === ';') i++;
                continue;
            }

            i++;
        }

        return statements;
    },

    parseForLoop(tokens, startIdx) {
        let i = startIdx;
        i += 2;

        let init = '';
        while (i < tokens.length && tokens[i] !== ';') {
            init += tokens[i];
            i++;
        }
        i++;

        let condition = '';
        while (i < tokens.length && tokens[i] !== ';') {
            condition += tokens[i];
            i++;
        }
        i++;

        let increment = '';
        while (i < tokens.length && tokens[i] !== ')') {
            increment += tokens[i];
            i++;
        }
        i++;

        let body = [];
        if (tokens[i] === '{') {
            i++;
            const bodyTokens = [];
            let braceCount = 1;
            while (i < tokens.length && braceCount > 0) {
                if (tokens[i] === '{') braceCount++;
                else if (tokens[i] === '}') braceCount--;
                if (braceCount > 0) bodyTokens.push(tokens[i]);
                i++;
            }
            body = this.parse(bodyTokens);
        }

        return {
            node: {
                type: 'for',
                init: init,
                condition: condition,
                increment: increment,
                body
            },
            nextIndex: i
        };
    },

    parseIfStatement(tokens, startIdx) {
        let i = startIdx;
        i += 2;

        let condition = '';
        let parenCount = 1;

        while (i < tokens.length && parenCount > 0) {
            if (tokens[i] === '(') {
                parenCount++;
                condition += tokens[i];
            } else if (tokens[i] === ')') {
                parenCount--;
                if (parenCount > 0) condition += tokens[i];
            } else {
                condition += tokens[i];
            }
            i++;
        }

        let trueBranch = [];
        if (tokens[i] === '{') {
            i++;
            const trueTokens = [];
            let braceCount = 1;
            while (i < tokens.length && braceCount > 0) {
                if (tokens[i] === '{') braceCount++;
                else if (tokens[i] === '}') braceCount--;
                if (braceCount > 0) trueTokens.push(tokens[i]);
                i++;
            }
            trueBranch = this.parse(trueTokens);
        }

        let falseBranch = null;
        if (i < tokens.length && tokens[i] === 'else') {
            i++;
            if (tokens[i] === '{') {
                i++;
                const falseTokens = [];
                let braceCount = 1;
                while (i < tokens.length && braceCount > 0) {
                    if (tokens[i] === '{') braceCount++;
                    else if (tokens[i] === '}') braceCount--;
                    if (braceCount > 0) falseTokens.push(tokens[i]);
                    i++;
                }
                falseBranch = this.parse(falseTokens);
            }
        }

        return {
            node: {
                type: 'if',
                condition: condition,
                trueBranch,
                falseBranch
            },
            nextIndex: i
        };
    },

    checkCondition(left, op, right) {
        switch (op) {
            case '<': return left < right;
            case '<=': return left <= right;
            case '>': return left > right;
            case '>=': return left >= right;
            case '==': case '===': return left == right;
            case '!=': case '!==': return left != right;
            default: throw new Error(`Unknown operator: ${op}`);
        }
    },

    async evaluateCondition(cond, gameState) {
        const cleanCond = cond.replace(/\s/g, '');
        let negate = false;
        let actualCond = cleanCond;

        if (actualCond.startsWith('!')) {
            negate = true;
            actualCond = actualCond.substring(1);
            if (actualCond.startsWith('(') && actualCond.endsWith(')')) {
                actualCond = actualCond.slice(1, -1);
            }
        }

        const checkMatch = actualCond.match(/robot\.canMove(Right|Left|Up|Down)\(\)/);
        if (checkMatch) {
            const dir = checkMatch[1].toUpperCase();
            const result = gameState.canMove(dir);
            return negate ? !result : result;
        }

        const compareMatch = actualCond.match(/^(\d+)([<>=!]+)(\d+)$/);
        if (compareMatch) {
            const left = parseInt(compareMatch[1]);
            const op = compareMatch[2];
            const right = parseInt(compareMatch[3]);
            return this.checkCondition(left, op, right);
        }

        throw new Error(`Invalid condition: "${cond}"`);
    }
};
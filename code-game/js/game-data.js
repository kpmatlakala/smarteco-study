// ==========================================
// GAME DATA
// ==========================================

const CODING_LEVELS = [
    {
        id: 1,
        title: "Initialization",
        description: "Guide the robot to the green portal using direct commands.",
        concept: "SEQUENCE",
        xpReward: 50,
        gridSize: 5,
        grid: [
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'WALL', 'WALL', 'WALL', 'EMPTY'],
            ['START', 'EMPTY', 'EMPTY', 'EMPTY', 'GOAL'],
            ['EMPTY', 'WALL', 'WALL', 'WALL', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
        ],
        startPos: { x: 0, y: 2 },
        endPos: { x: 4, y: 2 },
        starterCode: "// Move the robot 4 steps to the right\nrobot.moveRight();\nrobot.moveRight();\nrobot.moveRight();\nrobot.moveRight();",
        hint: "robot.moveRight(); robot.moveRight(); robot.moveRight(); robot.moveRight();"
    },
    {
        id: 2,
        title: "Loops",
        description: "The path is long. Use a loop to avoid repetitive code.",
        concept: "LOOPS",
        xpReward: 75,
        gridSize: 6,
        grid: [
            ['START', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'GOAL'],
            ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'WALL'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
        ],
        startPos: { x: 0, y: 0 },
        endPos: { x: 5, y: 0 },
        starterCode: "// Use a for loop to move 5 times\nfor (let i = 0; i < 5; i++) {\n  robot.moveRight();\n}",
        hint: "for (let i = 0; i < 5; i++) { robot.moveRight(); }"
    },
    {
        id: 3,
        title: "Conditionals",
        description: "Walls block the path. Check surroundings before moving.",
        concept: "CONDITIONALS",
        xpReward: 100,
        gridSize: 5,
        grid: [
            ['START', 'WALL', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'WALL', 'EMPTY', 'WALL', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'WALL', 'EMPTY'],
            ['WALL', 'WALL', 'EMPTY', 'WALL', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'WALL', 'GOAL'],
        ],
        startPos: { x: 0, y: 0 },
        endPos: { x: 4, y: 4 },
        starterCode: "// Check if you can move down\nif (robot.canMoveDown()) {\n  robot.moveDown();\n} else {\n  robot.moveRight();\n}",
        hint: "Use a loop with if/else to navigate the maze."
    },
    {
        id: 4,
        title: "The Spiral",
        description: "Combine loops and conditionals to escape the spiral.",
        concept: "ADVANCED",
        xpReward: 125,
        gridSize: 7,
        grid: [
            ['START', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'WALL'],
            ['WALL', 'WALL', 'WALL', 'WALL', 'WALL', 'EMPTY', 'WALL'],
            ['GOAL', 'EMPTY', 'EMPTY', 'EMPTY', 'WALL', 'EMPTY', 'WALL'],
            ['WALL', 'WALL', 'WALL', 'EMPTY', 'WALL', 'EMPTY', 'WALL'],
            ['WALL', 'EMPTY', 'EMPTY', 'EMPTY', 'WALL', 'EMPTY', 'WALL'],
            ['WALL', 'EMPTY', 'WALL', 'WALL', 'WALL', 'EMPTY', 'WALL'],
            ['WALL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'WALL'],
        ],
        startPos: { x: 0, y: 0 },
        endPos: { x: 0, y: 2 },
        starterCode: "// Navigate the spiral\n// Hint: Follow the right wall\nfor (let i = 0; i < 20; i++) {\n  \n}",
        hint: "Follow the right-hand rule: always try to turn right first."
    },
    {
        id: 5,
        title: "The Gauntlet",
        description: "Your final test. Reach the goal using minimal commands.",
        concept: "OPTIMIZATION",
        xpReward: 150,
        gridSize: 8,
        grid: [
            ['START', 'EMPTY', 'WALL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'WALL', 'EMPTY', 'WALL', 'WALL', 'WALL', 'EMPTY'],
            ['WALL', 'EMPTY', 'WALL', 'EMPTY', 'EMPTY', 'EMPTY', 'WALL', 'EMPTY'],
            ['WALL', 'EMPTY', 'EMPTY', 'EMPTY', 'WALL', 'EMPTY', 'WALL', 'EMPTY'],
            ['WALL', 'WALL', 'WALL', 'EMPTY', 'WALL', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'WALL', 'EMPTY', 'WALL', 'WALL', 'WALL', 'WALL'],
            ['EMPTY', 'WALL', 'WALL', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'EMPTY'],
            ['EMPTY', 'EMPTY', 'EMPTY', 'EMPTY', 'WALL', 'WALL', 'WALL', 'GOAL'],
        ],
        startPos: { x: 0, y: 0 },
        endPos: { x: 7, y: 7 },
        starterCode: "// The Gauntlet - Find your path\n",
        hint: "Sometimes the long way around is the fastest."
    }
];
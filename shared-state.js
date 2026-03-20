// ===== shared-state.js =====
// Include this in ALL your HTML pages!

const SmartEcoState = {
    // ===== INITIALIZE STATE =====
    init() {
        // Load from localStorage or set defaults
        this.state = {
            // User
            userName: this.get('userName', 'Learner'),
            userAvatar: this.get('userAvatar', '👤'),

            // Session
            sessionActive: this.getBool('sessionActive', false),
            sessionTime: this.getInt('sessionTime', 0),
            sessionDuration: this.getInt('sessionDuration', 1500), // 25 min
            sessionStartTime: this.get('sessionStartTime', null),
            sessionPaused: this.getBool('sessionPaused', false),

            // Progress
            xp: this.getInt('xp', 0),
            level: this.getInt('level', 1),
            streak: this.getInt('streak', 1),
            longestStreak: this.getInt('longestStreak', 1),
            lessonsCompleted: this.getInt('lessonsCompleted', 0),
            totalStudyTime: this.getInt('totalStudyTime', 0),
            dailyStudyTime: this.getInt('dailyStudyTime', 0),
            lastStudyDate: this.get('lastStudyDate', new Date().toDateString()),

            // Completed lessons
            completedLessons: this.getArray('completedLessons', []),

            // In-progress lessons
            inProgressLessons: this.getArray('inProgressLessons', []),
            currentLesson: this.getInt('currentLesson', 1),
            currentLessonProgress: this.getInt('currentLessonProgress', 0),
            currentLessonStep: this.getInt('currentLessonStep', 0),

            // Game progress
            codingLevels: this.getInt('codingLevels', 1),
            mathLevels: this.getInt('mathLevels', 1),

            // Hardware (OPTIONAL - app works without it!)
            hardwareConnected: this.getBool('hardwareConnected', false),
            lastTouch: this.get('lastTouch', null),
            touchCount: this.getInt('touchCount', 0),
            hardwareBattery: this.getInt('hardwareBattery', 85),

            // Badges
            badges: this.getArray('badges', []),

            // Notifications
            notifications: this.getArray('notifications', [])
        };

        this.checkNewDay();
        this.listeners = [];
        console.log('📊 SmartEco State initialized', this.state);

        // Auto-save every 30 seconds
        setInterval(() => this.saveAll(), 30000);
    },

    // ===== LOCALSTORAGE HELPERS =====
    get(key, defaultValue) {
        try {
            return localStorage.getItem(key) || defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    getInt(key, defaultValue) {
        try {
            const val = localStorage.getItem(key);
            return val ? parseInt(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    getBool(key, defaultValue) {
        try {
            const val = localStorage.getItem(key);
            return val ? val === 'true' : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    getArray(key, defaultValue) {
        try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },

    // ===== UPDATE STATE =====
    set(key, value) {
        this.state[key] = value;
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
        this.notifyListeners(key, value);
    },

    setInt(key, value) {
        this.state[key] = value;
        try {
            localStorage.setItem(key, value.toString());
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
        this.notifyListeners(key, value);
    },

    setBool(key, value) {
        this.state[key] = value;
        try {
            localStorage.setItem(key, value ? 'true' : 'false');
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
        this.notifyListeners(key, value);
    },

    setArray(key, value) {
        this.state[key] = value;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
        this.notifyListeners(key, value);
    },

    saveAll() {
        try {
            Object.keys(this.state).forEach(key => {
                const value = this.state[key];
                if (Array.isArray(value)) {
                    localStorage.setItem(key, JSON.stringify(value));
                } else if (typeof value === 'boolean') {
                    localStorage.setItem(key, value ? 'true' : 'false');
                } else if (typeof value === 'number') {
                    localStorage.setItem(key, value.toString());
                } else if (value !== null && value !== undefined) {
                    localStorage.setItem(key, value.toString());
                }
            });
        } catch (e) {
            console.warn('Failed to auto-save:', e);
        }
    },

    // ===== DAILY CHECK =====
    checkNewDay() {
        const today = new Date().toDateString();
        if (this.state.lastStudyDate !== today) {
            this.state.dailyStudyTime = 0;
            this.state.lastStudyDate = today;
            this.set('dailyStudyTime', '0');
            this.set('lastStudyDate', today);
        }
    },

    // ===== SESSION METHODS =====
    startSession() {
        this.setBool('sessionActive', true);
        this.setBool('sessionPaused', false);
        this.setInt('sessionTime', 0);
        this.set('sessionStartTime', new Date().toISOString());
        this.notifyListeners('sessionStarted', true);
        this.addNotification('Session Started', '🎯 Focus mode activated!');
    },

    pauseSession() {
        this.setBool('sessionPaused', true);
        this.notifyListeners('sessionPaused', true);
    },

    resumeSession() {
        this.setBool('sessionPaused', false);
        this.notifyListeners('sessionResumed', true);
    },

    endSession() {
        this.setBool('sessionActive', false);
        this.setBool('sessionPaused', false);
        this.setInt('sessionTime', 0);
        this.set('sessionStartTime', null);
        this.notifyListeners('sessionEnded', true);
        this.addNotification('Session Ended', '⏹️ Great effort!');
    },

    updateSessionTime(seconds) {
        if (!this.state.sessionActive || this.state.sessionPaused) return;

        this.setInt('sessionTime', seconds);

        if (seconds > 0 && seconds % 60 === 0) {
            const totalMinutes = this.state.totalStudyTime + 1;
            this.setInt('totalStudyTime', totalMinutes);
            this.setInt('dailyStudyTime', this.state.dailyStudyTime + 1);
        }

        if (seconds >= this.state.sessionDuration) {
            this.completeSession();
        }
    },

    // ===== Add these methods to SmartEcoState object =====

    // ===== LESSON METHODS (ADD THIS IF MISSING) =====
    completeLesson(lessonId) {
        if (!this.state.completedLessons.includes(lessonId)) {
            const completed = [...this.state.completedLessons, lessonId];
            this.setArray('completedLessons', completed);

            // Remove from in-progress if present
            const inProgress = this.state.inProgressLessons.filter(id => id !== lessonId);
            this.setArray('inProgressLessons', inProgress);

            // Update lessons completed count
            this.setInt('lessonsCompleted', completed.length);

            // Add XP based on lesson
            const xpGain = this.getLessonXP(lessonId) || 50;
            this.addXP(xpGain);

            this.addNotification('Lesson Complete!', `🎓 ${lessonId} mastered! +${xpGain} XP`);
            this.notifyListeners('lessonCompleted', lessonId);

            return true;
        }
        return false;
    },

    // Helper method to get lesson XP
    getLessonXP(lessonId) {
        const xpMap = {
            'coding_1': 50,
            'coding_2': 75,
            'coding_3': 100,
            'coding_4': 125,
            'coding_5': 150,
            'math_1': 50,
            'math_2': 60,
            'math_3': 75,
            'math_4': 85,
            'math_5': 100,
            'math_6': 120
        };
        return xpMap[lessonId] || 50;
    },

    // ===== HARDWARE TEST METHODS (ADD THESE) =====
    testLED() {
        if (!this.state.hardwareConnected) {
            this.addNotification('Hardware Not Connected', '🔌 Please connect Study Box first');
            return false;
        }

        // Simulate LED test
        this.addNotification('LED Test', '✨ Sending rainbow signal to Study Box');

        // If you have Bluetooth characteristic, send command
        if (window.bluetoothCharacteristic) {
            try {
                const encoder = new TextEncoder();
                window.bluetoothCharacteristic.writeValue(encoder.encode('LED_RAINBOW'));
            } catch (e) {
                console.error('Failed to send LED command:', e);
            }
        }

        return true;
    },

    testBuzzer() {
        if (!this.state.hardwareConnected) {
            this.addNotification('Hardware Not Connected', '🔌 Please connect Study Box first');
            return false;
        }

        this.addNotification('Buzzer Test', '🔊 Playing celebration sound');

        if (window.bluetoothCharacteristic) {
            try {
                const encoder = new TextEncoder();
                window.bluetoothCharacteristic.writeValue(encoder.encode('PLAY_CELEBRATION'));
            } catch (e) {
                console.error('Failed to send buzzer command:', e);
            }
        }

        return true;
    },

    // ===== XP METHODS =====
    addXP(amount) {
        const newXP = this.state.xp + amount;
        this.setInt('xp', newXP);

        const newLevel = Math.floor(newXP / 100) + 1;
        if (newLevel > this.state.level) {
            this.setInt('level', newLevel);
            this.addBadge(`level_${newLevel}`, `🏅 Level ${newLevel} Achieved!`);
            this.notifyListeners('levelUp', newLevel);
            this.addNotification('Level Up!', `🎉 You're now level ${newLevel}!`);
        }
    },

    // ===== STREAK METHODS =====
    updateStreak() {
        const today = new Date().toDateString();
        const lastStudy = this.state.lastStudyDate;

        if (lastStudy === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (lastStudy === yesterday.toDateString()) {
            const newStreak = this.state.streak + 1;
            this.setInt('streak', newStreak);

            if (newStreak > this.state.longestStreak) {
                this.setInt('longestStreak', newStreak);
            }

            if (newStreak === 7) this.addBadge('weekly_warrior', '🔥 Weekly Warrior');
            if (newStreak === 30) this.addBadge('monthly_monk', '🧘 Monthly Monk');
        } else {
            this.setInt('streak', 1);
        }

        this.set('lastStudyDate', today);
    },

    // ===== GAME METHODS =====
    startGame(gameType) {
        // Start session when game begins
        this.startSession();
        this.notifyListeners('gameStarted', gameType);
    },

    completeCodingLevel(level) {
        const lessonId = `coding_${level}`;
        if (!this.state.completedLessons.includes(lessonId)) {
            const completed = [...this.state.completedLessons, lessonId];
            this.setArray('completedLessons', completed);
            this.setInt('codingLevels', Math.max(this.state.codingLevels, level + 1));
            this.setInt('lessonsCompleted', completed.length);
            this.addXP(level * 10 + 40); // XP based on level
            this.addNotification('Coding Level Complete!', `🎓 Level ${level} mastered!`);
        }
    },

    completeMathLevel(level) {
        const lessonId = `math_${level}`;
        if (!this.state.completedLessons.includes(lessonId)) {
            const completed = [...this.state.completedLessons, lessonId];
            this.setArray('completedLessons', completed);
            this.setInt('mathLevels', Math.max(this.state.mathLevels, level + 1));
            this.setInt('lessonsCompleted', completed.length);
            this.addXP(level * 8 + 42);
            this.addNotification('Math Level Complete!', `🎓 Level ${level} mastered!`);
        }
    },

    // ===== HARDWARE METHODS (OPTIONAL) =====
    setHardwareConnected(connected) {
        this.setBool('hardwareConnected', connected);
        if (connected) {
            this.addNotification('Hardware Connected', '🔌 Study Box ready!');
        } else {
            this.addNotification('Hardware Disconnected', '⚫ Continuing without hardware');
        }
    },

    touchDetected() {
        const newCount = this.state.touchCount + 1;
        this.setInt('touchCount', newCount);
        this.set('lastTouch', new Date().toISOString());

        // Toggle session on touch (only if hardware connected)
        if (this.state.hardwareConnected) {
            if (!this.state.sessionActive) {
                this.startSession();
            } else if (!this.state.sessionPaused) {
                this.pauseSession();
            } else {
                this.resumeSession();
            }
        }

        this.notifyListeners('touchDetected', newCount);
    },

    updateHardwareBattery(level) {
        this.setInt('hardwareBattery', level);
        this.notifyListeners('batteryUpdate', level);

        if (level < 20 && this.state.hardwareConnected) {
            this.addNotification('Low Battery', '🔋 Please charge Study Box');
        }
    },

    // ===== BADGE METHODS =====
    addBadge(badgeId, badgeName) {
        if (!this.state.badges.some(b => b.id === badgeId)) {
            const newBadges = [...this.state.badges, {
                id: badgeId,
                name: badgeName,
                icon: this.getBadgeIcon(badgeId),
                earned: new Date().toISOString()
            }];
            this.setArray('badges', newBadges);
            this.addNotification('Badge Unlocked!', `🏆 ${badgeName}`);
            this.notifyListeners('badgeEarned', badgeId);
        }
    },

    getBadgeIcon(badgeId) {
        const icons = {
            first_lesson: '🌟',
            weekly_warrior: '🔥',
            monthly_monk: '🧘',
            level_5: '⭐',
            level_10: '✨',
            level_25: '💫',
            coding_master: '🤖',
            math_master: '🔢'
        };
        return icons[badgeId] || '🏆';
    },

    // ===== NOTIFICATION METHODS =====
    addNotification(title, message) {
        const notification = {
            id: Date.now(),
            title,
            message,
            time: new Date().toISOString(),
            read: false,
            icon: this.getNotificationIcon(title)
        };

        const notifications = [notification, ...this.state.notifications].slice(0, 20);
        this.setArray('notifications', notifications);
        this.notifyListeners('newNotification', notification);
    },

    getNotificationIcon(title) {
        if (title.includes('Session')) return '⏱️';
        if (title.includes('Level')) return '📈';
        if (title.includes('Badge')) return '🏆';
        if (title.includes('Hardware')) return '🔌';
        if (title.includes('Coding')) return '🤖';
        if (title.includes('Math')) return '🔢';
        return '📌';
    },

    markNotificationsRead() {
        const notifications = this.state.notifications.map(n => ({ ...n, read: true }));
        this.setArray('notifications', notifications);
        this.notifyListeners('notificationsRead', true);
    },

    getUnreadCount() {
        return this.state.notifications.filter(n => !n.read).length;
    },

    // ===== OBSERVER =====
    listeners: [],

    addListener(callback) {
        this.listeners.push(callback);
    },

    removeListener(callback) {
        this.listeners = this.listeners.filter(cb => cb !== callback);
    },

    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data, this.state);
            } catch (e) {
                console.error('Listener error:', e);
            }
        });
    }
};



// Initialize
try {
    SmartEcoState.init();
} catch (e) {
    console.error('Failed to initialize SmartEcoState:', e);
}

// Make globally available
window.SmartEco = SmartEcoState;
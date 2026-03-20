// ===== LESSONS DATA (Hardcoded) =====
const lessons = [
    {
        id: 1,
        title: "Introduction to Coding",
        description: "Learn the basics of programming",
        subject: "coding",
        difficulty: "beginner",
        duration: 5,
        xpReward: 50,
        icon: "💻",
        color: "blue",
        path: "lesson.html?id=1"
    },
    {
        id: 2,
        title: "Variables & Data Types",
        description: "Store and manage information",
        subject: "coding",
        difficulty: "beginner",
        duration: 8,
        xpReward: 75,
        icon: "📦",
        color: "green",
        path: "lesson.html?id=2"
    },
    {
        id: 3,
        title: "If/Else Statements",
        description: "Make decisions in code",
        subject: "coding",
        difficulty: "intermediate",
        duration: 10,
        xpReward: 100,
        icon: "🔄",
        color: "purple",
        path: "lesson.html?id=3"
    },
    {
        id: 4,
        title: "Fractions Basics",
        description: "Understanding parts of a whole",
        subject: "math",
        difficulty: "beginner",
        duration: 6,
        xpReward: 60,
        icon: "🧮",
        color: "orange",
        path: "lesson.html?id=4"
    },
    {
        id: 5,
        title: "Loops and Iteration",
        description: "Repeat actions efficiently",
        subject: "coding",
        difficulty: "intermediate",
        duration: 12,
        xpReward: 100,
        icon: "🔄",
        color: "pink",
        path: "lesson.html?id=5"
    }
];

// ===== DASHBOARD UPDATE FUNCTIONS =====
function updateContinueLearning(state) {
    const container = document.getElementById('continue-learning-container');
    if (!container) return;
    
    // Get in-progress lesson first
    const inProgressId = state.inProgressLessons[0];
    const inProgressLesson = lessons.find(l => l.id === inProgressId);
    
    // Get completed lessons
    const completed = lessons.filter(l => state.completedLessons.includes(l.id));
    
    // Get recommended (first incomplete lesson)
    const recommended = lessons.find(l => 
        !state.completedLessons.includes(l.id) && 
        (!inProgressLesson || l.id !== inProgressLesson.id)
    );
    
    let html = '';
    
    // Show in-progress lesson
    if (inProgressLesson) {
        const progress = state.currentLesson === inProgressLesson.id ? state.currentLessonProgress : 30;
        html += `
            <div class="bg-slate-800/50 p-5 rounded-xl border border-indigo-500/50 cursor-pointer hover:bg-slate-800 transition"
                 onclick="window.location.href='${inProgressLesson.path}'">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-${inProgressLesson.color}-500 to-${inProgressLesson.color}-600 rounded-xl flex items-center justify-center text-2xl">
                        ${inProgressLesson.icon}
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-1">
                            <h4 class="font-bold">${inProgressLesson.title}</h4>
                            <span class="px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-xs">In Progress</span>
                        </div>
                        <p class="text-sm text-slate-400 mb-2">${inProgressLesson.description}</p>
                        <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div class="h-full bg-gradient-to-r from-${inProgressLesson.color}-500 to-${inProgressLesson.color}-500"
                                style="width: ${progress}%"></div>
                        </div>
                    </div>
                    <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition">
                        Resume
                    </button>
                </div>
            </div>
        `;
    }
    
    // Show recommended lesson
    if (recommended && (!inProgressLesson || inProgressLesson.id !== recommended.id)) {
        html += `
            <div class="bg-slate-800/30 p-5 rounded-xl border border-slate-700 cursor-pointer hover:border-indigo-500 transition"
                 onclick="window.location.href='${recommended.path}'">
                <div class="flex items-center gap-4">
                    <div class="w-14 h-14 bg-gradient-to-br from-${recommended.color}-500 to-${recommended.color}-600 rounded-xl flex items-center justify-center text-2xl opacity-70">
                        ${recommended.icon}
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <h4 class="font-bold text-slate-300">${recommended.title}</h4>
                            <span class="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Recommended</span>
                        </div>
                        <p class="text-sm text-slate-400">${recommended.description}</p>
                        <div class="flex items-center gap-3 mt-2 text-xs text-slate-500">
                            <span>⏱️ ${recommended.duration} min</span>
                            <span>•</span>
                            <span>🎯 ${recommended.xpReward} XP</span>
                        </div>
                    </div>
                    <button class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition">
                        Start
                    </button>
                </div>
            </div>
        `;
    }
    
    // If no lessons at all
    if (!inProgressLesson && !recommended) {
        html = `
            <div class="text-center py-8">
                <span class="text-6xl mb-4 block">🎉</span>
                <h4 class="font-bold text-lg mb-2">All Lessons Complete!</h4>
                <p class="text-sm text-slate-400 mb-4">You've mastered everything. New lessons coming soon!</p>
                <button onclick="window.location.href='lessons.html'" 
                        class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-semibold transition">
                    Browse Lessons
                </button>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function updateProgressStats(state) {
    // Daily progress
    const dailyTarget = 30; // 30 minutes goal
    const dailyPercent = Math.min((state.dailyStudyTime / dailyTarget) * 100, 100);
    document.getElementById('daily-progress').textContent = `${state.dailyStudyTime}/${dailyTarget} min`;
    
    // Lessons done
    document.getElementById('lessons-done').textContent = state.lessonsCompleted;
    
    // Streak
    document.getElementById('current-streak').textContent = `${state.streak} day${state.streak > 1 ? 's' : ''}`;
    
    // Update XP bar if exists
    const xpBar = document.getElementById('xp-progress-bar');
    if (xpBar) {
        const xpInLevel = state.xp % 100;
        xpBar.style.width = xpInLevel + '%';
    }
    
    // Update level display
    const levelDisplay = document.getElementById('current-level');
    if (levelDisplay) levelDisplay.textContent = state.level;
}

function updateRecentAchievements(state) {
    const container = document.getElementById('recent-achievements');
    if (!container) return;
    
    const recentBadges = state.badges.slice(-3).reverse();
    
    if (recentBadges.length === 0) {
        container.innerHTML = `
            <div class="text-center text-slate-500 py-4">
                <span class="text-4xl mb-2 block">🏆</span>
                <p class="text-sm">Complete lessons to earn badges!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = recentBadges.map(badge => `
        <div class="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
            <span class="text-2xl">${badge.icon || '🏆'}</span>
            <div class="flex-1">
                <p class="font-semibold text-sm">${badge.name}</p>
                <p class="text-xs text-slate-400">${new Date(badge.earned).toLocaleDateString()}</p>
            </div>
        </div>
    `).join('');
}

function updateNotificationBell(state) {
    const unreadCount = state.notifications.filter(n => !n.read).length;
    const dot = document.getElementById('notification-dot');
    const counter = document.getElementById('notification-count');
    
    if (unreadCount > 0) {
        if (dot) dot.classList.remove('hidden');
        if (counter) {
            counter.textContent = unreadCount;
            counter.classList.remove('hidden');
        }
    } else {
        if (dot) dot.classList.add('hidden');
        if (counter) counter.classList.add('hidden');
    }
}

// ===== NOTIFICATIONS =====
function showNotifications() {
    const state = SmartEco.state;
    const unread = state.notifications.filter(n => !n.read);
    
    if (unread.length === 0) {
        showToast('No new notifications', '📬', 'All caught up!');
        return;
    }
    
    let message = '';
    unread.slice(0, 3).forEach(n => {
        message += `\n${n.icon || '📌'} ${n.title}: ${n.message}`;
    });
    
    if (unread.length > 3) {
        message += `\n...and ${unread.length - 3} more`;
    }
    
    showToast(message, '🔔', `${unread.length} Notification${unread.length > 1 ? 's' : ''}`);
    SmartEco.markNotificationsRead();
}

function showToast(message, icon = '🎉', title = 'Notification') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    document.getElementById('toast-icon').textContent = icon;
    document.getElementById('toast-title').textContent = title;
    document.getElementById('toast-message').textContent = message;
    
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', function() {
    // Initial updates
    updateContinueLearning(SmartEco.state);
    updateProgressStats(SmartEco.state);
    updateRecentAchievements(SmartEco.state);
    updateNotificationBell(SmartEco.state);
    
    // Listen for state changes
    SmartEco.addListener(function(event, data, state) {
        console.log('Dashboard update:', event);
        
        switch(event) {
            case 'lessonStarted':
            case 'lessonProgress':
            case 'lessonCompleted':
                updateContinueLearning(state);
                updateProgressStats(state);
                updateRecentAchievements(state);
                break;
                
            case 'levelUp':
            case 'badgeEarned':
                updateRecentAchievements(state);
                updateProgressStats(state);
                break;
                
            case 'newNotification':
            case 'notificationsRead':
                updateNotificationBell(state);
                break;
        }
    });
});

// Export functions
window.showNotifications = showNotifications;
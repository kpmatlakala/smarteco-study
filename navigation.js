// ===== navigation.js =====
// Include this in ALL pages after shared-state.js

function initNavigation() {
    // Update navigation with current user data
    updateNavbar();
    
    // Listen for state changes
    if (window.SmartEco) {
        SmartEco.addListener(function(event, data, state) {
            if (['xp', 'level', 'hardwareConnected', 'batteryUpdate'].includes(event)) {
                updateNavbar();
            }
        });
    }
    
    // Set up mobile menu if needed
    setupMobileMenu();
}

function updateNavbar() {
    if (!window.SmartEco) return;
    
    const state = SmartEco.state;
    
    // Update level
    const levelElements = document.querySelectorAll('.nav-level');
    levelElements.forEach(el => el.textContent = state.level);
    
    // Update XP bar
    const xpInLevel = state.xp % 100;
    const xpBarElements = document.querySelectorAll('.nav-xp-bar');
    xpBarElements.forEach(el => el.style.width = xpInLevel + '%');
    
    // Update XP text
    const xpTextElements = document.querySelectorAll('.nav-xp-text');
    xpTextElements.forEach(el => el.textContent = xpInLevel + '/100 XP');
    
    // Update hardware status
    const hardwareLedElements = document.querySelectorAll('.hardware-led');
    const hardwareTextElements = document.querySelectorAll('.hardware-status-text');
    
    hardwareLedElements.forEach(led => {
        if (state.hardwareConnected) {
            led.className = 'hardware-led w-2 h-2 bg-green-500 rounded-full animate-pulse';
        } else {
            led.className = 'hardware-led w-2 h-2 bg-gray-500 rounded-full';
        }
    });
    
    hardwareTextElements.forEach(text => {
        if (state.hardwareConnected) {
            text.textContent = 'Connected';
            text.className = 'hardware-status-text text-xs text-green-400';
        } else {
            text.textContent = 'Disconnected';
            text.className = 'hardware-status-text text-xs text-gray-400';
        }
    });
    
    // Update avatar
    const avatarElements = document.querySelectorAll('.user-avatar');
    avatarElements.forEach(el => el.textContent = state.userAvatar || '👤');
}

function setupMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Mark current page as active in navigation
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('text-indigo-400', 'font-semibold');
        } else {
            link.classList.remove('text-indigo-400', 'font-semibold');
        }
    });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    // Wait for SmartEco to be available
    const checkInterval = setInterval(() => {
        if (window.SmartEco) {
            clearInterval(checkInterval);
            initNavigation();
            setActiveNavLink();
        }
    }, 100);
});
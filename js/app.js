/**
 * QUIZBYTEE: SHARED UI ENGINE
 * Manages sidebar, theme, internet detection, and common components.
 */

const App = {
    // Current theme
    theme: localStorage.getItem('qb_theme') || 'dark',

    // Initialize UI
    init: () => {
        App.injectSidebar();
        App.setupTheme();
        App.setupInternetDetection();
        App.setupMusicToggle();
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
    },

    // Sidebar Injection & Logic
    injectSidebar: () => {
        const sidebarContainer = document.getElementById('sidebar');
        if (!sidebarContainer) return;

        const path = window.location.pathname;
        const isActive = (file) => path.includes(file) ? 'active' : '';

        // 1. Create Overlay
        let overlay = document.getElementById('sidebar-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebar-overlay';
            overlay.className = 'sidebar-overlay';
            overlay.onclick = () => App.toggleSidebar(false);
            document.body.appendChild(overlay);
        }

        // 2. Create Trigger (Hamburger)
        let trigger = document.getElementById('sidebar-trigger');
        if (!trigger) {
            trigger = document.createElement('button');
            trigger.id = 'sidebar-trigger';
            trigger.className = 'sidebar-trigger';
            trigger.innerHTML = '<i data-lucide="menu"></i>';
            trigger.onclick = () => App.toggleSidebar();
            document.body.appendChild(trigger);
        }

        // 3. Populate Sidebar
        sidebarContainer.className = 'sidebar';
        sidebarContainer.innerHTML = `
            <div class="flex items-center gap-3 mb-10">
                <div class="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shrink-0 shadow-lg shadow-indigo-600/20">QB</div>
                <span class="font-outfit text-2xl font-black tracking-tight">QUIZBYTEE</span>
            </div>

            <nav class="sidebar-nav">
                <a href="dashboard.html" class="nav-item ${isActive('dashboard.html')}">
                    <i data-lucide="layout-dashboard"></i>
                    <span>Dashboard</span>
                </a>
                <a href="explore.html" class="nav-item ${isActive('explore.html')}">
                    <i data-lucide="compass"></i>
                    <span>Explore</span>
                </a>
                <a href="quiz-setup.html" class="nav-item ${isActive('quiz-setup.html')}">
                    <i data-lucide="play-circle"></i>
                    <span>Quiz</span>
                </a>
                <a href="leaderboard.html" class="nav-item ${isActive('leaderboard.html')}">
                    <i data-lucide="trophy"></i>
                    <span>Leaderboard</span>
                </a>
                <a href="profile.html" class="nav-item ${isActive('profile.html')}">
                    <i data-lucide="user"></i>
                    <span>Profile</span>
                </a>
            </nav>

            <div class="mt-auto pt-6 border-t border-slate-700/50 space-y-2">
                <button onclick="App.toggleTheme()" class="nav-item w-full">
                    <i data-lucide="sun" class="${App.theme === 'dark' ? '' : 'hidden'}"></i>
                    <i data-lucide="moon" class="${App.theme === 'light' ? '' : 'hidden'}"></i>
                    <span>Toggle Theme</span>
                </button>
                <button class="nav-item w-full music-toggle">
                    <i data-lucide="music"></i>
                    <span>Music Toggle</span>
                </button>
                <button onclick="Auth.logout()" class="nav-item w-full text-red-400 hover:bg-red-500/10">
                    <i data-lucide="log-out"></i>
                    <span>Logout</span>
                </button>
            </div>
        `;

        if (window.lucide) lucide.createIcons();
    },

    toggleSidebar: (force) => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        const trigger = document.getElementById('sidebar-trigger');
        
        const isOpen = sidebar.classList.contains('active');
        const shouldOpen = force !== undefined ? force : !isOpen;

        if (shouldOpen) {
            sidebar.classList.add('active');
            overlay.classList.add('active');
            trigger.innerHTML = '<i data-lucide="x"></i>';
        } else {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            trigger.innerHTML = '<i data-lucide="menu"></i>';
        }
        
        if (window.lucide) lucide.createIcons();
    },

    // Theme Management
    setupTheme: () => {
        document.documentElement.setAttribute('data-theme', App.theme);
    },

    toggleTheme: () => {
        App.theme = App.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', App.theme);
        localStorage.setItem('qb_theme', App.theme);
        App.injectSidebar(); // Re-render to update icons
    },

    // Internet Detection
    setupInternetDetection: () => {
        const updateOnlineStatus = () => {
            const isOnline = navigator.onLine;
            let banner = document.getElementById('offline-banner');
            
            if (!isOnline) {
                if (!banner) {
                    banner = document.createElement('div');
                    banner.id = 'offline-banner';
                    banner.className = 'fixed top-0 left-0 right-0 z-[5000] bg-red-600 text-white text-center py-2 font-black uppercase tracking-widest text-[10px] animate-fade';
                    banner.innerText = '⚠️ Offline Mode: Multiplayer and Live Stats are disabled.';
                    document.body.prepend(banner);
                }
            } else if (banner) {
                banner.remove();
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        updateOnlineStatus();
    },

    setupMusicToggle: () => {
        let isMusicPlaying = false;
        const musicBtn = document.querySelector('.music-toggle');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => {
                isMusicPlaying = !isMusicPlaying;
                musicBtn.classList.toggle('active', isMusicPlaying);
                if (isMusicPlaying) {
                    // Logic for music (future)
                }
            });
        }
    }
};

// Global Initialization
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});

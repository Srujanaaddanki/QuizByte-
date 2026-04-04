/**
 * QUIZBYTEE: SHARED SIDEBAR INJECTOR
 * Dynamically injects the sidebar into protected pages.
 */

function injectSidebar() {
    const sidebar = document.createElement('aside');
    sidebar.id = 'sidebar';
    sidebar.className = 'sidebar glass border-r bg-[#0f172a]/50 backdrop-blur-xl transition-all duration-300';
    
    // Get current page to highlight active link
    const path = window.location.pathname;
    const isActive = (file) => path.includes(file) ? 'bg-indigo-600/10 text-white' : 'text-slate-400 hover:text-white';

    sidebar.innerHTML = `
        <div class="flex items-center gap-3 mb-10 overflow-hidden">
            <div class="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white shrink-0">QB</div>
            <span class="font-outfit text-xl font-bold tracking-tight sidebar-text">QUIZBYTEE</span>
        </div>

        <nav class="flex-1 space-y-2">
            <a href="dashboard.html" class="flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('dashboard.html')}">
                <i data-lucide="layout-dashboard"></i>
                <span class="sidebar-text font-bold">Dashboard</span>
            </a>
            <a href="explore.html" class="flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('explore.html')}">
                <i data-lucide="compass"></i>
                <span class="sidebar-text font-bold">Explore</span>
            </a>
            <a href="leaderboard.html" class="flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('leaderboard.html')}">
                <i data-lucide="trophy"></i>
                <span class="sidebar-text font-bold">Leaderboard</span>
            </a>
            <a href="profile.html" class="flex items-center gap-4 p-4 rounded-2xl transition-all ${isActive('profile.html')}">
                <i data-lucide="user"></i>
                <span class="sidebar-text font-bold">Profile</span>
            </a>
        </nav>

        <div class="pt-6 border-t border-slate-800 space-y-4">
            <button onclick="toggleTheme()" class="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-white transition-all">
                <i data-lucide="sun" class="sun-icon hidden"></i>
                <i data-lucide="moon" class="moon-icon"></i>
                <span class="sidebar-text font-bold">Theme</span>
            </button>
            <button onclick="logout()" class="w-full flex items-center gap-4 p-4 rounded-2xl text-red-400 hover:bg-red-500/10 transition-all">
                <i data-lucide="log-out"></i>
                <span class="sidebar-text font-bold">Logout</span>
            </button>
        </div>
    `;

    document.body.prepend(sidebar);
    
    // Initialize Lucide icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Auto-inject when script is loaded
injectSidebar();

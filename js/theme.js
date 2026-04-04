/**
 * QUIZBYTEE: THEME MANAGER
 * Handles dark/light mode persistence across multiple pages.
 */

(function initTheme() {
    const savedTheme = localStorage.getItem('qb_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
})();

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('qb_theme', next);
    
    // Update icons if present
    updateIcons(next);
}

function updateIcons(theme) {
    const suns = document.querySelectorAll('.sun-icon');
    const moons = document.querySelectorAll('.moon-icon');
    
    if (theme === 'dark') {
        suns.forEach(s => s.classList.add('hidden'));
        moons.forEach(m => m.classList.remove('hidden'));
    } else {
        suns.forEach(s => s.classList.remove('hidden'));
        moons.forEach(m => m.classList.add('hidden'));
    }
}

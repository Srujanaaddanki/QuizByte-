/**
 * QUIZBYTEE: AUTHENTICATION ENGINE
 * Manages user sessions using localStorage.
 */

const Auth = {
    // Current user state
    user: JSON.parse(localStorage.getItem('qb_user')) || null,

    // Signup Logic
    signup: (email, password) => {
        const userData = {
            email,
            password,
            name: email.split('@')[0],
            quizzes: 0,
            accuracy: 0,
            streak: 0,
            lastVisit: new Date().toDateString(),
            badges: []
        };
        localStorage.setItem('qb_user', JSON.stringify(userData));
        Auth.user = userData;
        window.location.href = 'index.html'; // Go to Splash
    },

    // Login Logic
    login: (email, password) => {
        const savedUser = JSON.parse(localStorage.getItem('qb_user'));
        if (savedUser && savedUser.email === email && savedUser.password === password) {
            Auth.user = savedUser;
            window.location.href = 'index.html'; // Go to Splash
            return true;
        }
        return false;
    },

    // Logout Logic
    logout: () => {
        localStorage.removeItem('qb_user');
        window.location.href = 'login.html';
    },

    // Auth Guard
    guard: () => {
        const path = window.location.pathname;
        const isPublic = path.includes('login.html') || path.includes('signup.html');
        
        if (!Auth.user && !isPublic) {
            window.location.href = 'login.html';
        } else if (Auth.user && isPublic) {
            window.location.href = 'dashboard.html';
        }
    }
};

// Auto-run guard on load if not on index.html (Splash)
if (!window.location.pathname.endsWith('index.html')) {
    Auth.guard();
}

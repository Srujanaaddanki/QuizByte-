/**
 * QUIZBYTEE - Core Application Logic (Vanilla JS)
 */

// --- GLOBAL STATE ---
let state = {
    user: JSON.parse(localStorage.getItem('qb_user')) || null,
    theme: localStorage.getItem('qb_theme') || 'dark',
    streak: parseInt(localStorage.getItem('qb_streak')) || 5,
    badges: [],
    quizzes: [],
    leaderboard: [
        { name: "Alex Johnson", score: 2850, avatar: "https://i.pravatar.cc/150?u=alex" },
        { name: "Sarah Miller", score: 2720, avatar: "https://i.pravatar.cc/150?u=sarah" },
        { name: "David Chen", score: 2610, avatar: "https://i.pravatar.cc/150?u=david" }
    ],
    explore: [
        { title: "Quantum Physics", desc: "Understanding the building blocks of the universe.", icon: "zap" },
        { title: "World History", desc: "Key events that shaped our modern civilization.", icon: "book-open" },
        { title: "AI & ML", desc: "Exploring the future of intelligent machines.", icon: "cpu" }
    ],
    activeQuiz: null,
    currentQuestionIndex: 0,
    answers: {},
    timer: null,
    timeLeft: 600, // 10 minutes
    isMenuOpen: false
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initTheme();
    initApp();
    lucide.createIcons();
});

async function loadData() {
    try {
        const response = await fetch('scripts/data.json');
        const data = await response.json();
        state.quizzes = data.quizzes;
        state.badges = data.badges;
    } catch (err) {
        console.error("Failed to load quiz data:", err);
    }
}

function initTheme() {
    if (state.theme === 'dark') {
        document.body.classList.add('dark');
        document.documentElement.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
        document.documentElement.classList.remove('dark');
        const sun = document.querySelector('.sun-icon');
        const moon = document.querySelector('.moon-icon');
        sun?.classList.remove('hidden');
        moon?.classList.add('hidden');
    }
}

function initApp() {
    // STARTUP FLOW: Splash -> (Auth or Dash)
    setTimeout(() => {
        const splash = document.getElementById('splash');
        if (splash) splash.classList.add('hidden');
        
        if (state.user) {
            showView('dashboard');
        } else {
            showView('auth');
        }
    }, 3000);

    setupEventListeners();
    renderBadges();
    renderExplore();
    renderLeaderboard();
}

// --- CORE FUNCTIONS ---

function showView(viewId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    
    // Show target section
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.add('active');
        
        // Show Sidebar if not in Auth
        const sidebar = document.getElementById('sidebar');
        if (viewId === 'auth') {
            sidebar.classList.add('hidden');
        } else {
            sidebar.classList.remove('hidden');
            updateSidebarActive(viewId);
        }
    }
}

function updateSidebarActive(viewId) {
    document.querySelectorAll('.nav-item').forEach(btn => {
        if (btn.dataset.link === viewId) {
            btn.classList.add('bg-indigo-600/10', 'text-white');
            btn.classList.remove('text-slate-400');
        } else {
            btn.classList.remove('bg-indigo-600/10', 'text-white');
            btn.classList.add('text-slate-400');
        }
    });
}

function renderBadges() {
    const container = document.getElementById('badges-container');
    if (!container) return;
    
    container.innerHTML = state.badges.map(badge => `
        <div class="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col items-center gap-2 min-w-[100px] ${!badge.unlocked ? 'opacity-30 grayscale' : 'hover:scale-105 transition-all cursor-pointer'}">
            <span class="text-3xl">${badge.icon}</span>
            <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">${badge.name}</span>
        </div>
    `).join('');
}

function renderExplore() {
    const container = document.getElementById('explore-container');
    if (!container) return;
    
    container.innerHTML = state.explore.map(item => `
        <div class="bg-indigo-600/5 border border-slate-800 p-6 rounded-3xl min-w-[280px] space-y-4 hover:border-indigo-500/30 transition-all group cursor-pointer">
            <div class="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <i data-lucide="${item.icon}"></i>
            </div>
            <div>
                <h4 class="font-bold font-outfit text-lg">${item.title}</h4>
                <p class="text-sm text-slate-500 line-clamp-2">${item.desc}</p>
            </div>
        </div>
    `).join('');
    lucide.createIcons();
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container) return;
    
    container.innerHTML = state.leaderboard.map((player, idx) => `
        <div class="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-800/50 transition-all group cursor-pointer">
            <div class="flex items-center gap-4">
                <span class="text-xs font-black text-slate-600 w-4">${idx + 1}</span>
                <img src="${player.avatar}" class="w-10 h-10 rounded-xl object-cover border border-slate-700" alt="${player.name}">
                <div>
                    <h4 class="text-sm font-bold">${player.name}</h4>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider">${player.score} pts</p>
                </div>
            </div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-slate-700 group-hover:text-indigo-400 transition-colors"></i>
        </div>
    `).join('');
    lucide.createIcons();
}

// --- EVENT LISTENERS ---

function setupEventListeners() {
    // Auth Toggle
    const toggleBtn = document.getElementById('toggleAuth');
    if (toggleBtn) {
        toggleBtn.onclick = () => {
            const title = document.getElementById('auth-title');
            const sub = document.getElementById('auth-subtitle');
            if (title.innerText.includes('Welcome')) {
                title.innerText = "Join the Club";
                sub.innerText = "Create an account to start learning";
                toggleBtn.innerText = "Sign in";
            } else {
                title.innerText = "Welcome Back";
                sub.innerText = "Enter your details to continue";
                toggleBtn.innerText = "Sign up";
            }
        };
    }

    // Auth Submit
    const authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.onsubmit = (e) => {
            e.preventDefault();
            const email = authForm.querySelector('input[type="email"]').value;
            state.user = { email, name: email.split('@')[0] };
            localStorage.setItem('qb_user', JSON.stringify(state.user));
            
            // Explicitly transition views
            document.getElementById('view-auth').classList.remove('active');
            showView('dashboard');
            document.getElementById('user-name').innerText = state.user.name;
        };
    }

    // Nav Items
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.onclick = () => showView(btn.dataset.link);
    });

    // Theme Toggle
    document.getElementById('themeToggle').onclick = () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('qb_theme', state.theme);
        initTheme();
    };

    // Logout
    document.getElementById('logoutBtn').onclick = () => {
        state.user = null;
        localStorage.removeItem('qb_user');
        showView('auth');
    };

    // Sidebar Toggles
    const sidebar = document.getElementById('sidebar');
    document.getElementById('sidebarOpen')?.addEventListener('click', () => {
        sidebar.classList.remove('hidden');
        sidebar.classList.add('fixed', 'inset-y-0', 'left-0', 'z-[200]', 'translate-x-0');
        sidebar.style.display = 'flex';
    });

    document.getElementById('sidebarClose')?.addEventListener('click', () => {
        sidebar.style.display = 'none';
        sidebar.classList.add('hidden');
    });

    // Start Quiz
    document.getElementById('startQuizBtn').onclick = () => {
        startQuiz('sci_01');
    };
}

// --- QUIZ ENGINE ---

function openQuizSetup() {
    const overlay = document.getElementById('modal-overlay');
    const modal = document.getElementById('quiz-setup-modal');
    overlay.classList.remove('hidden');
    modal.classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
    document.getElementById('quiz-setup-modal').classList.add('hidden');
}

function startQuiz(quizId) {
    closeModal();
    showView('quiz');
    
    state.activeQuiz = state.quizzes.find(q => q.id === quizId);
    state.currentQuestionIndex = 0;
    state.answers = {};
    state.timeLeft = 600;

    // Loading transition
    document.getElementById('quiz-loading').classList.remove('hidden');
    document.getElementById('quiz-container').classList.add('hidden');

    setTimeout(() => {
        document.getElementById('quiz-loading').classList.add('hidden');
        document.getElementById('quiz-container').classList.remove('hidden');
        renderQuestion();
        renderQuestionGrid();
        startTimer();
    }, 1500);
}

function renderQuestion() {
    const q = state.activeQuiz.questions[state.currentQuestionIndex];
    document.getElementById('quiz-topic-title').innerText = state.activeQuiz.topic;
    document.getElementById('question-text').innerText = q.question;
    document.getElementById('current-q-num').innerText = state.currentQuestionIndex + 1;
    document.getElementById('total-q-num').innerText = state.activeQuiz.questions.length;

    const container = document.getElementById('options-container');
    container.innerHTML = q.options.map(opt => `
        <button onclick="selectOption('${opt}')" class="option-btn p-5 rounded-2xl bg-slate-800/10 border-2 ${state.answers[q.id] === opt ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-800'} hover:border-indigo-500/50 transition-all text-left font-semibold">
            ${opt}
        </button>
    `).join('');

    // Update Buttons
    const prevBtn = document.getElementById('prevBtn');
    if (state.currentQuestionIndex === 0) {
        prevBtn.classList.add('opacity-50', 'cursor-not-allowed');
        prevBtn.disabled = true;
    } else {
        prevBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        prevBtn.disabled = false;
        prevBtn.onclick = () => { state.currentQuestionIndex--; renderQuestion(); renderQuestionGrid(); };
    }

    const nextBtn = document.getElementById('nextBtn');
    if (state.currentQuestionIndex === state.activeQuiz.questions.length - 1) {
        nextBtn.classList.add('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        nextBtn.onclick = () => { state.currentQuestionIndex++; renderQuestion(); renderQuestionGrid(); };
    }
}

function selectOption(opt) {
    const qId = state.activeQuiz.questions[state.currentQuestionIndex].id;
    state.answers[qId] = opt;
    renderQuestion();
    renderQuestionGrid();
}

function renderQuestionGrid() {
    const grid = document.getElementById('question-grid');
    grid.innerHTML = state.activeQuiz.questions.map((q, idx) => {
        const isCurrent = idx === state.currentQuestionIndex;
        const isAnswered = state.answers[q.id];
        let classes = "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all ";
        if (isCurrent) classes += "bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/20";
        else if (isAnswered) classes += "bg-emerald-500/20 text-emerald-500 border border-emerald-500";
        else classes += "bg-slate-800 text-slate-500 border border-slate-700";
        
        return `<button onclick="state.currentQuestionIndex=${idx}; renderQuestion(); renderQuestionGrid();" class="${classes}">${idx + 1}</button>`;
    }).join('');
}

function startTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
        state.timeLeft--;
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            submitQuiz();
        }
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;
    document.getElementById('timer-text').innerText = `${mins}:${secs.toString().padStart(2, '0')}`;
}

function submitQuiz() {
    clearInterval(state.timer);
    alert("Quiz Submitted! Check your dashboard for insights.");
    showView('dashboard');
}

// --- CHATBOT & UTILS ---

function toggleChat() {
    const win = document.getElementById('chat-window');
    const icon = document.getElementById('chat-icon');
    const close = document.getElementById('chat-close-icon');
    win.classList.toggle('hidden');
    icon.classList.toggle('hidden');
    close.classList.toggle('hidden');
}

window.addEventListener('offline', () => {
    alert("You're offline! Don't worry, QuizBytee works on your current session.");
});

// Visibility Change Detection
document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.activeQuiz && document.getElementById('view-quiz').classList.contains('active')) {
        showChatTip("Warning: Switching tabs during a quiz may result in disqualification!");
    }
});

function showChatTip(msg) {
    if (document.getElementById('chat-window').classList.contains('hidden')) {
        toggleChat();
    }
    const chatMsg = document.createElement('div');
    chatMsg.className = "bg-red-500/10 text-red-400 p-3 rounded-2xl rounded-tl-none self-start mr-10 border border-red-500/10 text-sm animate-in";
    chatMsg.innerText = msg;
    document.getElementById('chat-messages').appendChild(chatMsg);
}

// Chat Input Logic
document.querySelector('#chat-window input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
        const val = e.target.value;
        e.target.value = '';
        
        // User Msg
        const userMsg = document.createElement('div');
        userMsg.className = "bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none self-end ml-10 text-sm animate-in";
        userMsg.innerText = val;
        document.getElementById('chat-messages').appendChild(userMsg);
        
        // Bot Response
        setTimeout(() => {
            const botMsg = document.createElement('div');
            botMsg.className = "bg-indigo-600/10 text-indigo-200 p-3 rounded-2xl rounded-tl-none self-start mr-10 border border-indigo-500/10 text-sm animate-in";
            botMsg.innerText = getBotResponse(val);
            document.getElementById('chat-messages').appendChild(botMsg);
            document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
        }, 800);
    }
});

function getBotResponse(input) {
    input = input.toLowerCase();
    if (input.includes('quiz')) return "To start a quiz, click 'Take a Quiz' on your dashboard!";
    if (input.includes('streak')) return "Streaks are earned by taking at least one quiz daily!";
    if (input.includes('badge')) return "You earn badges by completing challenges and hitting milestones!";
    return "I'm not sure about that, but I'm here to help with your learning journey!";
}

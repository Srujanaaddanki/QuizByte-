/**
 * QUIZBYTEE: CORE QUIZ ENGINE (FIXED)
 * Manages question loading, timer, navigation, and scoring.
 * Synced with high-fidelity quiz.html IDs.
 */

const FallbackData = {
    "maths": {
        "easy": [
            { "question": "What is 15 + 27?", "options": ["32", "42", "45", "52"], "answer": "42" },
            { "question": "Value of 5 x 8?", "options": ["35", "40", "45", "50"], "answer": "40" },
            { "question": "How many sides does a hexagon have?", "options": ["5", "6", "7", "8"], "answer": "6" },
            { "question": "Which is the smallest prime number?", "options": ["1", "2", "3", "5"], "answer": "2" },
            { "question": "What is 100 divided by 4?", "options": ["20", "25", "30", "50"], "answer": "25" }
        ],
        "medium": [
            { "question": "Square root of 144?", "options": ["10", "11", "12", "14"], "answer": "12" },
            { "question": "If 3x = 15, then x is?", "options": ["3", "5", "15", "45"], "answer": "5" },
            { "question": "Sum of angles in a triangle?", "options": ["90", "180", "270", "360"], "answer": "180" },
            { "question": "What is 10% of 500?", "options": ["5", "50", "100", "500"], "answer": "50" },
            { "question": "A dozen is how many units?", "options": ["10", "12", "20", "24"], "answer": "12" }
        ],
        "hard": [
            { "question": "Value of Pi up to 2 decimal places?", "options": ["3.12", "3.14", "3.16", "3.18"], "answer": "3.14" },
            { "question": "Area of a circle formula?", "options": ["2πr", "πr²", "πd", "2πr²"], "answer": "πr²" },
            { "question": "What is 2 to the power of 5?", "options": ["10", "16", "32", "64"], "answer": "32" },
            { "question": "Hypotenuse of a triangle with sides 3 and 4?", "options": ["5", "6", "7", "12"], "answer": "5" },
            { "question": "What is the degree of a quadratic equation?", "options": ["1", "2", "3", "0"], "answer": "2" }
        ]
    },
    // Adding more fallbacks for variety
    "science": {
        "easy": [
            { "question": "What gas do humans breathe out?", "options": ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], "answer": "Carbon Dioxide" },
            { "question": "Boiling point of water in Celsius?", "options": ["50", "90", "100", "120"], "answer": "100" }
        ]
    },
    "english": {
        "easy": [
            { "question": "Plural of 'Cat'?", "options": ["Cats", "Cates", "Caties", "Cata"], "answer": "Cats" }
        ]
    },
    "general knowledge": {
        "easy": [
            { "question": "Capital of India?", "options": ["Mumbai", "Delhi", "Kolkata", "Chennai"], "answer": "Delhi" }
        ]
    }
};

const Quiz = {
    allQuestions: [],
    currentQuestionIndex: 0,
    userAnswers: {},
    flagged: new Set(),
    timeLeft: 600, 
    timerInterval: null,
    warnings: 0,

    init: async () => {
        const topic = localStorage.getItem('qb_active_topic') || 'maths';
        const diff = (localStorage.getItem('qb_active_diff') || 'easy').toLowerCase();
        const count = parseInt(localStorage.getItem('qb_active_count')) || 10;

        console.group("🚀 QUIZBYTEE ENGINE RELOADED");
        
        // Tier 1: PDF Questions
        const pdfGenerated = localStorage.getItem('qb_generated_quiz');
        if (pdfGenerated) {
            console.log("Source: PDF Generated questions found!");
            Quiz.allQuestions = JSON.parse(pdfGenerated);
            localStorage.removeItem('qb_generated_quiz'); // Clear for next use
        }

        // Tier 2: Fetch JSON
        if (Quiz.allQuestions.length === 0) {
            try {
                const response = await fetch('data/questions.json');
                const data = await response.json();
                const subject = topic.toLowerCase();
                
                if (data[subject] && data[subject][diff]) {
                    console.log(`Source: Data found in JSON for ${subject} [${diff}]`);
                    let pool = Quiz.shuffle([...data[subject][diff]]);
                    Quiz.allQuestions = pool.slice(0, count);
                }
            } catch (err) {
                console.warn("Tier 2 fetch failed, moving to Tier 3 fallback.");
            }
        }

        // Tier 3: Emergency Fallback
        if (Quiz.allQuestions.length === 0) {
            console.log("Source: Using hardcoded fallback.");
            const subject = FallbackData[topic.toLowerCase()] ? topic.toLowerCase() : "maths";
            const level = FallbackData[subject][diff] ? diff : "easy";
            Quiz.allQuestions = Quiz.shuffle([...FallbackData[subject][level]]).slice(0, count);
        }

        // Safety: Ensure not empty
        if (Quiz.allQuestions.length === 0) {
            Quiz.allQuestions = [...FallbackData.maths.easy];
        }

        // Finalize Question Set (Shuffle Options)
        Quiz.allQuestions = Quiz.allQuestions.map(q => ({
            ...q,
            options: Quiz.shuffle([...q.options])
        }));

        Quiz.timeLeft = Quiz.allQuestions.length * 60;
        console.log("Questions Loaded:", Quiz.allQuestions.length);
        console.groupEnd();

        // UI SYNC
        document.getElementById('quiz-topic-title').innerText = topic.charAt(0).toUpperCase() + topic.slice(1);
        document.getElementById('total-q-num').innerText = Quiz.allQuestions.length;
        document.getElementById('remaining-count').innerText = Quiz.allQuestions.length;

        // START UI
        Quiz.showInstructions();
        Quiz.renderGrid();
        Quiz.renderQuestion(0);
        Quiz.startTimer();
        Quiz.setupSecurity();
    },

    shuffle: (array) => {
        let m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    },

    showInstructions: () => {
        const modal = document.getElementById('instruction-popup');
        const timerDisplay = document.getElementById('instruction-timer');
        if (!modal || !timerDisplay) return;

        modal.classList.remove('hidden');
        let count = 5;
        const interval = setInterval(() => {
            count--;
            timerDisplay.innerText = count;
            if (count <= 0) {
                clearInterval(interval);
                modal.classList.add('hidden');
            }
        }, 1000);
    },

    renderQuestion: (index) => {
        Quiz.currentQuestionIndex = index;
        const q = Quiz.allQuestions[index];
        if (!q) return;

        const qText = document.getElementById('question-text');
        const optionsBox = document.getElementById('options-container');
        const currentNumDisplay = document.getElementById('current-q-num');

        // Update UI
        qText.innerText = q.question;
        currentNumDisplay.innerText = index + 1;
        
        optionsBox.innerHTML = q.options.map((opt, i) => `
            <button class="option-btn p-6 rounded-2xl border-2 transition-all flex items-center gap-6 group ${Quiz.userAnswers[index] === opt ? 'border-indigo-600 bg-indigo-600/5' : 'border-slate-800'}" onclick="Quiz.selectOption('${opt.replace(/'/g, "\\'")}')">
                <span class="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all">${String.fromCharCode(65 + i)}</span>
                <span class="text-xl font-medium">${opt}</span>
            </button>
        `).join('');

        Quiz.updateNavigation();
        Quiz.renderGrid();
    },

    selectOption: (opt) => {
        Quiz.userAnswers[Quiz.currentQuestionIndex] = opt;
        Quiz.renderQuestion(Quiz.currentQuestionIndex);
        Quiz.updateProgress();
    },

    renderGrid: () => {
        const grid = document.getElementById('question-grid');
        grid.innerHTML = Quiz.allQuestions.map((_, i) => `
            <button class="w-12 h-12 rounded-xl flex items-center justify-center font-black transition-all ${Quiz.currentQuestionIndex === i ? 'ring-2 ring-indigo-500 ring-offset-4 ring-offset-[#0f172a]' : ''} ${Quiz.userAnswers[i] ? 'bg-emerald-600 text-white' : Quiz.flagged.has(i) ? 'bg-amber-500 text-white' : 'bg-slate-800/50 text-slate-500'}" onclick="Quiz.renderQuestion(${i})">
                ${i + 1}
            </button>
        `).join('');
    },

    updateNavigation: () => {
        const nextBtn = document.querySelector('button[onclick="Quiz.next()"]');
        if (nextBtn) {
            nextBtn.innerHTML = Quiz.currentQuestionIndex === Quiz.allQuestions.length - 1 ? 
                `Finish Challenge <i data-lucide="check" class="w-5 h-5 ml-2"></i>` : 
                `Next <i data-lucide="arrow-right" class="w-5 h-5 ml-2"></i>`;
            if (window.lucide) lucide.createIcons();
        }
    },

    prev: () => { if (Quiz.currentQuestionIndex > 0) Quiz.renderQuestion(Quiz.currentQuestionIndex - 1); },
    next: () => {
        if (Quiz.currentQuestionIndex < Quiz.allQuestions.length - 1) {
            Quiz.renderQuestion(Quiz.currentQuestionIndex + 1);
        } else {
            Quiz.submit();
        }
    },

    flag: () => {
        if (Quiz.flagged.has(Quiz.currentQuestionIndex)) Quiz.flagged.delete(Quiz.currentQuestionIndex);
        else Quiz.flagged.add(Quiz.currentQuestionIndex);
        Quiz.renderGrid();
    },

    clear: () => {
        delete Quiz.userAnswers[Quiz.currentQuestionIndex];
        Quiz.renderQuestion(Quiz.currentQuestionIndex);
        Quiz.updateProgress();
    },

    updateProgress: () => {
        const answeredCount = Object.keys(Quiz.userAnswers).length;
        document.getElementById('answered-count').innerText = answeredCount;
        document.getElementById('remaining-count').innerText = Quiz.allQuestions.length - answeredCount;
    },

    startTimer: () => {
        if (Quiz.timerInterval) clearInterval(Quiz.timerInterval);
        Quiz.timerInterval = setInterval(() => {
            Quiz.timeLeft--;
            const mins = Math.floor(Quiz.timeLeft / 60);
            const secs = Quiz.timeLeft % 60;
            document.getElementById('timer-text').innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            
            if (Quiz.timeLeft <= 0) {
                clearInterval(Quiz.timerInterval);
                Quiz.submit("Time is up!");
            }
        }, 1000);
    },

    setupSecurity: () => {
        window.onblur = () => {
            Quiz.warnings++;
            const warningBox = document.getElementById('tab-warning-box');
            if (warningBox) warningBox.classList.remove('hidden');

            if (Quiz.warnings >= 3) {
                Quiz.submit("Automatic submission due to multiple tab switches.");
            } else {
                alert(`Security Warning (${Quiz.warnings}/3): Please do not leave the quiz tab.`);
            }
        };
    },

    submit: (reason = "") => {
        clearInterval(Quiz.timerInterval);
        
        let correct = 0;
        Quiz.allQuestions.forEach((q, idx) => {
            if (Quiz.userAnswers[idx] === q.answer) correct++;
        });

        const accuracy = Math.round((correct / Quiz.allQuestions.length) * 100);
        
        localStorage.setItem('qb_last_score', accuracy);
        localStorage.setItem('qb_correct_count', correct);
        localStorage.setItem('qb_total_count', Quiz.allQuestions.length);
        
        alert(`Quiz Submitted! ${reason}\nScore: ${correct}/${Quiz.allQuestions.length} (${accuracy}%)`);
        window.location.href = 'profile.html';
    }
};

window.onload = () => Quiz.init();

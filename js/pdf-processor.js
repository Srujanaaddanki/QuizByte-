/**
 * QUIZBYTEE: PDF GENERATION ENGINE 2.0
 * Robust text extraction and fact-based MCQ generation.
 */

const PDFProcessor = {
    pdfjsLib: window['pdfjs-dist/build/pdf'],

    init: () => {
        PDFProcessor.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) generateBtn.onclick = () => PDFProcessor.processFile();
    },

    processFile: async () => {
        const fileInput = document.getElementById('file-input');
        const file = fileInput.files[0];
        if (!file) return alert("Please select a PDF file first.");

        const progressBar = document.getElementById('progress-bar');
        const progressContainer = document.getElementById('progress-container');
        progressBar.style.width = '0%';
        progressContainer.style.display = 'block';

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await PDFProcessor.pdfjsLib.getDocument(arrayBuffer).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                fullText += content.items.map(item => item.str).join(" ") + " ";
                progressBar.style.width = `${Math.round((i / pdf.numPages) * 100)}%`;
            }

            const questions = PDFProcessor.generateQuestions(fullText);
            
            if (questions.length < 3) {
                throw new Error("Could not extract enough meaningful facts from this file.");
            }

            // Save and Redirect
            localStorage.setItem('qb_generated_quiz', JSON.stringify(questions));
            localStorage.setItem('qb_active_topic', 'AI Generated (PDF)');
            localStorage.setItem('qb_active_diff', 'Dynamic');
            localStorage.setItem('qb_active_count', questions.length.toString());

            alert(`AI Engine success: Generated ${questions.length} questions!`);
            window.location.href = 'quiz.html';

        } catch (error) {
            console.error("PDF Process Error:", error);
            alert("Failed to process PDF: " + error.message);
            progressContainer.style.display = 'none';
        }
    },

    generateQuestions: (text) => {
        const cleanText = text.replace(/\s+/g, ' ').trim();
        // Improved sentence split (handles common abbreviations)
        const sentences = cleanText.split(/(?<!\b(?:Mr|Ms|Dr|St|e\.g|i\.e))\.\s+/);
        
        const facts = [];
        const patterns = [
            { regex: /^(.*?)\b(is|was|are|were)\b\s+(.*)$/i, type: 'linking' },
            { regex: /^(.*?)\b(means|defines|represents|results in)\b\s+(.*)$/i, type: 'definition' },
            { regex: /^(.*?)\s+(at|on|in)\s+(\d+|[A-Z][a-z]+)\s+(.*)$/ , type: 'temporal' }
        ];

        // Collect all nouns for distractor pool
        const words = cleanText.split(/\s+/);
        const nounPool = [...new Set(words.filter(w => w.length > 5 && /^[A-Z]/.test(w)))];

        for (let s of sentences) {
            if (s.length < 30 || s.length > 200) continue;

            for (let p of patterns) {
                const match = s.match(p.regex);
                if (match && facts.length < 15) {
                    const subject = match[1].trim();
                    const predicate = match[3].trim().split(/[.!,;]/)[0];
                    
                    if (subject.length > 2 && predicate.length > 2) {
                        // Generate distractors from the pool
                        let distractors = nounPool
                            .filter(n => !s.includes(n))
                            .sort(() => 0.5 - Math.random())
                            .slice(0, 3);
                        
                        // Ensure we have 3 distractors
                        while (distractors.length < 3) {
                            distractors.push(`Concept ${distractors.length + 1}`);
                        }

                        facts.push({
                            question: `Based on the text, what ${p.type === 'linking' ? match[2] : 'describes'} ${subject}?`,
                            options: [predicate, ...distractors],
                            answer: predicate
                        });
                        break;
                    }
                }
            }
        }

        return facts;
    }
};

window.addEventListener('DOMContentLoaded', () => PDFProcessor.init());

document.addEventListener('DOMContentLoaded', () => {
    let currentQuestionIndex = 0;
    let score = 0;
    let selectedOptionIndex = null;
    let isAnswered = false;

    // Initialize Lucide Icons
    lucide.createIcons();

    // DOM Elements
    const landingSection = document.getElementById('landing-section');
    const loadingSection = document.getElementById('loading-section');
    const quizSection = document.getElementById('quiz-section');
    const resultSection = document.getElementById('result-section');
    const feedbackBar = document.getElementById('feedback-bar');

    const startBtn = document.getElementById('start-btn');
    const checkBtn = document.getElementById('check-btn');
    const continueBtn = document.getElementById('continue-btn');
    const restartBtn = document.getElementById('restart-btn');

    const questionNumber = document.getElementById('question-number');
    const questionText = document.getElementById('question-text');
    const optionsGrid = document.getElementById('options-grid');
    const progressBar = document.getElementById('progress-bar');

    const questionImageContainer = document.getElementById('question-image-container');
    const questionImage = document.getElementById('question-image');

    const resultTitle = document.getElementById('result-title');
    const resultDescription = document.getElementById('result-description');
    const finalScore = document.getElementById('final-score');
    const correctCountDisplay = document.getElementById('correct-count');
    const wrongCountDisplay = document.getElementById('wrong-count');

    const feedbackHeader = document.getElementById('feedback-header');
    const feedbackMessage = document.getElementById('feedback-message');

    // Start Quiz
    startBtn.addEventListener('click', () => {
        // Transition: Landing -> Loading
        landingSection.style.display = 'none';
        const loadingBar = loadingSection.querySelector('#loading-progress-bar');
        const loadingStatus = loadingSection.querySelector('.loading-status');

        loadingSection.style.display = 'block';

        // Simulate Loading Progress
        let progress = 0;
        const statuses = [
            "Membuka arsip koleksi...",
            "Menyiapkan artefak virtual...",
            "Sinkronisasi data sejarah...",
            "Siap berangkat!"
        ];

        const loadInterval = setInterval(() => {
            progress += 0.8; // Slower, smoother fill
            if (loadingBar) loadingBar.style.width = `${Math.min(progress, 100)}%`;

            if (Math.floor(progress) % 25 === 0 && Math.floor(progress) > 0) {
                loadingStatus.textContent = statuses[Math.floor(progress / 25) - 1] || statuses[3];
            }

            if (progress >= 100) {
                clearInterval(loadInterval);
                setTimeout(() => {
                    // Transition: Loading -> Quiz
                    loadingSection.style.display = 'none';
                    quizSection.style.display = 'block';
                    loadQuestion();
                }, 500);
            }
        }, 20);
    });

    // Load Question
    function loadQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        const quizWindowTitle = document.getElementById('quiz-window-title');
        const quizLayoutGrid = document.getElementById('quiz-layout-grid');

        // Reset and trigger transition
        quizLayoutGrid.classList.remove('slide-in');
        void quizLayoutGrid.offsetWidth; // Trigger reflow
        quizLayoutGrid.classList.add('slide-in');

        const imageSide = document.querySelector('.quiz-image-side');

        if (quizWindowTitle) {
            quizWindowTitle.textContent = `Arsip Sejarah #${currentQuestionIndex + 1}`;
        }

        // Handle Image Availability
        if (currentQuestion.imageUrl && currentQuestion.imageUrl.trim() !== '') {
            quizLayoutGrid.classList.remove('no-image');
            if (imageSide) imageSide.style.display = 'block';
            questionImageContainer.style.display = 'block';
            questionImage.src = currentQuestion.imageUrl;

            // Handle loading states
            questionImage.style.display = 'none';
            questionImage.onerror = () => {
                questionImageContainer.style.background = '#f0f0f0';
                questionImage.style.display = 'none';
                console.warn(`Gagal memuat gambar: ${currentQuestion.imageUrl}`);
            };
            questionImage.onload = () => {
                questionImage.style.display = 'block';
            };
        } else {
            quizLayoutGrid.classList.add('no-image');
            if (imageSide) imageSide.style.display = 'none';
            questionImageContainer.style.display = 'none';
        }

        selectedOptionIndex = null;
        isAnswered = false;
        // Show check button but keep it disabled until selection
        checkBtn.style.display = 'block';
        checkBtn.disabled = true;
        checkBtn.classList.remove('active');
        feedbackBar.classList.remove('show', 'correct', 'incorrect');

        // Clear question-specific animation classes
        quizSection.classList.remove('shake');

        // Update UI
        const qNum = currentQuestionIndex + 1;
        questionNumber.textContent = `Pertanyaan ${qNum < 10 ? '0' + qNum : qNum}/${questions.length}`;
        questionText.textContent = currentQuestion.question;

        // Progress Bar
        const progress = (currentQuestionIndex / questions.length) * 100;
        progressBar.style.width = `${progress}%`;

        // Clear and add options
        optionsGrid.innerHTML = '';
        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            const classList = ['option-a', 'option-b', 'option-c', 'option-d'];
            button.className = `option-btn ${classList[index] || ''}`;

            const letter = String.fromCharCode(65 + index);
            button.innerHTML = `
                <span class="letter">${letter}</span>
                <span class="text">${option}</span>
            `;

            button.addEventListener('click', () => selectOption(index, button));
            optionsGrid.appendChild(button);
        });
    }

    // Select Option
    function selectOption(index, element) {
        if (isAnswered) return;

        selectedOptionIndex = index;

        // Clear previous selections
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach(opt => opt.classList.remove('selected'));

        // Mark current selection
        element.classList.add('selected');

        // Enable check button
        checkBtn.disabled = false;
        checkBtn.classList.add('active');
        checkBtn.style.display = 'block'; // Show when selected
    }

    // Celebrate high score
    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = ['#961B27', '#D6B138', '#2ecc71', '#3498db'][Math.floor(Math.random() * 4)];
            confetti.style.animationDuration = (Math.random() * 3 + 2) + 's';
            confetti.style.opacity = Math.random();
            document.body.appendChild(confetti);
            setTimeout(() => confetti.remove(), 5000);
        }
    }

    // Check Answer
    checkBtn.addEventListener('click', () => {
        if (selectedOptionIndex === null || isAnswered) return;

        isAnswered = true;
        checkBtn.disabled = true;
        checkBtn.classList.remove('active');

        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedOptionIndex === currentQuestion.answer;

        // Gamified Feedback
        if (isCorrect) {
            score++;
            feedbackHeader.textContent = "Jawaban Benar";
            feedbackBar.classList.add('correct');
            // Sound Placeholder: new Audio('correct.mp3').play();
        } else {
            feedbackHeader.textContent = "Jawaban Kurang Tepat";
            feedbackBar.classList.add('incorrect');

            // Haptic Feedback (Vibration)
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]); // Short double pulse
            }

            // Enhanced Shake Animation
            // Remove previous classes that might interfere
            quizSection.classList.remove('shake', 'entrance', 'slide-in');
            void quizSection.offsetWidth; // Force reflow to restart animation
            quizSection.classList.add('shake');

            // Cleanup shake class after animation finishes
            setTimeout(() => {
                quizSection.classList.remove('shake');
            }, 500);
        }

        // Show Fun Fact in feedback message
        feedbackMessage.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 0.2rem;">${isCorrect ? 'Jawaban Benar!' : 'Jawaban: ' + currentQuestion.options[currentQuestion.answer]}</div>
            <div>${currentQuestion.funFact}</div>
        `;

        // Highlight options
        const allOptions = document.querySelectorAll('.option-btn');
        allOptions.forEach((opt, idx) => {
            opt.disabled = true;
            if (idx === currentQuestion.answer) {
                opt.classList.add('is-correct');
            } else if (idx === selectedOptionIndex && !isCorrect) {
                opt.classList.add('is-incorrect');
            }
        });

        feedbackBar.classList.add('show');
    });

    // Continue
    continueBtn.addEventListener('click', () => {
        // Add animation class
        continueBtn.classList.add('animating');

        setTimeout(() => {
            // Clear previous animation classes
            quizSection.classList.remove('entrance', 'slide-in', 'slide-out', 'shake');
            void quizSection.offsetWidth; // Trigger reflow

            // Out animation
            quizSection.classList.add('slide-out');
            feedbackBar.classList.remove('show');

            setTimeout(() => {
                // Reset button state for next time
                continueBtn.classList.remove('animating');

                currentQuestionIndex++;
                if (currentQuestionIndex < questions.length) {
                    loadQuestion();
                    quizSection.classList.remove('slide-out');
                    quizSection.classList.add('slide-in');
                } else {
                    showResults();
                }
            }, 300); // Wait for slide-out
        }, 600); // Wait for filling animation (match CSS transition)
    });

    // Results logic with titles
    function showResults() {
        quizSection.style.display = 'none';
        quizSection.classList.remove('entrance', 'slide-in', 'slide-out', 'shake');
        feedbackBar.classList.remove('show');
        resultSection.style.display = 'block';
        resultSection.classList.add('entrance');

        const percentage = Math.round((score / questions.length) * 100);

        // Count up animation for score
        let currentCount = 0;
        const countInterval = setInterval(() => {
            if (currentCount >= percentage) {
                finalScore.textContent = percentage;
                clearInterval(countInterval);
            } else {
                currentCount += 2;
                finalScore.textContent = currentCount;
            }
        }, 30);

        correctCountDisplay.textContent = score;
        wrongCountDisplay.textContent = questions.length - score;
        // Title based on score
        let title = "";
        let desc = "";
        let animClass = "";

        if (score <= 3) {
            title = "Pengunjung Galeri";
            desc = "Kamu menikmati jalan-jalan di museum dengan santai, jadi gelar Pengunjung Galeri pas banget buatmu.";
            animClass = "title-lvl-1";
        } else if (score <= 6) {
            title = "Penjelajah Galeri";
            desc = "Semangatmu menjelajahi tiap sudut museum bikin kamu layak disebut Penjelajah Galeri.";
            animClass = "title-lvl-2";
        } else if (score <= 9) {
            title = "Peneliti Artefak";
            desc = "Instingmu tajam dalam membaca koleksi, makanya kamu jadi Peneliti Artefak.";
            animClass = "title-lvl-3";
            createConfetti();
        } else {
            title = "Arkeolog Legendaris";
            desc = "Pengetahuanmu soal museum luar biasa, kamu resmi menyandang gelar Arkeolog Legendaris.";
            animClass = "title-lvl-4";
            createConfetti();
            createConfetti();
        }

        resultTitle.textContent = title;
        resultTitle.className = `title-animated ${animClass}`;
        resultDescription.textContent = desc;
        progressBar.style.width = '100%';

        // Render new icons in results if any
        lucide.createIcons();
    }

    // Restart
    restartBtn.addEventListener('click', () => {
        currentQuestionIndex = 0;
        score = 0;
        // Reset all sections and classes
        resultSection.classList.remove('entrance');
        quizSection.classList.remove('entrance', 'slide-in', 'slide-out', 'shake');
        resultTitle.className = ""; // Reset animation classes

        resultSection.style.display = 'none';
        landingSection.style.display = 'block';
        progressBar.style.width = '0%';
    });

    // Disable right-click context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
});

/**
 * Quizzes Module - Gerencia simulados e tentativas
 */
class QuizzesModule {
    constructor() {
        this.currentQuiz = null;
        this.currentQuestionIndex = 0;
        this.answers = {};
    }

    /**
     * Renderizar lista de quizzes
     */
    renderQuizzes() {
        const quizzes = storage.getQuizzes();
        const container = document.getElementById('quizzesList');

        if (!container) return;

        if (quizzes.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum simulado disponível. Envie um material primeiro!</p>';
            return;
        }

        container.innerHTML = quizzes.map(quiz => `
            <div class="quiz-card">
                <p class="quiz-title">${quiz.title}</p>
                <p class="quiz-info">
                    📚 ${quiz.subject || 'Geral'} | 
                    ❓ ${quiz.questions.length} questões
                </p>
                <div class="quiz-actions">
                    <button class="btn btn-primary" onclick="quizzes.startQuiz(${quiz.id})">
                        Iniciar
                    </button>
                    <button class="btn btn-secondary" onclick="quizzes.viewResults(${quiz.id})">
                        Resultados
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Iniciar quiz
     */
    startQuiz(quizId) {
        this.currentQuiz = storage.getQuizById(quizId);
        if (!this.currentQuiz) return;

        this.currentQuestionIndex = 0;
        this.answers = {};

        app.showPage('quiz-session');
        this.renderQuestion();
    }

    /**
     * Renderizar questão
     */
    renderQuestion() {
        if (!this.currentQuiz) return;

        const question = this.currentQuiz.questions[this.currentQuestionIndex];
        if (!question) {
            this.submitQuiz();
            return;
        }

        // Atualizar título
        const quizTitle = document.getElementById('quizTitle');
        if (quizTitle) {
            quizTitle.textContent = this.currentQuiz.title;
        }

        // Atualizar progresso
        const questionCounter = document.getElementById('questionCounter');
        if (questionCounter) {
            questionCounter.textContent = `${this.currentQuestionIndex + 1}/${this.currentQuiz.questions.length}`;
        }

        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = ((this.currentQuestionIndex) / this.currentQuiz.questions.length) * 100;
            progressFill.style.width = progress + '%';
        }

        // Renderizar conteúdo da questão
        const quizContent = document.getElementById('quizContent');
        if (quizContent) {
            quizContent.innerHTML = `
                <div class="question-text">${question.question}</div>
                <div class="options-list">
                    ${question.options.map((option, index) => `
                        <label class="option">
                            <input type="radio" name="answer" value="${index}" 
                                ${this.answers[this.currentQuestionIndex] === index ? 'checked' : ''}>
                            <span>${option}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="quiz-controls">
                    ${this.currentQuestionIndex > 0 ? `
                        <button class="btn btn-secondary" onclick="quizzes.previousQuestion()">
                            ← Anterior
                        </button>
                    ` : ''}
                    ${this.currentQuestionIndex < this.currentQuiz.questions.length - 1 ? `
                        <button class="btn btn-primary" onclick="quizzes.nextQuestion()">
                            Próxima →
                        </button>
                    ` : `
                        <button class="btn btn-primary" onclick="quizzes.submitQuiz()">
                            Finalizar
                        </button>
                    `}
                </div>
            `;

            // Adicionar event listeners aos radios
            const radios = quizContent.querySelectorAll('input[type="radio"]');
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    this.answers[this.currentQuestionIndex] = parseInt(e.target.value);
                });
            });
        }
    }

    /**
     * Próxima questão
     */
    nextQuestion() {
        if (this.currentQuestionIndex < this.currentQuiz.questions.length - 1) {
            this.currentQuestionIndex++;
            this.renderQuestion();
        }
    }

    /**
     * Questão anterior
     */
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.renderQuestion();
        }
    }

    /**
     * Submeter quiz
     */
    async submitQuiz() {
        if (!this.currentQuiz) return;

        // Calcular resultado
        let correctCount = 0;
        const feedback = [];

        for (let i = 0; i < this.currentQuiz.questions.length; i++) {
            const question = this.currentQuiz.questions[i];
            const selectedIndex = this.answers[i];
            const isCorrect = selectedIndex === question.correctIndex;

            if (isCorrect) correctCount++;

            feedback.push({
                questionIndex: i,
                question: question.question,
                selectedIndex,
                correctIndex: question.correctIndex,
                isCorrect,
                explanation: question.explanation,
                selectedOption: question.options[selectedIndex] || 'Não respondida',
                correctOption: question.options[question.correctIndex]
            });
        }

        const score = (correctCount / this.currentQuiz.questions.length) * 100;

        // Salvar tentativa
        const attempt = storage.addQuizAttempt({
            quizId: this.currentQuiz.id,
            score,
            correctCount,
            totalQuestions: this.currentQuiz.questions.length,
            feedback
        });

        // Mostrar resultados
        this.showResults(attempt, feedback);
    }

    /**
     * Mostrar resultados
     */
    showResults(attempt, feedback) {
        const quizContent = document.getElementById('quizContent');
        if (!quizContent) return;

        const scoreColor = attempt.score >= 70 ? '#00d9a3' : attempt.score >= 50 ? '#ffa500' : '#ff4757';

        quizContent.innerHTML = `
            <div style="text-align: center; margin-bottom: 30px;">
                <div style="font-size: 60px; color: ${scoreColor}; font-weight: bold; margin-bottom: 10px;">
                    ${Math.round(attempt.score)}%
                </div>
                <p style="color: var(--text-muted); font-size: 18px;">
                    ${attempt.correctCount} de ${attempt.totalQuestions} questões corretas
                </p>
            </div>

            <div style="margin-bottom: 30px;">
                <h3 style="color: var(--accent); margin-bottom: 20px;">Feedback Detalhado</h3>
                ${feedback.map((item, index) => `
                    <div style="background-color: rgba(0, 217, 163, 0.05); border-left: 3px solid ${item.isCorrect ? '#00d9a3' : '#ff4757'}; padding: 15px; margin-bottom: 15px; border-radius: 6px;">
                        <p style="color: var(--accent); font-weight: 600; margin-bottom: 8px;">
                            Questão ${index + 1}: ${item.isCorrect ? '✓ Correta' : '✗ Incorreta'}
                        </p>
                        <p style="color: var(--text-light); margin-bottom: 10px;">${item.question}</p>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 8px;">
                            <strong>Sua resposta:</strong> ${item.selectedOption}
                        </p>
                        ${!item.isCorrect ? `
                            <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 8px;">
                                <strong>Resposta correta:</strong> ${item.correctOption}
                            </p>
                        ` : ''}
                        <p style="color: var(--text-light); font-size: 13px; line-height: 1.6;">
                            <strong>Explicação:</strong> ${item.explanation}
                        </p>
                    </div>
                `).join('')}
            </div>

            <div class="quiz-controls">
                <button class="btn btn-secondary" onclick="quizzes.startQuiz(${this.currentQuiz.id})">
                    Tentar Novamente
                </button>
                <button class="btn btn-primary" onclick="app.showPage('quizzes')">
                    Voltar aos Simulados
                </button>
            </div>
        `;
    }

    /**
     * Ver resultados anteriores
     */
    viewResults(quizId) {
        const attempts = storage.getQuizAttempts().filter(a => a.quizId === quizId);
        
        if (attempts.length === 0) {
            alert('Nenhuma tentativa registrada para este simulado');
            return;
        }

        const modal = document.getElementById('quizModal');
        const modalBody = document.getElementById('modalBody');

        if (modal && modalBody) {
            modalBody.innerHTML = `
                <h2 style="color: var(--accent); margin-bottom: 20px;">Histórico de Tentativas</h2>
                ${attempts.map((attempt, index) => `
                    <div style="background-color: var(--card-bg); border: 1px solid var(--border-color); padding: 15px; margin-bottom: 15px; border-radius: 8px;">
                        <p style="color: var(--accent); font-weight: 600;">Tentativa ${index + 1}</p>
                        <p style="color: var(--text-muted); font-size: 13px; margin-bottom: 10px;">
                            ${new Date(attempt.completedAt).toLocaleString('pt-BR')}
                        </p>
                        <p style="color: var(--text-light); font-size: 18px; font-weight: bold;">
                            ${Math.round(attempt.score)}% - ${attempt.correctCount}/${attempt.totalQuestions}
                        </p>
                    </div>
                `).join('')}
            `;

            modal.classList.add('show');
        }
    }
}

// Instância global
const quizzes = new QuizzesModule();

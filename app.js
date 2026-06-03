/**
 * App Module - Lógica principal da aplicação
 */
class AppModule {
    constructor() {
        this.currentPage = 'home';
        this.setupEventListeners();
        this.initializeApp();
    }

    /**
     * Inicializar aplicação
     */
    initializeApp() {
        // Verificar autenticação
        if (!auth.isAuthenticated()) {
            return;
        }

        // Carregar dados iniciais
        materials.renderMaterials();
        quizzes.renderQuizzes();
        flashcards.renderFlashcards();
        dashboard.updateDashboard();

        // Atualizar timer display
        timer.updateDisplay();

        // Mostrar página inicial
        this.showPage('home');

        // Atualizar dashboard a cada minuto
        setInterval(() => {
            if (this.currentPage === 'dashboard' && auth.isAuthenticated()) {
                dashboard.updateDashboard();
            }
        }, 60000);

        // Atualizar nome do usuário
        const user = auth.getCurrentUser();
        if (user) {
            const userName = document.getElementById('userName');
            if (userName) {
                userName.textContent = user.name;
            }
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Verificar autenticação
        if (!auth.isAuthenticated()) {
            document.getElementById('auth-page').classList.add('active');
            return;
        }

        // Navegação
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page) {
                    this.showPage(page);
                }
            });
        });

        // Menu toggle mobile
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.querySelector('.navbar-menu');
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Botão de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Tem certeza que deseja sair?')) {
                    auth.logout();
                    location.reload();
                }
            });
        }

        // Timer controls
        const startTimerBtn = document.getElementById('startTimerBtn');
        const pauseTimerBtn = document.getElementById('pauseTimerBtn');
        const resetTimerBtn = document.getElementById('resetTimerBtn');

        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', () => {
                if (timer.isPaused) {
                    timer.resume();
                } else {
                    timer.start();
                }
            });
        }

        if (pauseTimerBtn) {
            pauseTimerBtn.addEventListener('click', () => {
                timer.pause();
            });
        }

        if (resetTimerBtn) {
            resetTimerBtn.addEventListener('click', () => {
                timer.reset();
            });
        }

        // Atualizar configurações do timer
        const studyDuration = document.getElementById('studyDuration');
        const shortBreak = document.getElementById('shortBreak');

        if (studyDuration) {
            studyDuration.addEventListener('change', (e) => {
                timer.updateSettings({ studyDuration: parseInt(e.target.value) });
            });
        }

        if (shortBreak) {
            shortBreak.addEventListener('change', (e) => {
                timer.updateSettings({ shortBreak: parseInt(e.target.value) });
            });
        }

        // Botão de início na home
        const startBtn = document.getElementById('startBtn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.showPage('dashboard');
            });
        }

        // Modal close
        const modal = document.getElementById('quizModal');
        const closeBtn = document.querySelector('.close');
        if (modal && closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
            });

            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }

        // Carregar configurações do timer
        const settings = storage.getPomodoroSettings();
        if (studyDuration) studyDuration.value = settings.studyDuration;
        if (shortBreak) shortBreak.value = settings.shortBreak;
    }

    /**
     * Mostrar página
     */
    showPage(pageName) {
        // Atualizar página atual
        this.currentPage = pageName;

        // Esconder todas as páginas
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // Mostrar página selecionada
        const pageElement = document.getElementById(`${pageName}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
        }

        // Atualizar botões de navegação
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === pageName) {
                btn.classList.add('active');
            }
        });

        // Fechar menu mobile
        const navMenu = document.querySelector('.navbar-menu');
        if (navMenu) {
            navMenu.classList.remove('active');
        }

        // Ações específicas por página
        switch (pageName) {
            case 'dashboard':
                dashboard.updateDashboard();
                break;
            case 'timer':
                timer.updateDisplay();
                break;
            case 'materials':
                materials.renderMaterials();
                break;
            case 'quizzes':
                quizzes.renderQuizzes();
                break;
            case 'flashcards':
                flashcards.renderFlashcards();
                break;
            case 'review':
                this.renderReviewPage();
                break;
        }

        // Scroll para o topo
        window.scrollTo(0, 0);
    }

    /**
     * Renderizar página de revisão
     */
    renderReviewPage() {
        const reviews = storage.getUpcomingReviews();
        const container = document.getElementById('reviewCalendar');

        if (!container) return;

        if (reviews.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma revisão agendada</p>';
            return;
        }

        // Agrupar por data
        const grouped = {};
        reviews.forEach(review => {
            const date = new Date(review.dueDate).toLocaleDateString('pt-BR');
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(review);
        });

        container.innerHTML = Object.entries(grouped).map(([date, items]) => `
            <div class="review-day">
                <p class="review-day-date">${date}</p>
                <div class="review-items-list">
                    ${items.map(item => `
                        <div class="review-item-mini">
                            ${item.topic}
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" 
                    onclick="app.startReviewSession('${items[0].id}')">
                    Revisar
                </button>
            </div>
        `).join('');
    }

    /**
     * Iniciar sessão de revisão
     */
    startReviewSession(reviewId) {
        const reviews = storage.getUpcomingReviews();
        const review = reviews.find(r => r.id === reviewId);

        if (!review) return;

        // Mostrar interface de revisão
        const container = document.getElementById('reviewCalendar');
        if (!container) return;

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 30px; text-align: center;">
                    <h2 style="color: var(--accent); margin-bottom: 15px;">${review.topic}</h2>
                    <p style="color: var(--text-muted); margin-bottom: 30px;">
                        Quanto você se lembra deste tópico?
                    </p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="btn btn-secondary" onclick="app.completeReview('${review.id}', 1)">
                            1 - Não lembro
                        </button>
                        <button class="btn btn-secondary" onclick="app.completeReview('${review.id}', 2)">
                            2 - Lembro pouco
                        </button>
                        <button class="btn btn-secondary" onclick="app.completeReview('${review.id}', 3)">
                            3 - Lembro mais ou menos
                        </button>
                        <button class="btn btn-secondary" onclick="app.completeReview('${review.id}', 4)">
                            4 - Lembro bem
                        </button>
                        <button class="btn btn-primary" onclick="app.completeReview('${review.id}', 5)">
                            5 - Lembro perfeitamente
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Completar revisão
     */
    completeReview(reviewId, quality) {
        storage.completeReview(reviewId, quality);
        alert('Revisão registrada com sucesso!');
        this.renderReviewPage();
    }
}

// Inicializar aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppModule();
});

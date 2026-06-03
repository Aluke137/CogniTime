/**
 * Timer Module - Gerencia o timer Pomodoro
 */
class TimerModule {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.timeLeft = 0;
        this.totalTime = 0;
        this.currentSessionType = 'study'; // 'study' ou 'break'
        this.sessionCount = 0;
        this.timerInterval = null;
        this.settings = storage.getPomodoroSettings();
        this.initializeTime();
    }

    /**
     * Inicializar tempo
     */
    initializeTime() {
        this.totalTime = this.settings.studyDuration * 60;
        this.timeLeft = this.totalTime;
    }

    /**
     * Iniciar timer
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.isPaused = false;

        this.timerInterval = setInterval(() => {
            if (this.timeLeft > 0) {
                this.timeLeft--;
                this.updateDisplay();
                this.updateProgressBar();
            } else {
                this.completeSession();
            }
        }, 1000);

        this.updateButtons();
    }

    /**
     * Pausar timer
     */
    pause() {
        if (!this.isRunning) return;

        this.isRunning = false;
        this.isPaused = true;
        clearInterval(this.timerInterval);
        this.updateButtons();
    }

    /**
     * Retomar timer
     */
    resume() {
        if (!this.isPaused) return;
        this.start();
    }

    /**
     * Reiniciar timer
     */
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        clearInterval(this.timerInterval);
        this.initializeTime();
        this.updateDisplay();
        this.updateProgressBar();
        this.updateButtons();
    }

    /**
     * Completar sessão
     */
    completeSession() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
        this.isPaused = false;

        // Tocar som se ativado
        if (this.settings.soundEnabled) {
            this.playSound();
        }

        // Salvar sessão
        if (this.currentSessionType === 'study') {
            storage.addSession({
                type: 'study',
                duration: this.settings.studyDuration,
                subject: document.getElementById('materialSubject')?.value || 'Geral'
            });
            this.sessionCount++;
        }

        // Alternar entre estudo e pausa
        this.toggleSessionType();
        this.initializeTime();
        this.updateDisplay();
        this.updateProgressBar();
        this.updateButtons();

        // Mostrar notificação
        this.showNotification();
    }

    /**
     * Alternar tipo de sessão
     */
    toggleSessionType() {
        if (this.currentSessionType === 'study') {
            // Verificar se deve fazer pausa longa
            if (this.sessionCount % this.settings.sessionsUntilLongBreak === 0) {
                this.currentSessionType = 'long_break';
                this.totalTime = this.settings.longBreak * 60;
            } else {
                this.currentSessionType = 'short_break';
                this.totalTime = this.settings.shortBreak * 60;
            }
        } else {
            this.currentSessionType = 'study';
            this.totalTime = this.settings.studyDuration * 60;
        }
    }

    /**
     * Atualizar display do timer
     */
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const timerDisplay = document.getElementById('timerDisplay');
        if (timerDisplay) {
            timerDisplay.textContent = display;
        }

        const timerLabel = document.getElementById('timerLabel');
        if (timerLabel) {
            if (this.currentSessionType === 'study') {
                timerLabel.textContent = 'Sessão de Estudo';
            } else if (this.currentSessionType === 'short_break') {
                timerLabel.textContent = 'Pausa Curta';
            } else {
                timerLabel.textContent = 'Pausa Longa';
            }
        }

        const sessionsCount = document.getElementById('sessionsCount');
        if (sessionsCount) {
            sessionsCount.textContent = this.sessionCount;
        }
    }

    /**
     * Atualizar barra de progresso
     */
    updateProgressBar() {
        const percentage = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        const progressCircle = document.querySelector('.timer-progress');
        if (progressCircle) {
            const circumference = 2 * Math.PI * 95;
            const offset = circumference - (percentage / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    /**
     * Atualizar botões
     */
    updateButtons() {
        const startBtn = document.getElementById('startTimerBtn');
        const pauseBtn = document.getElementById('pauseTimerBtn');
        const resetBtn = document.getElementById('resetTimerBtn');

        if (startBtn) {
            startBtn.textContent = this.isPaused ? 'Retomar' : 'Iniciar';
            startBtn.disabled = this.isRunning;
        }

        if (pauseBtn) {
            pauseBtn.disabled = !this.isRunning;
        }

        if (resetBtn) {
            resetBtn.disabled = !this.isRunning && !this.isPaused;
        }
    }

    /**
     * Atualizar configurações
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        storage.savePomodoroSettings(this.settings);
        this.reset();
    }

    /**
     * Tocar som
     */
    playSound() {
        // Usar Web Audio API para gerar som
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.warn('Não foi possível tocar som:', e);
        }
    }

    /**
     * Mostrar notificação
     */
    showNotification() {
        const message = this.currentSessionType === 'study'
            ? 'Pausa completada! Hora de estudar.'
            : 'Sessão de estudo completada! Descanse um pouco.';

        alert(message);
    }

    /**
     * Obter tempo formatado
     */
    getFormattedTime() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    /**
     * Obter progresso (0-100)
     */
    getProgress() {
        return ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
    }
}

// Instância global
const timer = new TimerModule();

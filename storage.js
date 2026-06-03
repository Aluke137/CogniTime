/**
 * Storage Manager - Gerencia dados locais com localStorage
 */
class StorageManager {
    constructor() {
        this.prefix = 'cognitime_';
    }

    /**
     * Salvar dados
     */
    save(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
            return false;
        }
    }

    /**
     * Carregar dados
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            return defaultValue;
        }
    }

    /**
     * Remover dados
     */
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (e) {
            console.error('Erro ao remover dados:', e);
            return false;
        }
    }

    /**
     * Limpar tudo
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.error('Erro ao limpar dados:', e);
            return false;
        }
    }

    // ========== Study Sessions ==========
    saveSessions(sessions) {
        return this.save('sessions', sessions);
    }

    getSessions() {
        return this.load('sessions', []);
    }

    addSession(session) {
        const sessions = this.getSessions();
        sessions.push({
            ...session,
            id: Date.now(),
            createdAt: new Date().toISOString()
        });
        this.saveSessions(sessions);
        return sessions;
    }

    // ========== Materials ==========
    saveMaterials(materials) {
        return this.save('materials', materials);
    }

    getMaterials() {
        return this.load('materials', []);
    }

    addMaterial(material) {
        const materials = this.getMaterials();
        const newMaterial = {
            ...material,
            id: Date.now(),
            createdAt: new Date().toISOString(),
            status: 'pending'
        };
        materials.push(newMaterial);
        this.saveMaterials(materials);
        return newMaterial;
    }

    updateMaterial(id, updates) {
        const materials = this.getMaterials();
        const index = materials.findIndex(m => m.id === id);
        if (index !== -1) {
            materials[index] = { ...materials[index], ...updates };
            this.saveMaterials(materials);
            return materials[index];
        }
        return null;
    }

    getMaterialById(id) {
        const materials = this.getMaterials();
        return materials.find(m => m.id === id);
    }

    // ========== Quizzes ==========
    saveQuizzes(quizzes) {
        return this.save('quizzes', quizzes);
    }

    getQuizzes() {
        return this.load('quizzes', []);
    }

    addQuiz(quiz) {
        const quizzes = this.getQuizzes();
        const newQuiz = {
            ...quiz,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        quizzes.push(newQuiz);
        this.saveQuizzes(quizzes);
        return newQuiz;
    }

    getQuizById(id) {
        const quizzes = this.getQuizzes();
        return quizzes.find(q => q.id === parseInt(id));
    }

    // ========== Quiz Attempts ==========
    saveQuizAttempts(attempts) {
        return this.save('quiz_attempts', attempts);
    }

    getQuizAttempts() {
        return this.load('quiz_attempts', []);
    }

    addQuizAttempt(attempt) {
        const attempts = this.getQuizAttempts();
        const newAttempt = {
            ...attempt,
            id: Date.now(),
            completedAt: new Date().toISOString()
        };
        attempts.push(newAttempt);
        this.saveQuizAttempts(attempts);
        return newAttempt;
    }

    // ========== Flashcards ==========
    saveFlashcards(flashcards) {
        return this.save('flashcards', flashcards);
    }

    getFlashcards() {
        return this.load('flashcards', []);
    }

    addFlashcards(flashcards) {
        const existing = this.getFlashcards();
        const newCards = flashcards.map(card => ({
            ...card,
            id: Date.now() + Math.random(),
            createdAt: new Date().toISOString(),
            timesReviewed: 0
        }));
        existing.push(...newCards);
        this.saveFlashcards(existing);
        return newCards;
    }

    getFlashcardsByMaterial(materialId) {
        const flashcards = this.getFlashcards();
        return flashcards.filter(f => f.materialId === materialId);
    }

    updateFlashcard(id, updates) {
        const flashcards = this.getFlashcards();
        const index = flashcards.findIndex(f => f.id === id);
        if (index !== -1) {
            flashcards[index] = { ...flashcards[index], ...updates };
            this.saveFlashcards(flashcards);
            return flashcards[index];
        }
        return null;
    }

    // ========== Review Schedule ==========
    saveReviewSchedule(schedule) {
        return this.save('review_schedule', schedule);
    }

    getReviewSchedule() {
        return this.load('review_schedule', []);
    }

    addReviewItems(items) {
        const schedule = this.getReviewSchedule();
        const newItems = items.map(item => ({
            ...item,
            id: Date.now() + Math.random(),
            createdAt: new Date().toISOString(),
            completed: false,
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0
        }));
        schedule.push(...newItems);
        this.saveReviewSchedule(schedule);
        return newItems;
    }

    getUpcomingReviews(days = 7) {
        const schedule = this.getReviewSchedule();
        const now = new Date();
        const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        
        return schedule.filter(item => {
            const dueDate = new Date(item.dueDate);
            return dueDate >= now && dueDate <= futureDate && !item.completed;
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    completeReview(id, quality) {
        const schedule = this.getReviewSchedule();
        const item = schedule.find(i => i.id === id);
        
        if (!item) return null;

        // SM-2 Algorithm
        let { easeFactor, repetitions, interval } = item;
        let newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (newEaseFactor < 1.3) newEaseFactor = 1.3;

        let newInterval, newRepetitions;
        if (quality < 3) {
            newRepetitions = 0;
            newInterval = 1;
        } else {
            newRepetitions = repetitions + 1;
            if (repetitions === 0) newInterval = 1;
            else if (repetitions === 1) newInterval = 6;
            else newInterval = Math.round(interval * newEaseFactor);
        }

        const nextDue = new Date();
        nextDue.setDate(nextDue.getDate() + newInterval);

        item.completed = quality >= 3;
        item.lastReviewedAt = new Date().toISOString();
        item.interval = newInterval;
        item.easeFactor = newEaseFactor;
        item.repetitions = newRepetitions;
        item.dueDate = nextDue.toISOString();

        this.saveReviewSchedule(schedule);
        return item;
    }

    // ========== Pomodoro Settings ==========
    savePomodoroSettings(settings) {
        return this.save('pomodoro_settings', settings);
    }

    getPomodoroSettings() {
        return this.load('pomodoro_settings', {
            studyDuration: 25,
            shortBreak: 5,
            longBreak: 15,
            sessionsUntilLongBreak: 4,
            soundEnabled: true
        });
    }

    // ========== Dashboard Stats ==========
    getDashboardStats() {
        const sessions = this.getSessions();
        const quizAttempts = this.getQuizAttempts();
        const materials = this.getMaterials();
        const reviews = this.getUpcomingReviews();

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        const todaySessions = sessions.filter(s => {
            const sessionDate = new Date(s.createdAt);
            return sessionDate >= today && s.type === 'study';
        });

        const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
        const avgScore = quizAttempts.length > 0
            ? quizAttempts.slice(-10).reduce((sum, a) => sum + a.score, 0) / Math.min(quizAttempts.length, 10)
            : 0;

        return {
            todayMinutes,
            todaySessions: todaySessions.length,
            avgScore: Math.round(avgScore),
            pendingReviews: reviews.length,
            totalMaterials: materials.length,
            recentAttempts: quizAttempts.slice(-5),
            upcomingReviews: reviews.slice(0, 5),
            sessions: sessions.slice(-7)
        };
    }
}

// Instância global
const storage = new StorageManager();

/**
 * Flashcards Module - Gerencia flashcards
 */
class FlashcardsModule {
    constructor() {
        this.currentCards = [];
        this.currentIndex = 0;
    }

    /**
     * Renderizar lista de flashcards
     */
    renderFlashcards() {
        const flashcards = storage.getFlashcards();
        const container = document.getElementById('flashcardsList');

        if (!container) return;

        if (flashcards.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum flashcard disponível</p>';
            return;
        }

        // Agrupar por material
        const grouped = {};
        flashcards.forEach(card => {
            const materialId = card.materialId;
            if (!grouped[materialId]) {
                grouped[materialId] = [];
            }
            grouped[materialId].push(card);
        });

        container.innerHTML = Object.entries(grouped).map(([materialId, cards]) => `
            <div style="margin-bottom: 30px;">
                <h3 style="color: var(--accent); margin-bottom: 15px;">
                    ${cards.length} Flashcards
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                    ${cards.map(card => `
                        <div class="flashcard" onclick="flashcards.toggleFlip(this)">
                            <div class="flashcard-inner">
                                <div class="flashcard-front">
                                    <div class="flashcard-text">${card.front}</div>
                                    <div class="flashcard-hint">Clique para virar</div>
                                </div>
                                <div class="flashcard-back">
                                    <div class="flashcard-text">${card.back}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    /**
     * Alternar flip do flashcard
     */
    toggleFlip(element) {
        element.classList.toggle('flipped');
    }

    /**
     * Iniciar sessão de revisão
     */
    startReviewSession(materialId = null) {
        if (materialId) {
            this.currentCards = storage.getFlashcardsByMaterial(materialId);
        } else {
            this.currentCards = storage.getFlashcards();
        }

        if (this.currentCards.length === 0) {
            alert('Nenhum flashcard para revisar');
            return;
        }

        this.currentIndex = 0;
        this.renderReviewSession();
    }

    /**
     * Renderizar sessão de revisão
     */
    renderReviewSession() {
        if (this.currentIndex >= this.currentCards.length) {
            this.showReviewSummary();
            return;
        }

        const card = this.currentCards[this.currentIndex];
        const container = document.getElementById('flashcardsList');

        if (!container) return;

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <p style="color: var(--text-muted); font-size: 14px;">
                        Cartão ${this.currentIndex + 1} de ${this.currentCards.length}
                    </p>
                    <div style="width: 100%; height: 6px; background-color: var(--border-color); border-radius: 3px; overflow: hidden; margin-top: 10px;">
                        <div style="height: 100%; background-color: var(--accent); width: ${((this.currentIndex + 1) / this.currentCards.length) * 100}%; transition: width 0.3s ease;"></div>
                    </div>
                </div>

                <div class="flashcard" style="height: 350px; cursor: pointer;" onclick="flashcards.toggleFlip(this)">
                    <div class="flashcard-inner">
                        <div class="flashcard-front" style="font-size: 20px;">
                            <div class="flashcard-text">${card.front}</div>
                            <div class="flashcard-hint">Clique para ver a resposta</div>
                        </div>
                        <div class="flashcard-back" style="font-size: 18px;">
                            <div class="flashcard-text">${card.back}</div>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 15px; margin-top: 30px; justify-content: center;">
                    <button class="btn btn-secondary" onclick="flashcards.markDifficult()">
                        Difícil
                    </button>
                    <button class="btn btn-secondary" onclick="flashcards.markNormal()">
                        Normal
                    </button>
                    <button class="btn btn-primary" onclick="flashcards.markEasy()">
                        Fácil
                    </button>
                </div>

                <div style="display: flex; gap: 15px; margin-top: 20px;">
                    ${this.currentIndex > 0 ? `
                        <button class="btn btn-secondary" style="flex: 1;" onclick="flashcards.previousCard()">
                            ← Anterior
                        </button>
                    ` : ''}
                    ${this.currentIndex < this.currentCards.length - 1 ? `
                        <button class="btn btn-secondary" style="flex: 1;" onclick="flashcards.nextCard()">
                            Próximo →
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Próximo cartão
     */
    nextCard() {
        if (this.currentIndex < this.currentCards.length - 1) {
            this.currentIndex++;
            this.renderReviewSession();
        }
    }

    /**
     * Cartão anterior
     */
    previousCard() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.renderReviewSession();
        }
    }

    /**
     * Marcar como fácil
     */
    markEasy() {
        const card = this.currentCards[this.currentIndex];
        storage.updateFlashcard(card.id, {
            timesReviewed: (card.timesReviewed || 0) + 1,
            lastReviewedAt: new Date().toISOString(),
            difficulty: 'easy'
        });
        this.nextCard();
    }

    /**
     * Marcar como normal
     */
    markNormal() {
        const card = this.currentCards[this.currentIndex];
        storage.updateFlashcard(card.id, {
            timesReviewed: (card.timesReviewed || 0) + 1,
            lastReviewedAt: new Date().toISOString()
        });
        this.nextCard();
    }

    /**
     * Marcar como difícil
     */
    markDifficult() {
        const card = this.currentCards[this.currentIndex];
        storage.updateFlashcard(card.id, {
            timesReviewed: (card.timesReviewed || 0) + 1,
            lastReviewedAt: new Date().toISOString(),
            difficulty: 'hard'
        });
        this.nextCard();
    }

    /**
     * Mostrar resumo da revisão
     */
    showReviewSummary() {
        const container = document.getElementById('flashcardsList');
        if (!container) return;

        container.innerHTML = `
            <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                <div style="font-size: 60px; color: var(--accent); margin-bottom: 20px;">✓</div>
                <h2 style="color: var(--text-light); margin-bottom: 10px;">Revisão Concluída!</h2>
                <p style="color: var(--text-muted); font-size: 16px; margin-bottom: 30px;">
                    Você revisou ${this.currentCards.length} flashcards com sucesso.
                </p>
                <button class="btn btn-primary" onclick="app.showPage('flashcards'); flashcards.renderFlashcards();">
                    Voltar aos Flashcards
                </button>
            </div>
        `;
    }
}

// Instância global
const flashcards = new FlashcardsModule();

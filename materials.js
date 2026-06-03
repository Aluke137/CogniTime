/**
 * Materials Module - Gerencia upload e processamento de materiais
 */
class MaterialsModule {
    constructor() {
        this.currentMaterial = null;
        this.setupEventListeners();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        const uploadBox = document.getElementById('uploadBox');
        const fileInput = document.getElementById('fileInput');
        const uploadBtn = document.getElementById('uploadBtn');

        if (uploadBox) {
            uploadBox.addEventListener('click', () => fileInput?.click());
            uploadBox.addEventListener('dragover', (e) => this.handleDragOver(e));
            uploadBox.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            uploadBox.addEventListener('drop', (e) => this.handleDrop(e));
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => this.uploadMaterial());
        }
    }

    /**
     * Lidar com drag over
     */
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadBox = document.getElementById('uploadBox');
        if (uploadBox) {
            uploadBox.style.backgroundColor = 'rgba(0, 217, 163, 0.1)';
            uploadBox.style.borderColor = 'var(--accent)';
        }
    }

    /**
     * Lidar com drag leave
     */
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadBox = document.getElementById('uploadBox');
        if (uploadBox) {
            uploadBox.style.backgroundColor = '';
            uploadBox.style.borderColor = '';
        }
    }

    /**
     * Lidar com drop
     */
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        const uploadBox = document.getElementById('uploadBox');
        if (uploadBox) {
            uploadBox.style.backgroundColor = '';
            uploadBox.style.borderColor = '';
        }

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    /**
     * Lidar com seleção de arquivo
     */
    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    /**
     * Processar arquivo
     */
    processFile(file) {
        const validTypes = ['application/pdf', 'text/plain', 'text/markdown'];
        
        if (!validTypes.includes(file.type)) {
            alert('Tipo de arquivo não suportado. Use PDF, TXT ou MD.');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = (e) => {
            this.currentMaterial = {
                fileName: file.name,
                fileType: file.type,
                content: e.target.result
            };

            // Atualizar UI
            const uploadBox = document.getElementById('uploadBox');
            if (uploadBox) {
                uploadBox.innerHTML = `
                    <p class="upload-icon">✓</p>
                    <p class="upload-text">${file.name}</p>
                    <p class="upload-sub">Pronto para enviar</p>
                `;
            }

            // Ativar botão de upload
            const uploadBtn = document.getElementById('uploadBtn');
            if (uploadBtn) {
                uploadBtn.disabled = false;
            }
        };

        reader.readAsText(file);
    }

    /**
     * Enviar material
     */
    uploadMaterial() {
        const title = document.getElementById('materialTitle')?.value;
        const subject = document.getElementById('materialSubject')?.value;

        if (!title || !this.currentMaterial) {
            alert('Preencha o título do material');
            return;
        }

        // Criar material
        const material = storage.addMaterial({
            title,
            subject: subject || 'Geral',
            content: this.currentMaterial.content,
            fileType: this.currentMaterial.fileName
        });

        // Processar material com IA
        this.processMaterialWithAI(material);

        // Limpar formulário
        this.resetForm();

        // Atualizar lista
        this.renderMaterials();
    }

    /**
     * Processar material com IA
     */
    async processMaterialWithAI(material) {
        // Atualizar status
        storage.updateMaterial(material.id, { status: 'processing' });

        try {
            // Processar com IA
            const topics = await ai.processMaterial(material.content, material.subject);

            // Atualizar material
            storage.updateMaterial(material.id, {
                status: 'done',
                topics
            });

            // Criar cronograma de revisão
            const reviewItems = topics.topics.map(topic => ({
                materialId: material.id,
                topic: topic.title,
                dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            }));

            storage.addReviewItems(reviewItems);

            // Atualizar UI
            this.renderMaterials();
        } catch (error) {
            console.error('Erro ao processar material:', error);
            storage.updateMaterial(material.id, { status: 'error' });
            this.renderMaterials();
        }
    }

    /**
     * Renderizar lista de materiais
     */
    renderMaterials() {
        const materials = storage.getMaterials();
        const container = document.getElementById('materialsList');

        if (!container) return;

        if (materials.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum material enviado ainda</p>';
            return;
        }

        container.innerHTML = materials.map(material => `
            <div class="material-card">
                <p class="material-title">${material.title}</p>
                <p class="material-subject">${material.subject}</p>
                <span class="material-status status-${material.status}">
                    ${material.status === 'pending' ? '⏳ Aguardando' : 
                      material.status === 'processing' ? '⚙️ Processando' : 
                      material.status === 'done' ? '✓ Concluído' : '✗ Erro'}
                </span>
                <div class="material-actions">
                    <button class="btn btn-secondary" onclick="materials.generateQuiz(${material.id})">
                        Gerar Simulado
                    </button>
                    <button class="btn btn-secondary" onclick="materials.generateFlashcards(${material.id})">
                        Criar Flashcards
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Gerar quiz a partir do material
     */
    async generateQuiz(materialId) {
        const material = storage.getMaterialById(materialId);
        if (!material) return;

        try {
            const questions = await ai.generateQuestions(material.content, 5);
            const quiz = storage.addQuiz({
                materialId,
                title: `Simulado - ${material.title}`,
                subject: material.subject,
                questions
            });

            alert('Simulado gerado com sucesso!');
            app.showPage('quizzes');
            quizzes.renderQuizzes();
        } catch (error) {
            console.error('Erro ao gerar quiz:', error);
            alert('Erro ao gerar simulado');
        }
    }

    /**
     * Gerar flashcards a partir do material
     */
    async generateFlashcards(materialId) {
        const material = storage.getMaterialById(materialId);
        if (!material) return;

        try {
            const cards = await ai.generateFlashcards(material.content, 10);
            const newCards = cards.map(card => ({ ...card, materialId }));
            storage.addFlashcards(newCards);

            alert('Flashcards criados com sucesso!');
            app.showPage('flashcards');
            flashcards.renderFlashcards();
        } catch (error) {
            console.error('Erro ao gerar flashcards:', error);
            alert('Erro ao gerar flashcards');
        }
    }

    /**
     * Resetar formulário
     */
    resetForm() {
        document.getElementById('materialTitle').value = '';
        document.getElementById('materialSubject').value = '';
        document.getElementById('fileInput').value = '';
        
        const uploadBox = document.getElementById('uploadBox');
        if (uploadBox) {
            uploadBox.innerHTML = `
                <p class="upload-icon">📁</p>
                <p class="upload-text">Arraste arquivos aqui ou clique para selecionar</p>
                <p class="upload-sub">Suporta PDF, TXT, MD</p>
            `;
        }

        const uploadBtn = document.getElementById('uploadBtn');
        if (uploadBtn) {
            uploadBtn.disabled = true;
        }

        this.currentMaterial = null;
    }

    /**
     * Deletar material
     */
    deleteMaterial(materialId) {
        if (confirm('Tem certeza que deseja deletar este material?')) {
            const materials = storage.getMaterials();
            const filtered = materials.filter(m => m.id !== materialId);
            storage.saveMaterials(filtered);
            this.renderMaterials();
        }
    }
}

// Instância global
const materials = new MaterialsModule();

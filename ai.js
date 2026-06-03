/**
 * AI Module - Integração com IA para processamento de materiais e geração de conteúdo
 * Nota: Esta é uma simulação. Para produção, integrar com API real de IA.
 */
class AIModule {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://api.example.com/v1'; // Substituir com URL real
    }

    /**
     * Processar material e extrair tópicos
     */
    async processMaterial(text, subject) {
        // Simulação de processamento com IA
        return new Promise((resolve) => {
            setTimeout(() => {
                const topics = this.extractTopicsLocal(text, subject);
                resolve(topics);
            }, 1500);
        });
    }

    /**
     * Extração local de tópicos (fallback)
     */
    extractTopicsLocal(text, subject) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const topics = [];

        // Extrair palavras-chave
        const words = text.toLowerCase().split(/\s+/);
        const uniqueWords = [...new Set(words)].filter(w => w.length > 5);

        for (let i = 0; i < Math.min(5, sentences.length); i++) {
            const sentence = sentences[i].trim();
            if (sentence.length > 20) {
                topics.push({
                    title: sentence.substring(0, 60) + '...',
                    summary: sentence,
                    importance: i === 0 ? 'high' : i < 2 ? 'medium' : 'low',
                    keywords: uniqueWords.slice(i * 3, (i + 1) * 3)
                });
            }
        }

        return {
            topics: topics.slice(0, 5),
            subject: subject || 'Geral',
            totalConcepts: topics.length
        };
    }

    /**
     * Gerar questões de múltipla escolha
     */
    async generateQuestions(materialText, count = 5) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const questions = this.generateQuestionsLocal(materialText, count);
                resolve(questions);
            }, 2000);
        });
    }

    /**
     * Geração local de questões (fallback)
     */
    generateQuestionsLocal(text, count) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const questions = [];

        const questionTemplates = [
            'Qual é o conceito principal de ',
            'De acordo com o texto, ',
            'Qual alternativa melhor descreve ',
            'O que significa ',
            'Qual é a importância de '
        ];

        for (let i = 0; i < Math.min(count, sentences.length); i++) {
            const sentence = sentences[i].trim();
            const words = sentence.split(/\s+/);
            
            if (words.length > 5) {
                const mainConcept = words.slice(0, 3).join(' ');
                
                questions.push({
                    question: questionTemplates[i % questionTemplates.length] + mainConcept + '?',
                    options: [
                        'A) ' + sentence.substring(0, 50),
                        'B) ' + sentence.substring(10, 60),
                        'C) ' + sentence.substring(20, 70),
                        'D) ' + sentence.substring(30, 80)
                    ],
                    correctIndex: Math.floor(Math.random() * 4),
                    explanation: 'Esta é a resposta correta porque: ' + sentence
                });
            }
        }

        return questions.slice(0, count);
    }

    /**
     * Gerar flashcards
     */
    async generateFlashcards(materialText, count = 10) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const flashcards = this.generateFlashcardsLocal(materialText, count);
                resolve(flashcards);
            }, 1800);
        });
    }

    /**
     * Geração local de flashcards (fallback)
     */
    generateFlashcardsLocal(text, count) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const flashcards = [];

        for (let i = 0; i < Math.min(count, sentences.length); i++) {
            const sentence = sentences[i].trim();
            const words = sentence.split(/\s+/);
            
            if (words.length > 5) {
                const concept = words.slice(0, 4).join(' ');
                
                flashcards.push({
                    front: 'O que é ' + concept + '?',
                    back: sentence,
                    difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard'
                });
            }
        }

        return flashcards.slice(0, count);
    }

    /**
     * Corrigir resposta de quiz
     */
    async correctAnswer(question, selectedIndex, correctIndex) {
        return {
            isCorrect: selectedIndex === correctIndex,
            explanation: question.explanation,
            selectedOption: question.options[selectedIndex],
            correctOption: question.options[correctIndex]
        };
    }

    /**
     * Gerar feedback detalhado
     */
    async generateFeedback(answers, questions) {
        const feedback = [];
        let correctCount = 0;

        for (let i = 0; i < answers.length; i++) {
            const isCorrect = answers[i] === questions[i].correctIndex;
            if (isCorrect) correctCount++;

            feedback.push({
                questionIndex: i,
                isCorrect,
                explanation: questions[i].explanation,
                selectedOption: questions[i].options[answers[i]],
                correctOption: questions[i].options[questions[i].correctIndex]
            });
        }

        return {
            score: (correctCount / questions.length) * 100,
            correctCount,
            totalQuestions: questions.length,
            feedback
        };
    }

    /**
     * Chamar API real de IA (quando disponível)
     */
    async callAI(prompt, model = 'gpt-3.5-turbo') {
        if (!this.apiKey) {
            console.warn('API key não configurada. Usando fallback local.');
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });

            if (!response.ok) throw new Error('Erro na API de IA');
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Erro ao chamar API de IA:', error);
            return null;
        }
    }
}

// Instância global
const ai = new AIModule();

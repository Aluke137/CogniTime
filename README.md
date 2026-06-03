# CogniTime - Plataforma de Estudos Inteligente

Uma aplicação web moderna e elegante para gerenciar estudos com inteligência artificial, método Pomodoro, revisão espaçada e muito mais.

## 🎯 Funcionalidades

### 1. **Timer Pomodoro Configurável**
- Sessões de estudo personalizáveis (padrão: 25 minutos)
- Pausas curtas e longas configuráveis
- Visualização circular do progresso
- Som de notificação ao completar sessão
- Histórico de sessões completadas

### 2. **Upload e Processamento de Materiais**
- Suporte para PDF, TXT e Markdown
- Drag & drop para upload
- Processamento com IA para extração de tópicos
- Armazenamento seguro em localStorage
- Organização por matéria/disciplina

### 3. **Geração Automática de Simulados**
- Questões de múltipla escolha geradas por IA
- Correção em tempo real
- Explicações detalhadas para cada questão
- Histórico de tentativas
- Cálculo de desempenho

### 4. **Flashcards Inteligentes**
- Criação automática de flashcards
- Interface flip para revisar
- Marcação de dificuldade
- Rastreamento de revisões
- Agrupamento por material

### 5. **Revisão Espaçada (SM-2 Algorithm)**
- Cronograma dinâmico personalizado
- Algoritmo SM-2 para otimizar memorização
- Cálculo automático de intervalos
- Marcação de progresso
- Próximas revisões em destaque

### 6. **Dashboard Completo**
- Estatísticas em tempo real
- Gráfico de minutos de estudo (últimos 7 dias)
- Próximas revisões agendadas
- Histórico de simulados
- Saudação personalizada

### 7. **Autenticação e Persistência**
- Dados salvos em localStorage
- Sincronização automática
- Privacidade garantida
- Sem necessidade de servidor

## 🎨 Design

**Tema Visual:**
- **Cor Primária:** Verde Água (#00d9a3)
- **Background:** Preto Elegante (#0a0e27)
- **Acentos:** Gradientes sofisticados
- **Tipografia:** Segoe UI com fontes refinadas

**Características de Design:**
- Interface elegante e intuitiva
- Animações suaves e responsivas
- Modo escuro por padrão
- Totalmente responsivo (mobile, tablet, desktop)
- Acessibilidade garantida

## 📁 Estrutura de Arquivos

```
cognitime/
├── index.html          # Estrutura HTML principal
├── styles.css          # Estilos CSS (tema verde água/preto)
├── app.js              # Lógica principal da aplicação
├── storage.js          # Gerenciamento de dados (localStorage)
├── ai.js               # Integração com IA (simulação local)
├── timer.js            # Lógica do Timer Pomodoro
├── materials.js        # Gerenciamento de materiais
├── quizzes.js          # Gerenciamento de simulados
├── flashcards.js       # Gerenciamento de flashcards
├── dashboard.js        # Lógica do dashboard
└── README.md           # Esta documentação
```

## 🚀 Como Usar

### 1. Abrir a Aplicação
Abra o arquivo `index.html` em um navegador moderno (Chrome, Firefox, Safari, Edge).

### 2. Enviar Materiais
1. Clique em "Materiais" na navegação
2. Arraste um arquivo (PDF, TXT, MD) ou clique para selecionar
3. Preencha o título e matéria
4. Clique em "Enviar Material"
5. A IA processará automaticamente

### 3. Usar o Timer Pomodoro
1. Clique em "Timer" na navegação
2. Configure a duração da sessão e pausa (opcional)
3. Clique em "Iniciar"
4. O timer contará regressivamente
5. Ao completar, receberá notificação

### 4. Gerar Simulados
1. Após enviar um material, clique em "Gerar Simulado"
2. Responda as questões de múltipla escolha
3. Receba feedback detalhado com explicações
4. Veja seu desempenho

### 5. Criar Flashcards
1. Após enviar um material, clique em "Criar Flashcards"
2. Revise os cartões clicando para virar
3. Marque como Fácil, Normal ou Difícil
4. Acompanhe seu progresso

### 6. Revisar com Agendamento
1. Clique em "Revisão" na navegação
2. Veja as revisões agendadas pela IA
3. Clique em "Revisar" para começar
4. Marque seu nível de lembrança
5. O sistema recalcula o próximo intervalo

### 7. Acompanhar Progresso
1. Clique em "Dashboard"
2. Veja estatísticas em tempo real
3. Gráfico de minutos de estudo
4. Próximas revisões
5. Desempenho nos simulados

## ⚙️ Configurações

### Timer Pomodoro
- **Duração da Sessão:** 10-120 minutos (padrão: 25)
- **Pausa Curta:** 1-30 minutos (padrão: 5)
- **Pausa Longa:** Configurável
- **Som:** Ativado por padrão

### Materiais
- **Formatos Suportados:** PDF, TXT, MD
- **Tamanho Máximo:** Sem limite (localStorage)
- **Processamento:** Automático com IA

## 💾 Armazenamento

Todos os dados são salvos localmente em **localStorage**:
- Sessões de estudo
- Materiais enviados
- Simulados e tentativas
- Flashcards
- Cronograma de revisão
- Configurações

**Nota:** Os dados são persistentes e não são sincronizados com servidores.

## 🤖 Integração com IA

A aplicação inclui simulação local de IA para:
- Extração de tópicos de materiais
- Geração de questões
- Criação de flashcards
- Feedback detalhado

**Para Produção:** Integre com APIs reais (OpenAI, Anthropic, etc.) editando `ai.js`.

## 📊 Algoritmo SM-2

O sistema de revisão espaçada usa o algoritmo SM-2 para otimizar a memorização:
- Calcula automaticamente o próximo intervalo
- Ajusta a dificuldade baseado no desempenho
- Maximiza a retenção de longo prazo

## 🔒 Privacidade

- ✅ Sem servidor - dados locais apenas
- ✅ Sem rastreamento
- ✅ Sem compartilhamento de dados
- ✅ Controle total do usuário

## 🌐 Compatibilidade

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Navegadores móveis modernos

## 📱 Responsividade

- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)

## 🎓 Metodologias Implementadas

1. **Técnica Pomodoro** - Gerenciamento de tempo
2. **Revisão Espaçada** - Otimização de memorização
3. **Aprendizado Ativo** - Simulados e flashcards
4. **Feedback Imediato** - Correção em tempo real

## 🚀 Próximas Melhorias

- [ ] Integração com API real de IA
- [ ] Sincronização em nuvem
- [ ] Modo colaborativo
- [ ] Análise avançada de desempenho
- [ ] Recomendações personalizadas
- [ ] Exportação de relatórios
- [ ] Modo offline aprimorado

## 📝 Licença

Projeto educacional - Uso livre

## 👨‍💻 Desenvolvimento

Criado com:
- HTML5
- CSS3 (com variáveis CSS)
- JavaScript Vanilla (ES6+)
- LocalStorage API
- Canvas API (gráficos)

## 📞 Suporte

Para dúvidas ou sugestões, consulte a documentação ou revise o código comentado.

---

**CogniTime** - Estude com inteligência, foco e método. 🧠✨

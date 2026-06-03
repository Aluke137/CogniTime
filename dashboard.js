/**
 * Dashboard Module - Gerencia o dashboard
 */
class DashboardModule {
    constructor() {
        this.chart = null;
    }

    /**
     * Atualizar dashboard
     */
    updateDashboard() {
        const stats = storage.getDashboardStats();

        // Atualizar stats
        const todayMinutes = document.getElementById('todayMinutes');
        if (todayMinutes) todayMinutes.textContent = stats.todayMinutes;

        const todaySessions = document.getElementById('todaySessions');
        if (todaySessions) todaySessions.textContent = `${stats.todaySessions} sessões`;

        const avgScore = document.getElementById('avgScore');
        if (avgScore) avgScore.textContent = `${stats.avgScore}%`;

        const pendingReviews = document.getElementById('pendingReviews');
        if (pendingReviews) pendingReviews.textContent = stats.pendingReviews;

        const totalMaterials = document.getElementById('totalMaterials');
        if (totalMaterials) totalMaterials.textContent = stats.totalMaterials;

        // Atualizar saudação
        this.updateGreeting();

        // Atualizar gráfico
        this.renderChart(stats.sessions);

        // Atualizar revisões próximas
        this.renderUpcomingReviews(stats.upcomingReviews);
    }

    /**
     * Atualizar saudação
     */
    updateGreeting() {
        const greeting = document.getElementById('greeting');
        if (!greeting) return;

        const hour = new Date().getHours();
        const dayName = new Date().toLocaleDateString('pt-BR', { weekday: 'long' });
        const date = new Date().toLocaleDateString('pt-BR');

        let greetingText = '';
        if (hour < 12) greetingText = 'Bom dia';
        else if (hour < 18) greetingText = 'Boa tarde';
        else greetingText = 'Boa noite';

        greeting.textContent = `${greetingText}! ${dayName}, ${date}`;
    }

    /**
     * Renderizar gráfico de minutos de estudo
     */
    renderChart(sessions) {
        const canvas = document.getElementById('studyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const now = new Date();

        // Preparar dados dos últimos 7 dias
        const days = [];
        const data = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dayName = d.toLocaleDateString('pt-BR', { weekday: 'short' });
            days.push(dayName);

            // Contar minutos do dia
            const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

            const dayMinutes = sessions
                .filter(s => {
                    const sessionDate = new Date(s.createdAt);
                    return sessionDate >= dayStart && sessionDate < dayEnd && s.type === 'study';
                })
                .reduce((sum, s) => sum + s.duration, 0);

            data.push(dayMinutes);
        }

        // Limpar canvas
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;

        // Desenhar gráfico simples
        this.drawBarChart(ctx, days, data);
    }

    /**
     * Desenhar gráfico de barras
     */
    drawBarChart(ctx, labels, data) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const padding = 40;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        const maxValue = Math.max(...data, 1);
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length;

        // Desenhar eixos
        ctx.strokeStyle = 'var(--border-color)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Desenhar barras
        ctx.fillStyle = 'var(--primary-color)';
        data.forEach((value, index) => {
            const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
            const barHeight = (value / maxValue) * chartHeight;
            const y = height - padding - barHeight;

            ctx.fillRect(x, y, barWidth, barHeight);
        });

        // Desenhar labels
        ctx.fillStyle = 'var(--text-muted)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        labels.forEach((label, index) => {
            const x = padding + index * barSpacing + barSpacing / 2;
            ctx.fillText(label, x, height - padding + 20);
        });
    }

    /**
     * Renderizar revisões próximas
     */
    renderUpcomingReviews(reviews) {
        const container = document.getElementById('upcomingReviews');
        if (!container) return;

        if (reviews.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma revisão pendente</p>';
            return;
        }

        container.innerHTML = reviews.map(review => {
            const dueDate = new Date(review.dueDate);
            const today = new Date();
            const isToday = dueDate.toDateString() === today.toDateString();
            const isTomorrow = dueDate.toDateString() === new Date(today.getTime() + 24 * 60 * 60 * 1000).toDateString();

            let dateText = dueDate.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
            if (isToday) dateText = 'Hoje';
            else if (isTomorrow) dateText = 'Amanhã';

            return `
                <div class="review-item">
                    <p class="review-item-title">${review.topic}</p>
                    <p class="review-item-date">${dateText}</p>
                </div>
            `;
        }).join('');
    }
}

// Instância global
const dashboard = new DashboardModule();

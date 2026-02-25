import { io } from '../../../shared/infra/socket';

export class NotificationService {
  static sendBudgetLimitAlert(userId: string, categoryName: string, percent: number) {
    io.of('/user').to(`user:${userId}`).emit('user:budget:alert', {
      type: 'BUDGET_LIMIT',
      category: categoryName,
      percentUsed: percent,
      severity: percent >= 100 ? 'high' : 'medium',
      message: `Atenção! Você já utilizou ${percent}% do seu orçamento para ${categoryName}.`
    });
  }

  static sendPortfolioUpdate(userId: string) {
    io.of('/user').to(`user:${userId}`).emit('user:investment:update', {
      type: 'PORTFOLIO_REFRESH',
      timestamp: new Date(),
      message: 'As cotações dos seus ativos foram atualizadas com dados do mercado.'
    });
  }
}
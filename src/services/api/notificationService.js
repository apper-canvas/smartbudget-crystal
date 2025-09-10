import { budgetService } from '@/services/api/budgetService';
import { transactionService } from '@/services/api/transactionService';
import { getCurrentMonthYear, calculateBudgetHealth, getBudgetStatus } from '@/utils/formatters';

class NotificationService {
  constructor() {
    this.delay = 300;
    this.notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    this.settings = JSON.parse(localStorage.getItem('notificationSettings')) || {
      budgetAlerts: true,
      threshold: 80,
      emailNotifications: false,
      pushNotifications: true
    };
  }

  async checkBudgetAlerts() {
    try {
      if (!this.settings.budgetAlerts) return [];

      const { month, year } = getCurrentMonthYear();
      const currentBudgets = await budgetService.getCurrentBudgets(month, year);
      const alerts = [];

      for (const budget of currentBudgets) {
        const percentage = calculateBudgetHealth(budget.currentSpent, budget.monthlyLimit);
        const customThreshold = budget.alertThreshold || this.settings.threshold;
        
        if (percentage >= customThreshold) {
          const existingAlert = this.notifications.find(
            n => n.type === 'budget_alert' && 
                 n.budgetId === budget.Id && 
                 n.month === month && 
                 n.year === year &&
                 !n.dismissed
          );

          if (!existingAlert) {
            const alert = {
              id: this.generateId(),
              type: 'budget_alert',
              budgetId: budget.Id,
              category: budget.category,
              message: `${budget.category} spending at ${Math.round(percentage)}% of budget limit`,
              description: `You've spent $${budget.currentSpent.toFixed(2)} of your $${budget.monthlyLimit.toFixed(2)} budget.`,
              severity: percentage >= 100 ? 'error' : percentage >= 90 ? 'warning' : 'info',
              timestamp: new Date().toISOString(),
              month,
              year,
              dismissed: false,
              data: {
                currentSpent: budget.currentSpent,
                monthlyLimit: budget.monthlyLimit,
                percentage: Math.round(percentage),
                remaining: budget.monthlyLimit - budget.currentSpent
              }
            };
            
            alerts.push(alert);
            this.notifications.push(alert);
          }
        }
      }

      if (alerts.length > 0) {
        this.saveNotifications();
      }

      return alerts;
    } catch (error) {
      console.error('Error checking budget alerts:', error);
      return [];
    }
  }

  async getActiveNotifications() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.notifications.filter(n => !n.dismissed);
  }

  async getAllNotifications() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return [...this.notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async dismissNotification(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.dismissed = true;
      notification.dismissedAt = new Date().toISOString();
      this.saveNotifications();
    }
  }

  async clearAllNotifications() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    this.notifications = this.notifications.map(n => ({ ...n, dismissed: true, dismissedAt: new Date().toISOString() }));
    this.saveNotifications();
  }

  async updateSettings(newSettings) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('notificationSettings', JSON.stringify(this.settings));
    return this.settings;
  }

  async getSettings() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return { ...this.settings };
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }
}

export const notificationService = new NotificationService();
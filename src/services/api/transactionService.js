import transactions from "@/services/mockData/transactions.json";
import { notificationService } from '@/services/api/notificationService';
class TransactionService {
  constructor() {
    this.data = [...transactions];
    this.delay = 300;
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const transaction = this.data.find(item => item.Id === parseInt(id));
    if (!transaction) {
      throw new Error(`Transaction with Id ${id} not found`);
    }
    return { ...transaction };
  }

async create(transaction) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newTransaction = {
      ...transaction,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    
    this.data.push(newTransaction);
    
    // Check for budget alerts after adding transaction
    setTimeout(async () => {
      await notificationService.checkBudgetAlerts();
    }, 100);
    
    return { ...newTransaction };
  }

  async update(id, updatedTransaction) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Transaction with Id ${id} not found`);
    }
    
    this.data[index] = { ...this.data[index], ...updatedTransaction, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Transaction with Id ${id} not found`);
    }
    
    const deletedTransaction = { ...this.data[index] };
    this.data.splice(index, 1);
    return deletedTransaction;
  }

  // Additional utility methods
  async getByDateRange(startDate, endDate) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.data.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= start && transactionDate <= end;
    }).map(transaction => ({ ...transaction }));
  }

  async getByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.data
      .filter(transaction => transaction.category === category)
      .map(transaction => ({ ...transaction }));
  }

async getByType(type) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.data
      .filter(transaction => transaction.type === type)
      .map(transaction => ({ ...transaction }));
  }

  // Advanced filtering method for comprehensive search
  async getFiltered(filters = {}) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    let filtered = [...this.data];

    // Search filter - check description, category, amount
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => {
        const matchesDescription = t.description.toLowerCase().includes(searchLower);
        const matchesCategory = t.category.toLowerCase().includes(searchLower);
        const matchesAmount = Math.abs(t.amount).toString().includes(searchLower);
        const matchesFormattedAmount = `$${Math.abs(t.amount).toFixed(2)}`.includes(searchLower);
        
        return matchesDescription || matchesCategory || matchesAmount || matchesFormattedAmount;
      });
    }

    // Date range filter
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        let dateMatches = true;
        if (startDate) {
          dateMatches = dateMatches && transactionDate >= startDate;
        }
        if (endDate) {
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          dateMatches = dateMatches && transactionDate <= endOfDay;
        }
        
        return dateMatches;
      });
    }

    // Amount range filter
    if (filters.minAmount !== undefined && filters.minAmount !== '') {
      filtered = filtered.filter(t => Math.abs(t.amount) >= parseFloat(filters.minAmount));
    }
    
    if (filters.maxAmount !== undefined && filters.maxAmount !== '') {
      filtered = filtered.filter(t => Math.abs(t.amount) <= parseFloat(filters.maxAmount));
    }

    // Category filter (multiple categories)
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(t => filters.categories.includes(t.category));
    }

    // Transaction type filter
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    return filtered.map(transaction => ({ ...transaction }));
  }

  // Enhanced search method with advanced criteria
  async searchTransactions(criteria) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const {
      keywords,
      dateFrom,
      dateTo,
      categories,
      minAmount,
      maxAmount,
      transactionType
    } = criteria;

    let results = [...this.data];

    // Keywords search across multiple fields
    if (keywords && keywords.trim()) {
      const searchTerms = keywords.toLowerCase().split(/\s+/);
      results = results.filter(transaction => {
        const searchableText = [
          transaction.description,
          transaction.category,
          transaction.amount.toString(),
          `$${Math.abs(transaction.amount).toFixed(2)}`
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Date range filtering
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      results = results.filter(t => new Date(t.date) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      results = results.filter(t => new Date(t.date) <= toDate);
    }

    // Category filtering
    if (categories && categories.length > 0) {
      results = results.filter(t => categories.includes(t.category));
    }

    // Amount range filtering
    if (minAmount !== undefined && minAmount !== null) {
      results = results.filter(t => Math.abs(t.amount) >= parseFloat(minAmount));
    }

    if (maxAmount !== undefined && maxAmount !== null) {
      results = results.filter(t => Math.abs(t.amount) <= parseFloat(maxAmount));
    }

    // Transaction type filtering
    if (transactionType) {
      results = results.filter(t => t.type === transactionType);
    }

    return results.map(transaction => ({ ...transaction }));
  }
}

export default new TransactionService();
import transactions from "@/services/mockData/transactions.json";

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
}

export default new TransactionService();
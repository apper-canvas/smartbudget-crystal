import budgets from "@/services/mockData/budgets.json";

class BudgetService {
  constructor() {
    this.data = [...budgets];
    this.delay = 300;
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const budget = this.data.find(item => item.Id === parseInt(id));
    if (!budget) {
      throw new Error(`Budget with Id ${id} not found`);
    }
    return { ...budget };
  }

  async create(budget) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newBudget = {
      ...budget,
      Id: maxId + 1
    };
    
    this.data.push(newBudget);
    return { ...newBudget };
  }

  async update(id, updatedBudget) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Budget with Id ${id} not found`);
    }
    
    this.data[index] = { ...this.data[index], ...updatedBudget, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Budget with Id ${id} not found`);
    }
    
    const deletedBudget = { ...this.data[index] };
    this.data.splice(index, 1);
    return deletedBudget;
  }
// Additional utility methods
  async getByMonth(month, year) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.data
      .filter(budget => budget.month === month && budget.year === year)
      .map(budget => ({ ...budget }));
  }

  async getByCategory(category) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.data
      .filter(budget => budget.category === category)
      .map(budget => ({ ...budget }));
  }

  async getCurrentBudgets(month, year) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.data
      .filter(budget => budget.month === month && budget.year === year)
      .map(budget => ({ ...budget }));
  }
}

export default new BudgetService();
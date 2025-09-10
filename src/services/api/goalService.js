import goals from "@/services/mockData/goals.json";

class GoalService {
  constructor() {
    this.data = [...goals];
    this.delay = 300;
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const goal = this.data.find(item => item.Id === parseInt(id));
    if (!goal) {
      throw new Error(`Goal with Id ${id} not found`);
    }
    return { ...goal };
  }

  async create(goal) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newGoal = {
      ...goal,
      Id: maxId + 1,
      createdAt: new Date().toISOString()
    };
    
    this.data.push(newGoal);
    return { ...newGoal };
  }

  async update(id, updatedGoal) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Goal with Id ${id} not found`);
    }
    
    this.data[index] = { ...this.data[index], ...updatedGoal, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Goal with Id ${id} not found`);
    }
    
    const deletedGoal = { ...this.data[index] };
    this.data.splice(index, 1);
    return deletedGoal;
  }

  // Additional utility methods
  async getCompleted() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.data
      .filter(goal => goal.currentAmount >= goal.targetAmount)
      .map(goal => ({ ...goal }));
  }

  async getActive() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.data
      .filter(goal => goal.currentAmount < goal.targetAmount)
      .map(goal => ({ ...goal }));
  }

  async getOverdue() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const now = new Date();
    return this.data
      .filter(goal => {
        const deadline = new Date(goal.deadline);
        return deadline < now && goal.currentAmount < goal.targetAmount;
      })
      .map(goal => ({ ...goal }));
  }
}

export default new GoalService();
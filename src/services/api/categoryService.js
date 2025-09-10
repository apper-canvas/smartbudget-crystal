import categories from "@/services/mockData/categories.json";

class CategoryService {
  constructor() {
    this.data = [...categories];
    this.delay = 200;
  }

  async getAll() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return [...this.data];
  }

  async getById(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    const category = this.data.find(item => item.Id === parseInt(id));
    if (!category) {
      throw new Error(`Category with Id ${id} not found`);
    }
    return { ...category };
  }

  async create(category) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const maxId = Math.max(...this.data.map(item => item.Id), 0);
    const newCategory = {
      ...category,
      Id: maxId + 1
    };
    
    this.data.push(newCategory);
    return { ...newCategory };
  }

  async update(id, updatedCategory) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Category with Id ${id} not found`);
    }
    
    this.data[index] = { ...this.data[index], ...updatedCategory, Id: parseInt(id) };
    return { ...this.data[index] };
  }

  async delete(id) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    
    const index = this.data.findIndex(item => item.Id === parseInt(id));
    if (index === -1) {
      throw new Error(`Category with Id ${id} not found`);
    }
    
    const deletedCategory = { ...this.data[index] };
    this.data.splice(index, 1);
    return deletedCategory;
  }

  // Additional utility methods
  async getByType(type) {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.data
      .filter(category => category.type === type)
      .map(category => ({ ...category }));
  }

  async getDefaults() {
    await new Promise(resolve => setTimeout(resolve, this.delay));
    return this.data
      .filter(category => category.isDefault)
      .map(category => ({ ...category }));
  }
}

export default new CategoryService();
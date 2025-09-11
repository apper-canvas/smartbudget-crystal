class BudgetService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'budget_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "current_spent_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform to match UI field names
      return (response.data || []).map(item => ({
        Id: item.Id,
        Name: item.Name,
        Tags: item.Tags,
        category: item.category_c,
        monthlyLimit: item.monthly_limit_c,
        currentSpent: item.current_spent_c,
        month: item.month_c,
        year: item.year_c
      }));
    } catch (error) {
      console.error("Error fetching budgets:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "current_spent_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error(`Budget with Id ${id} not found`);
      }

      const item = response.data;
      return {
        Id: item.Id,
        Name: item.Name,
        Tags: item.Tags,
        category: item.category_c,
        monthlyLimit: item.monthly_limit_c,
        currentSpent: item.current_spent_c,
        month: item.month_c,
        year: item.year_c
      };
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error);
      throw error;
    }
  }

  async create(budget) {
    try {
      const params = {
        records: [{
          Name: `Budget for ${budget.category}`,
          category_c: budget.category,
          monthly_limit_c: parseFloat(budget.monthlyLimit),
          current_spent_c: parseFloat(budget.currentSpent || 0),
          month_c: budget.month,
          year_c: parseInt(budget.year)
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create budget:`, failed);
          throw new Error(failed[0].message || "Failed to create budget");
        }
        
        if (successful.length > 0) {
          const item = successful[0].data;
          return {
            Id: item.Id,
            Name: item.Name,
            Tags: item.Tags,
            category: item.category_c,
            monthlyLimit: item.monthly_limit_c,
            currentSpent: item.current_spent_c,
            month: item.month_c,
            year: item.year_c
          };
        }
      }
      
      throw new Error("No data returned from create operation");
    } catch (error) {
      console.error("Error creating budget:", error);
      throw error;
    }
  }

  async update(id, updatedBudget) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updatedBudget.Name || `Budget for ${updatedBudget.category}`,
          category_c: updatedBudget.category,
          monthly_limit_c: parseFloat(updatedBudget.monthlyLimit),
          current_spent_c: parseFloat(updatedBudget.currentSpent),
          month_c: updatedBudget.month,
          year_c: parseInt(updatedBudget.year)
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update budget:`, failed);
          throw new Error(failed[0].message || "Failed to update budget");
        }
        
        if (successful.length > 0) {
          const item = successful[0].data;
          return {
            Id: item.Id,
            Name: item.Name,
            Tags: item.Tags,
            category: item.category_c,
            monthlyLimit: item.monthly_limit_c,
            currentSpent: item.current_spent_c,
            month: item.month_c,
            year: item.year_c
          };
        }
      }
      
      throw new Error("No data returned from update operation");
    } catch (error) {
      console.error("Error updating budget:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete budget:`, failed);
          throw new Error(failed[0].message || "Failed to delete budget");
        }
        
        return { Id: parseInt(id) };
      }
      
      return { Id: parseInt(id) };
    } catch (error) {
      console.error("Error deleting budget:", error);
      throw error;
    }
  }

  // Additional utility methods
  async getByMonth(month, year) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "current_spent_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}}
        ],
        where: [
          {"FieldName": "month_c", "Operator": "EqualTo", "Values": [month], "Include": true},
          {"FieldName": "year_c", "Operator": "EqualTo", "Values": [parseInt(year)], "Include": true}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(item => ({
        Id: item.Id,
        Name: item.Name,
        Tags: item.Tags,
        category: item.category_c,
        monthlyLimit: item.monthly_limit_c,
        currentSpent: item.current_spent_c,
        month: item.month_c,
        year: item.year_c
      }));
    } catch (error) {
      console.error("Error fetching budgets by month:", error);
      return [];
    }
  }

  async getByCategory(category) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "monthly_limit_c"}},
          {"field": {"Name": "current_spent_c"}},
          {"field": {"Name": "month_c"}},
          {"field": {"Name": "year_c"}}
        ],
        where: [
          {"FieldName": "category_c", "Operator": "EqualTo", "Values": [category], "Include": true}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(item => ({
        Id: item.Id,
        Name: item.Name,
        Tags: item.Tags,
        category: item.category_c,
        monthlyLimit: item.monthly_limit_c,
        currentSpent: item.current_spent_c,
        month: item.month_c,
        year: item.year_c
      }));
    } catch (error) {
      console.error("Error fetching budgets by category:", error);
      return [];
    }
  }

  async getCurrentBudgets(month, year) {
    return this.getByMonth(month, year);
  }
}

const budgetServiceInstance = new BudgetService();
export default budgetServiceInstance;
export { budgetServiceInstance as budgetService };
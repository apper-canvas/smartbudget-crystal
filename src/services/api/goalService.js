// ApperClient integration for Goals using goal_c table

class GoalService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'goal_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching goals:", response.message);
        return [];
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching goals:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "Owner"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      };
      
      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(`Error fetching goal ${id}:`, response.message);
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching goal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(goal) {
    try {
      // Only include Updateable fields in create operation
      const params = {
        records: [{
          Name: goal.Name || goal.name_c || '',
          name_c: goal.name_c || goal.Name || '',
          target_amount_c: parseFloat(goal.target_amount_c) || 0,
          current_amount_c: parseFloat(goal.current_amount_c) || 0,
          deadline_c: goal.deadline_c || new Date().toISOString().split('T')[0],
          Tags: goal.Tags || ''
        }]
      };
      
      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error("Error creating goal:", response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} goals:`, failed);
          return null;
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
      
      return null;
    } catch (error) {
      console.error("Error creating goal:", error?.response?.data?.message || error);
      return null;
    }
  }

  async update(id, updatedGoal) {
    try {
      // Only include Updateable fields in update operation
      const params = {
        records: [{
          Id: parseInt(id),
          ...(updatedGoal.Name !== undefined && { Name: updatedGoal.Name }),
          ...(updatedGoal.name_c !== undefined && { name_c: updatedGoal.name_c }),
          ...(updatedGoal.target_amount_c !== undefined && { target_amount_c: parseFloat(updatedGoal.target_amount_c) }),
          ...(updatedGoal.current_amount_c !== undefined && { current_amount_c: parseFloat(updatedGoal.current_amount_c) }),
          ...(updatedGoal.deadline_c !== undefined && { deadline_c: updatedGoal.deadline_c }),
          ...(updatedGoal.Tags !== undefined && { Tags: updatedGoal.Tags })
        }]
      };
      
      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error updating goal ${id}:`, response.message);
        return null;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} goals:`, failed);
          return null;
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
      
      return null;
    } catch (error) {
      console.error(`Error updating goal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(`Error deleting goal ${id}:`, response.message);
        return false;
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} goals:`, failed);
          return false;
        }
        
        return successful.length > 0;
      }
      
      return false;
    } catch (error) {
      console.error(`Error deleting goal ${id}:`, error?.response?.data?.message || error);
      return false;
    }
  }

  // Additional utility methods using database queries
  async getCompleted() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: [
          {
            "FieldName": "current_amount_c",
            "Operator": "GreaterThanOrEqualTo",
            "Values": ["target_amount_c"]
          }
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching completed goals:", response.message);
        return [];
      }
      
      // Filter completed goals on client side for more reliable results
      return (response.data || []).filter(goal => 
        parseFloat(goal.current_amount_c || 0) >= parseFloat(goal.target_amount_c || 0)
      );
    } catch (error) {
      console.error("Error fetching completed goals:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getActive() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching active goals:", response.message);
        return [];
      }
      
      // Filter active goals on client side
      return (response.data || []).filter(goal => 
        parseFloat(goal.current_amount_c || 0) < parseFloat(goal.target_amount_c || 0)
      );
    } catch (error) {
      console.error("Error fetching active goals:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getOverdue() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "target_amount_c"}},
          {"field": {"Name": "current_amount_c"}},
          {"field": {"Name": "deadline_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        orderBy: [{"fieldName": "deadline_c", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching overdue goals:", response.message);
        return [];
      }
      
      // Filter overdue goals on client side for accurate date comparison
      const now = new Date();
      return (response.data || []).filter(goal => {
        if (!goal.deadline_c) return false;
        const deadline = new Date(goal.deadline_c);
        const currentAmount = parseFloat(goal.current_amount_c || 0);
        const targetAmount = parseFloat(goal.target_amount_c || 0);
        return deadline < now && currentAmount < targetAmount;
      });
    } catch (error) {
      console.error("Error fetching overdue goals:", error?.response?.data?.message || error);
      return [];
    }
  }
}

export default new GoalService();
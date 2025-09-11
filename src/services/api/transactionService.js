import { notificationService } from "@/services/api/notificationService";
// Transaction service using ApperClient for database operations
class TransactionService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'transaction_c';
    // Async delay method for simulating API response times
    this.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    try {
      await this.delay(300);
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform database field names to UI property names
      return response.data.map(transaction => this.transformTransactionData(transaction));
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      await this.delay(250);
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response?.data) {
        return null;
      }
      
      // Transform database field names to UI property names
      return this.transformTransactionData(response.data);
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(transaction) {
    try {
      await this.delay(400);
      
      // Only include Updateable fields
const transactionData = {
        Name: transaction.Name || transaction.description || 'Transaction',
        Tags: transaction.Tags || '',
        type_c: transaction.type_c || transaction.type,
        amount_c: parseFloat(transaction.amount_c || transaction.amount),
        category_c: transaction.category_c || transaction.category,
        description_c: transaction.description_c || transaction.description || '',
        date_c: transaction.date_c || transaction.date,
        frequency_c: transaction.frequency_c || transaction.frequency,
        is_active_c: transaction.is_active_c !== undefined ? transaction.is_active_c : transaction.is_active,
        next_date_c: transaction.next_date_c || transaction.next_date,
        created_at_c: new Date().toISOString()
      };

      const params = {
        records: [transactionData]
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
          console.error(`Failed to create ${failed.length} transactions:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successful.length > 0) {
          const createdTransaction = successful[0].data;
          // Transaction created successfully
          console.log(`New ${transactionData.type_c} transaction of $${transactionData.amount_c} has been added.`);
          setTimeout(async () => {
            await notificationService.checkBudgetAlerts();
          }, 100);
          
          return createdTransaction;
        }
      }
      
      throw new Error("Failed to create transaction");
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, updatedTransaction) {
    try {
      await this.delay(350);
      
      // Only include Updateable fields plus Id
const transactionData = {
        Id: parseInt(id),
        Name: updatedTransaction.Name || updatedTransaction.description || 'Transaction',
        Tags: updatedTransaction.Tags || '',
        type_c: updatedTransaction.type_c || updatedTransaction.type,
        amount_c: parseFloat(updatedTransaction.amount_c || updatedTransaction.amount),
        category_c: updatedTransaction.category_c || updatedTransaction.category,
        description_c: updatedTransaction.description_c || updatedTransaction.description || '',
        date_c: updatedTransaction.date_c || updatedTransaction.date,
        frequency_c: updatedTransaction.frequency_c || updatedTransaction.frequency,
        is_active_c: updatedTransaction.is_active_c !== undefined ? updatedTransaction.is_active_c : updatedTransaction.is_active,
        next_date_c: updatedTransaction.next_date_c || updatedTransaction.next_date,
        created_at_c: updatedTransaction.created_at_c || new Date().toISOString()
      };

      const params = {
        records: [transactionData]
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
          console.error(`Failed to update ${failed.length} transactions:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successful.length > 0) {
          return successful[0].data;
        }
      }
      
      throw new Error("Failed to update transaction");
    } catch (error) {
      console.error("Error updating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await this.delay(300);
      
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} transactions:${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successful.length > 0) {
          // Transaction deleted successfully
          console.log("Transaction has been successfully deleted.");
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error deleting transaction:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getByDateRange(startDate, endDate) {
    try {
      await this.delay(250);
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: [
          {"FieldName": "date_c", "Operator": "GreaterThanOrEqualTo", "Values": [startDate]},
          {"FieldName": "date_c", "Operator": "LessThanOrEqualTo", "Values": [endDate]}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform database field names to UI property names
      return response.data.map(transaction => this.transformTransactionData(transaction));
    } catch (error) {
      console.error("Error fetching transactions by date range:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByCategory(category) {
    try {
      await this.delay(250);
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: [
          {"FieldName": "category_c", "Operator": "EqualTo", "Values": [category]}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform database field names to UI property names
      return response.data.map(transaction => this.transformTransactionData(transaction));
    } catch (error) {
      console.error("Error fetching transactions by category:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getByType(type) {
    try {
      await this.delay(250);
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: [
          {"FieldName": "type_c", "Operator": "EqualTo", "Values": [type]}
        ],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform database field names to UI property names
      return response.data.map(transaction => this.transformTransactionData(transaction));
    } catch (error) {
      console.error("Error fetching transactions by type:", error?.response?.data?.message || error);
      return [];
    }
  }

  async filter(filters) {
    try {
      await this.delay(300);
      
      let whereConditions = [];
      
      if (filters.type) {
        whereConditions.push({"FieldName": "type_c", "Operator": "EqualTo", "Values": [filters.type]});
      }
      
      if (filters.category) {
        whereConditions.push({"FieldName": "category_c", "Operator": "Contains", "Values": [filters.category]});
      }
      
      if (filters.minAmount) {
        whereConditions.push({"FieldName": "amount_c", "Operator": "GreaterThanOrEqualTo", "Values": [parseFloat(filters.minAmount)]});
      }
      
      if (filters.maxAmount) {
        whereConditions.push({"FieldName": "amount_c", "Operator": "LessThanOrEqualTo", "Values": [parseFloat(filters.maxAmount)]});
      }
      
      if (filters.startDate) {
        whereConditions.push({"FieldName": "date_c", "Operator": "GreaterThanOrEqualTo", "Values": [filters.startDate]});
      }
      
      if (filters.endDate) {
        whereConditions.push({"FieldName": "date_c", "Operator": "LessThanOrEqualTo", "Values": [filters.endDate]});
      }
      
      if (filters.search) {
        whereConditions.push({
          "FieldName": "description_c", 
          "Operator": "Contains", 
          "Values": [filters.search]
        });
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: whereConditions,
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform database field names to UI property names
      return response.data.map(transaction => this.transformTransactionData(transaction));
    } catch (error) {
      console.error("Error filtering transactions:", error?.response?.data?.message || error);
      return [];
    }
  }

  async search(query, type = null, category = null, dateFrom = null, dateTo = null, amountRange = null) {
    try {
      await this.delay(300);
      
      let whereConditions = [];
      let whereGroups = null;
      
      if (query) {
        whereGroups = {
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "description_c", "operator": "Contains", "values": [query]},
                {"fieldName": "category_c", "operator": "Contains", "values": [query]},
                {"fieldName": "Name", "operator": "Contains", "values": [query]}
              ],
              "operator": "OR"
            }
          ]
        };
      }
      
      if (type) {
        whereConditions.push({"FieldName": "type_c", "Operator": "EqualTo", "Values": [type]});
      }
      
      if (category) {
        whereConditions.push({"FieldName": "category_c", "Operator": "Contains", "Values": [category]});
      }
      
      if (dateFrom) {
        whereConditions.push({"FieldName": "date_c", "Operator": "GreaterThanOrEqualTo", "Values": [dateFrom]});
      }
      
      if (dateTo) {
        whereConditions.push({"FieldName": "date_c", "Operator": "LessThanOrEqualTo", "Values": [dateTo]});
      }
      
      if (amountRange && amountRange.min !== undefined) {
        whereConditions.push({"FieldName": "amount_c", "Operator": "GreaterThanOrEqualTo", "Values": [parseFloat(amountRange.min)]});
      }
      
      if (amountRange && amountRange.max !== undefined) {
        whereConditions.push({"FieldName": "amount_c", "Operator": "LessThanOrEqualTo", "Values": [parseFloat(amountRange.max)]});
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: whereConditions,
        whereGroups: whereGroups ? [whereGroups] : [],
        orderBy: [{"fieldName": "date_c", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }
      
      if (!response.data || response.data.length === 0) {
        return [];
      }
      
      // Transform database field names to UI property names
      return response.data.map(transaction => this.transformTransactionData(transaction));
    } catch (error) {
      console.error("Error searching transactions:", error?.response?.data?.message || error);
      return [];
    }
  }

  // Transform database field names to UI property names
transformTransactionData(transaction) {
    if (!transaction) return null;
    
    return {
      ...transaction, // Keep all original fields (Id, Name, Tags, system fields)
      type: transaction.type_c || transaction.type,
      amount: transaction.amount_c || transaction.amount,
      category: transaction.category_c || transaction.category,
      description: transaction.description_c || transaction.description || transaction.Name,
      date: transaction.date_c || transaction.date,
      frequency: transaction.frequency_c || transaction.frequency,
      is_active: transaction.is_active_c !== undefined ? transaction.is_active_c : transaction.is_active,
      next_date: transaction.next_date_c || transaction.next_date,
      createdAt: transaction.created_at_c || transaction.createdAt || transaction.CreatedOn
    };
  }

  // Recurring transaction methods
  async getAllRecurring() {
    try {
      await this.delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "amount_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "date_c"}},
          {"field": {"Name": "frequency_c"}},
          {"field": {"Name": "is_active_c"}},
          {"field": {"Name": "next_date_c"}},
          {"field": {"Name": "created_at_c"}}
        ],
        where: [{"FieldName": "frequency_c", "Operator": "HasValue", "Values": [""]}],
        orderBy: [{"fieldName": "Id", "sorttype": "DESC"}]
      };

      const response = await apperClient.fetchRecords('transaction_c', params);
      
      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(transaction => this.transformTransactionData(transaction));
    } catch (error) {
      console.error('Error fetching recurring transactions:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async createRecurring(transaction) {
    try {
      await this.delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const transactionData = {
        Name: transaction.Name || transaction.description || 'Recurring Transaction',
        Tags: transaction.Tags || '',
        type_c: transaction.type_c || transaction.type,
        amount_c: parseFloat(transaction.amount_c || transaction.amount),
        category_c: transaction.category_c || transaction.category,
        description_c: transaction.description_c || transaction.description || '',
        date_c: transaction.date_c || transaction.date,
        frequency_c: transaction.frequency_c || transaction.frequency,
        is_active_c: transaction.is_active_c !== undefined ? transaction.is_active_c : transaction.is_active,
        next_date_c: transaction.next_date_c || transaction.next_date,
        created_at_c: new Date().toISOString()
      };

      const params = {
        records: [transactionData]
      };

      const response = await apperClient.createRecord('transaction_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} recurring transactions:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successful.length > 0) {
          await notificationService.create({
            type: 'success',
            title: 'Recurring Transaction Created',
            message: `Successfully created recurring ${transactionData.type_c}: ${transactionData.description_c}`,
            userId: 1
          });
          
          return this.transformTransactionData(successful[0].data);
        }
      }
    } catch (error) {
      console.error('Error creating recurring transaction:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async updateRecurring(id, updatedTransaction) {
    try {
      await this.delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const transactionData = {
        Id: parseInt(id),
        Name: updatedTransaction.Name || updatedTransaction.description || 'Recurring Transaction',
        Tags: updatedTransaction.Tags || '',
        type_c: updatedTransaction.type_c || updatedTransaction.type,
        amount_c: parseFloat(updatedTransaction.amount_c || updatedTransaction.amount),
        category_c: updatedTransaction.category_c || updatedTransaction.category,
        description_c: updatedTransaction.description_c || updatedTransaction.description || '',
        date_c: updatedTransaction.date_c || updatedTransaction.date,
        frequency_c: updatedTransaction.frequency_c || updatedTransaction.frequency,
        is_active_c: updatedTransaction.is_active_c !== undefined ? updatedTransaction.is_active_c : updatedTransaction.is_active,
        next_date_c: updatedTransaction.next_date_c || updatedTransaction.next_date,
        created_at_c: updatedTransaction.created_at_c || new Date().toISOString()
      };

      const params = {
        records: [transactionData]
      };

      const response = await apperClient.updateRecord('transaction_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} recurring transactions:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successful.length > 0) {
          await notificationService.create({
            type: 'info',
            title: 'Recurring Transaction Updated',
            message: `Successfully updated recurring ${transactionData.type_c}: ${transactionData.description_c}`,
            userId: 1
          });
          
          return this.transformTransactionData(successful[0].data);
        }
      }
    } catch (error) {
      console.error('Error updating recurring transaction:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async deleteRecurring(id) {
    try {
      await this.delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord('transaction_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} recurring transactions:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successful.length > 0) {
          await notificationService.create({
            type: 'warning',
            title: 'Recurring Transaction Deleted',
            message: 'Recurring transaction has been successfully deleted',
            userId: 1
          });
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting recurring transaction:', error?.response?.data?.message || error);
      throw error;
    }
  }

  async toggleRecurringStatus(id, isActive) {
    try {
      await this.delay(300);
      
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const transactionData = {
        Id: parseInt(id),
        is_active_c: isActive
      };

      const params = {
        records: [transactionData]
      };

      const response = await apperClient.updateRecord('transaction_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to toggle ${failed.length} recurring transaction status:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successful.length > 0) {
          await notificationService.create({
            type: 'info',
            title: `Recurring Transaction ${isActive ? 'Activated' : 'Paused'}`,
            message: `Recurring transaction has been ${isActive ? 'activated' : 'paused'}`,
            userId: 1
          });
          
          return this.transformTransactionData(successful[0].data);
        }
      }
    } catch (error) {
      console.error('Error toggling recurring transaction status:', error?.response?.data?.message || error);
      throw error;
    }
}
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const transactionService = new TransactionService();
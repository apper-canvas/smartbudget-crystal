// Bank Account service using ApperClient for database integration
class BankAccountService {
  constructor() {
    // Initialize ApperClient for database operations
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Database table name for bank accounts
    this.tableName = 'bank_account_c';
    
    // Define updateable fields for create/update operations (excluding System fields)
    this.updateableFields = [
      'Name',
      'Tags', 
      'account_number_c',
      'bank_name_c',
      'account_type_c',
      'routing_number_c',
      'currency_c',
      'balance_c',
      'iban_c',
      'swift_code_c'
    ];
  }

  // Get all bank accounts
// Transform database record to UI format for compatibility
  transformToUIFormat(record) {
    return {
      Id: record.Id,
      accountName: record.Name || '',
      bankName: record.bank_name_c || '',
      accountNumber: record.account_number_c || '',
      routingNumber: record.routing_number_c || '',
      accountType: record.account_type_c || 'Checking',
      balance: parseFloat(record.balance_c) || 0,
      currency: record.currency_c || 'USD',
      description: record.Name || '', // Using Name as description for compatibility
      iban: record.iban_c || '',
      swiftCode: record.swift_code_c || '',
      // Business logic fields (not stored in database)
      isActive: true, // Assume active if record exists
      isDefault: false, // Handle as business logic if needed
      lastUpdated: record.ModifiedOn || record.CreatedOn || new Date().toISOString()
    };
  }

  // Transform UI format to database format for create/update
transformToDbFormat(uiData) {
    const dbData = {};
    
    // Map updateable fields only
    if (uiData.accountName !== undefined) dbData.Name = uiData.accountName;
    if (uiData.tags !== undefined) dbData.Tags = uiData.tags;
    if (uiData.accountNumber !== undefined) dbData.account_number_c = uiData.accountNumber;
    if (uiData.bankName !== undefined) dbData.bank_name_c = uiData.bankName;
    if (uiData.accountType !== undefined) {
      // Normalize account type to match database picklist values
      const accountType = uiData.accountType.toLowerCase();
      switch (accountType) {
        case 'checking':
          dbData.account_type_c = 'Checking';
          break;
        case 'savings':
          dbData.account_type_c = 'Savings';
          break;
        case 'money market':
          dbData.account_type_c = 'Money Market';
          break;
        case 'cd':
          dbData.account_type_c = 'CD';
          break;
        case 'other':
          dbData.account_type_c = 'Other';
          break;
        default:
          dbData.account_type_c = uiData.accountType; // Use as-is if already proper format
      }
    }
    if (uiData.routingNumber !== undefined) dbData.routing_number_c = uiData.routingNumber;
    if (uiData.currency !== undefined) dbData.currency_c = uiData.currency;
    if (uiData.balance !== undefined) dbData.balance_c = parseFloat(uiData.balance) || 0;
    if (uiData.iban !== undefined) dbData.iban_c = uiData.iban;
    if (uiData.swiftCode !== undefined) dbData.swift_code_c = uiData.swiftCode;
    
    return dbData;
  }

  // Get all bank accounts
  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "account_number_c"}},
          {"field": {"Name": "bank_name_c"}},
          {"field": {"Name": "account_type_c"}},
          {"field": {"Name": "routing_number_c"}},
          {"field": {"Name": "currency_c"}},
          {"field": {"Name": "balance_c"}},
          {"field": {"Name": "iban_c"}},
          {"field": {"Name": "swift_code_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to fetch bank accounts:', response.message);
        throw new Error(response.message);
      }

      const accounts = (response.data || []).map(record => this.transformToUIFormat(record));
      
      // Sort by account name for UI consistency
      return accounts.sort((a, b) => a.accountName.localeCompare(b.accountName));
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      throw new Error('Failed to fetch bank accounts');
    }
  }

  // Get bank account by ID
  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "account_number_c"}},
          {"field": {"Name": "bank_name_c"}},
          {"field": {"Name": "account_type_c"}},
          {"field": {"Name": "routing_number_c"}},
          {"field": {"Name": "currency_c"}},
          {"field": {"Name": "balance_c"}},
          {"field": {"Name": "iban_c"}},
          {"field": {"Name": "swift_code_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error(`Bank account with ID ${id} not found`);
      }

      return this.transformToUIFormat(response.data);
    } catch (error) {
      console.error(`Error fetching bank account ${id}:`, error);
      throw error;
    }
  }

  // Create new bank account
  async create(accountData) {
    try {
      // Validate required fields
      if (!accountData.accountName || !accountData.bankName || !accountData.accountType) {
        throw new Error('Account name, bank name, and account type are required');
      }

      // Transform to database format
      const dbData = this.transformToDbFormat(accountData);
      
      const params = {
        records: [dbData]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to create bank account:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create bank account:`, failed);
          const errorMessage = failed[0].message || 'Failed to create bank account';
          throw new Error(errorMessage);
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          return this.transformToUIFormat(successful[0].data);
        }
      }

      throw new Error('Failed to create bank account');
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw error;
    }
  }

  // Update existing bank account
  async update(id, updatedData) {
    try {
      // Transform to database format
      const dbData = this.transformToDbFormat(updatedData);
      dbData.Id = parseInt(id); // Ensure ID is included

      const params = {
        records: [dbData]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to update bank account:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update bank account:`, failed);
          const errorMessage = failed[0].message || 'Failed to update bank account';
          throw new Error(errorMessage);
        }

        const successful = response.results.filter(r => r.success);
        if (successful.length > 0) {
          return this.transformToUIFormat(successful[0].data);
        }
      }

      throw new Error('Failed to update bank account');
    } catch (error) {
      console.error(`Error updating bank account ${id}:`, error);
      throw error;
    }
  }

  // Delete bank account
  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to delete bank account:', response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete bank account:`, failed);
          const errorMessage = failed[0].message || 'Failed to delete bank account';
          throw new Error(errorMessage);
        }
      }

      return { success: true };
    } catch (error) {
      console.error(`Error deleting bank account ${id}:`, error);
      throw error;
    }
  }

  // Get accounts by type
  async getByType(accountType) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "account_number_c"}},
          {"field": {"Name": "bank_name_c"}},
          {"field": {"Name": "account_type_c"}},
          {"field": {"Name": "routing_number_c"}},
          {"field": {"Name": "currency_c"}},
          {"field": {"Name": "balance_c"}},
          {"field": {"Name": "iban_c"}},
          {"field": {"Name": "swift_code_c"}}
        ],
        where: [{"FieldName": "account_type_c", "Operator": "EqualTo", "Values": [accountType]}],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(`Failed to fetch ${accountType} accounts:`, response.message);
        throw new Error(`Failed to fetch ${accountType} accounts`);
      }

      return (response.data || []).map(record => this.transformToUIFormat(record));
    } catch (error) {
      console.error(`Error fetching ${accountType} accounts:`, error);
      throw new Error(`Failed to fetch ${accountType} accounts`);
    }
  }

  // Get active accounts (all accounts for now, as isActive is not stored in database)
  async getActive() {
    return this.getAll();
  }

  // Get total balance across all accounts
  async getTotalBalance() {
    try {
      const accounts = await this.getAll();
      const total = accounts.reduce((sum, acc) => {
        // Only include positive balances (exclude credit card debt)
        return sum + (acc.balance > 0 ? acc.balance : 0);
      }, 0);
      
      return total;
    } catch (error) {
      console.error('Error calculating total balance:', error);
      throw new Error('Failed to calculate total balance');
    }
  }

  // Search accounts by name or bank
  async search(query) {
    try {
      if (!query || query.trim() === '') {
        return await this.getAll();
      }

      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "account_number_c"}},
          {"field": {"Name": "bank_name_c"}},
          {"field": {"Name": "account_type_c"}},
          {"field": {"Name": "routing_number_c"}},
          {"field": {"Name": "currency_c"}},
          {"field": {"Name": "balance_c"}},
          {"field": {"Name": "iban_c"}},
          {"field": {"Name": "swift_code_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "Name", "operator": "Contains", "values": [query]}
              ]
            },
            {
              "conditions": [
                {"fieldName": "bank_name_c", "operator": "Contains", "values": [query]}
              ]
            }
          ]
        }],
        orderBy: [{"fieldName": "Name", "sorttype": "ASC"}]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error('Failed to search bank accounts:', response.message);
        throw new Error('Failed to search bank accounts');
      }

      return (response.data || []).map(record => this.transformToUIFormat(record));
    } catch (error) {
      console.error('Error searching bank accounts:', error);
      throw new Error('Failed to search bank accounts');
    }
  }

  // Get account types summary
  async getAccountTypesSummary() {
    try {
      const accounts = await this.getAll();
      const summary = accounts.reduce((acc, account) => {
        const type = account.accountType;
        if (!acc[type]) {
          acc[type] = { count: 0, totalBalance: 0 };
        }
        acc[type].count += 1;
        acc[type].totalBalance += account.balance;
        return acc;
      }, {});

      return summary;
    } catch (error) {
      console.error('Error getting account types summary:', error);
      throw new Error('Failed to get account types summary');
    }
  }

}

// Create and export singleton instance
const bankAccountService = new BankAccountService();
export default bankAccountService;
import mockData from '@/services/mockData/bankAccounts.json';

// Bank Account service using mock data for development
class BankAccountService {
  constructor() {
    // Store mock data in memory
    this.accounts = [...mockData];
    // Async delay method for simulating API response times
    this.delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all bank accounts
  async getAll() {
    await this.delay(300);
    try {
      return [...this.accounts].sort((a, b) => {
        // Sort by default account first, then by account name
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return a.accountName.localeCompare(b.accountName);
      });
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      throw new Error('Failed to fetch bank accounts');
    }
  }

  // Get bank account by ID
  async getById(id) {
    await this.delay(200);
    try {
      const accountId = parseInt(id);
      const account = this.accounts.find(acc => acc.Id === accountId);
      
      if (!account) {
        throw new Error(`Bank account with ID ${id} not found`);
      }
      
      return { ...account };
    } catch (error) {
      console.error(`Error fetching bank account ${id}:`, error);
      throw error;
    }
  }

  // Create new bank account
  async create(accountData) {
    await this.delay(400);
    try {
      // Validate required fields
      if (!accountData.accountName || !accountData.bankName || !accountData.accountType) {
        throw new Error('Account name, bank name, and account type are required');
      }

      // Generate new ID
      const newId = Math.max(...this.accounts.map(acc => acc.Id), 0) + 1;
      
      // Create new account object
      const newAccount = {
        Id: newId,
        accountName: accountData.accountName,
        bankName: accountData.bankName,
        accountNumber: accountData.accountNumber || `****${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        routingNumber: accountData.routingNumber || '',
        accountType: accountData.accountType,
        balance: parseFloat(accountData.balance) || 0,
        currency: accountData.currency || 'USD',
        isActive: accountData.isActive !== false,
        isDefault: accountData.isDefault === true,
        lastUpdated: new Date().toISOString(),
        description: accountData.description || ''
      };

      // If setting as default, remove default from other accounts
      if (newAccount.isDefault) {
        this.accounts = this.accounts.map(acc => ({
          ...acc,
          isDefault: false
        }));
      }

      // Add to accounts array
      this.accounts.push(newAccount);
      
      return { ...newAccount };
    } catch (error) {
      console.error('Error creating bank account:', error);
      throw error;
    }
  }

  // Update existing bank account
  async update(id, updatedData) {
    await this.delay(350);
    try {
      const accountId = parseInt(id);
      const accountIndex = this.accounts.findIndex(acc => acc.Id === accountId);
      
      if (accountIndex === -1) {
        throw new Error(`Bank account with ID ${id} not found`);
      }

      // If setting as default, remove default from other accounts
      if (updatedData.isDefault === true) {
        this.accounts = this.accounts.map(acc => ({
          ...acc,
          isDefault: acc.Id === accountId ? true : false
        }));
      }

      // Update the account
      this.accounts[accountIndex] = {
        ...this.accounts[accountIndex],
        ...updatedData,
        Id: accountId, // Ensure ID doesn't change
        lastUpdated: new Date().toISOString(),
        balance: updatedData.balance !== undefined ? parseFloat(updatedData.balance) : this.accounts[accountIndex].balance
      };

      return { ...this.accounts[accountIndex] };
    } catch (error) {
      console.error(`Error updating bank account ${id}:`, error);
      throw error;
    }
  }

  // Delete bank account
  async delete(id) {
    await this.delay(250);
    try {
      const accountId = parseInt(id);
      const accountIndex = this.accounts.findIndex(acc => acc.Id === accountId);
      
      if (accountIndex === -1) {
        throw new Error(`Bank account with ID ${id} not found`);
      }

      // Don't allow deletion of default account if there are other active accounts
      const account = this.accounts[accountIndex];
      const otherActiveAccounts = this.accounts.filter(acc => 
        acc.Id !== accountId && acc.isActive
      );

      if (account.isDefault && otherActiveAccounts.length > 0) {
        throw new Error('Cannot delete default account. Please set another account as default first.');
      }

      // Remove from accounts array
      this.accounts.splice(accountIndex, 1);
      
      return { success: true };
    } catch (error) {
      console.error(`Error deleting bank account ${id}:`, error);
      throw error;
    }
  }

  // Get accounts by type
  async getByType(accountType) {
    await this.delay(200);
    try {
      const filteredAccounts = this.accounts
        .filter(acc => acc.accountType === accountType && acc.isActive)
        .sort((a, b) => a.accountName.localeCompare(b.accountName));
      
      return [...filteredAccounts];
    } catch (error) {
      console.error(`Error fetching ${accountType} accounts:`, error);
      throw new Error(`Failed to fetch ${accountType} accounts`);
    }
  }

  // Get active accounts only
  async getActive() {
    await this.delay(200);
    try {
      const activeAccounts = this.accounts
        .filter(acc => acc.isActive)
        .sort((a, b) => {
          // Sort by default first, then by name
          if (a.isDefault && !b.isDefault) return -1;
          if (!a.isDefault && b.isDefault) return 1;
          return a.accountName.localeCompare(b.accountName);
        });
      
      return [...activeAccounts];
    } catch (error) {
      console.error('Error fetching active accounts:', error);
      throw new Error('Failed to fetch active accounts');
    }
  }

  // Get total balance across all active accounts
  async getTotalBalance() {
    await this.delay(150);
    try {
      const activeAccounts = this.accounts.filter(acc => acc.isActive);
      const total = activeAccounts.reduce((sum, acc) => {
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
    await this.delay(200);
    try {
      if (!query || query.trim() === '') {
        return await this.getAll();
      }

      const searchQuery = query.toLowerCase().trim();
      const results = this.accounts.filter(acc => 
        acc.accountName.toLowerCase().includes(searchQuery) ||
        acc.bankName.toLowerCase().includes(searchQuery) ||
        acc.description.toLowerCase().includes(searchQuery)
      );

      return [...results].sort((a, b) => a.accountName.localeCompare(b.accountName));
    } catch (error) {
      console.error('Error searching bank accounts:', error);
      throw new Error('Failed to search bank accounts');
    }
  }

  // Get account types summary
  async getAccountTypesSummary() {
    await this.delay(200);
    try {
      const activeAccounts = this.accounts.filter(acc => acc.isActive);
      const summary = activeAccounts.reduce((acc, account) => {
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
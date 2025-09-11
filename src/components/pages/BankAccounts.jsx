import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '@/utils/formatters';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import bankAccountService from '@/services/api/bankAccountService';

const BankAccounts = () => {
  // State management
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

// Form state
  const [formData, setFormData] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'Checking',
    balance: '',
    description: '',
    isDefault: false,
    isActive: true
  });

  // Load accounts on component mount
  useEffect(() => {
    loadAccounts();
  }, []);

  // Load all bank accounts
  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bankAccountService.getAll();
      setAccounts(data);
    } catch (err) {
      console.error('Error loading bank accounts:', err);
      setError('Failed to load bank accounts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter accounts based on search and type
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = !searchQuery || 
      account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.bankName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || account.accountType === filterType;
    
    return matchesSearch && matchesType;
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.accountName.trim() || !formData.bankName.trim()) {
      toast.error('Account name and bank name are required');
      return;
    }

    try {
      setFormLoading(true);
      
      const accountData = {
        ...formData,
        balance: parseFloat(formData.balance) || 0
      };

      if (editingAccount) {
        // Update existing account
        await bankAccountService.update(editingAccount.Id, accountData);
        toast.success('Account updated successfully');
      } else {
        // Create new account
        await bankAccountService.create(accountData);
        toast.success('Account created successfully');
      }

      // Refresh accounts and close form
      await loadAccounts();
      closeForm();
    } catch (err) {
      console.error('Error saving account:', err);
      toast.error(err.message || 'Failed to save account');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete account
  const handleDelete = async (account) => {
    try {
      await bankAccountService.delete(account.Id);
      toast.success('Account deleted successfully');
      await loadAccounts();
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting account:', err);
      toast.error(err.message || 'Failed to delete account');
    }
  };

  // Open form for new account
const openNewForm = useCallback(() => {
    setFormData({
      accountName: '',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'Checking',
      balance: '',
      description: '',
      isDefault: false,
      isActive: true
    });
    setEditingAccount(null);
    setShowForm(true);
  }, []);

  // Open form for editing account
  const openEditForm = useCallback((account) => {
    setFormData({
      accountName: account.accountName,
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      routingNumber: account.routingNumber,
      accountType: account.accountType,
      balance: account.balance.toString(),
      description: account.description,
      isDefault: account.isDefault,
      isActive: account.isActive
    });
    setEditingAccount(account);
    setShowForm(true);
  }, []);

  // Close form and reset state
const closeForm = useCallback(() => {
    setShowForm(false);
    setEditingAccount(null);
    setFormData({
      accountName: '',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'Checking',
      balance: '',
      description: '',
      isDefault: false,
      isActive: true
    });
  }, []);

  // Calculate total balance for active accounts
  const totalBalance = accounts
    .filter(acc => acc.isActive && acc.balance > 0)
    .reduce((sum, acc) => sum + acc.balance, 0);

  // Get account type icon
  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'checking': return 'CreditCard';
      case 'savings': return 'PiggyBank';
      case 'credit': return 'CreditCard';
      case 'investment': return 'TrendingUp';
      default: return 'Building';
    }
  };

  // Get account type color
  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'checking': return 'bg-blue-100 text-blue-800';
      case 'savings': return 'bg-green-100 text-green-800';
      case 'credit': return 'bg-orange-100 text-orange-800';
      case 'investment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state
  if (loading) {
    return <Loading type="list" />;
  }

  // Show error state
  if (error) {
    return <Error message={error} onRetry={loadAccounts} />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank Accounts</h1>
          <p className="text-gray-600">
            Manage your bank accounts and track balances
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Balance</p>
            <p className="text-2xl font-bold text-primary">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <Button 
            onClick={openNewForm}
            icon="Plus"
            className="shrink-0"
          >
            Add Account
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon="Search"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">All Types</option>
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit</option>
              <option value="investment">Investment</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Accounts List */}
      {filteredAccounts.length === 0 ? (
        <Empty 
          type="accounts"
          title="No bank accounts found"
          description={searchQuery || filterType !== 'all' 
            ? "No accounts match your current filters" 
            : "Start by adding your first bank account"
          }
          actionText="Add Account"
          onAction={openNewForm}
          icon="CreditCard"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAccounts.map((account) => (
            <motion.div
key={account.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              layout
            >
              <Card hover className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <ApperIcon 
                        name={getAccountTypeIcon(account.accountType)} 
                        size={24} 
                        className="text-primary" 
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {account.accountName}
                        {account.isDefault && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                            Default
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{account.bankName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Edit"
                      onClick={() => openEditForm(account)}
                      className="p-2"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="Trash2"
                      onClick={() => setDeleteConfirm(account)}
                      className="p-2 text-red-600 hover:text-red-700"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Balance</span>
                    <span className={`text-lg font-semibold ${
                      account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(account.balance)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Account Type</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAccountTypeColor(account.accountType)}`}>
                      {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Account Number</span>
                    <span className="text-sm font-mono text-gray-900">
                      {account.accountNumber}
                    </span>
                  </div>

                  {account.description && (
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{account.description}</p>
                    </div>
                  )}

                  {!account.isActive && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <ApperIcon name="AlertCircle" size={12} className="mr-1" />
                        Inactive
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Account Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && closeForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAccount ? 'Edit Account' : 'Add Account'}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  icon="X"
                  onClick={closeForm}
                  className="p-2"
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Account Name"
                  value={formData.accountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                  placeholder="e.g. Main Checking"
                  required
                />

                <Input
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g. Chase Bank"
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Account Number"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="****1234"
                  />

                  <div>
                    <label className="label-field">Account Type</label>
                    <select
                      value={formData.accountType}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountType: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="credit">Credit</option>
                      <option value="investment">Investment</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Balance"
                    type="number"
                    step="0.01"
                    value={formData.balance}
                    onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                    placeholder="0.00"
                  />

                  <Input
                    label="Routing Number"
                    value={formData.routingNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, routingNumber: e.target.value }))}
                    placeholder="123456789"
                  />
                </div>

                <Input
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g. Primary account for daily expenses"
                />

                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Set as default account
                    </span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Account is active
                    </span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                    disabled={formLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={formLoading}
                    disabled={formLoading}
                  >
                    {editingAccount ? 'Update Account' : 'Add Account'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <ApperIcon name="AlertTriangle" size={24} className="text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Account
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete "<strong>{deleteConfirm.accountName}</strong>"? 
                This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete Account
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BankAccounts;
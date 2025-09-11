import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import TransactionForm from '@/components/organisms/TransactionForm';
import SearchFilter from '@/components/molecules/SearchFilter';
import { transactionService } from '@/services/api/transactionService';
import categoryService from '@/services/api/categoryService';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import { toast } from 'react-toastify';
import { formatCurrency, formatDate } from '@/utils/formatters';
import ApperIcon from '@/components/ApperIcon';

const RecurringTransactions = () => {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    frequency: '',
    status: '',
    type: ''
  });

  useEffect(() => {
    loadRecurringTransactions();
  }, []);

  const loadRecurringTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await transactionService.getAllRecurring();
      setRecurringTransactions(data || []);
    } catch (err) {
      console.error('Error loading recurring transactions:', err);
      setError('Failed to load recurring transactions');
      toast.error('Failed to load recurring transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const handleAddRecurring = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditRecurring = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteRecurring = async (transactionId) => {
    if (!confirm('Are you sure you want to delete this recurring transaction?')) {
      return;
    }

    try {
      await transactionService.deleteRecurring(transactionId);
      toast.success('Recurring transaction deleted successfully');
      loadRecurringTransactions();
    } catch (err) {
      console.error('Error deleting recurring transaction:', err);
      toast.error('Failed to delete recurring transaction');
    }
  };

  const handleToggleStatus = async (transactionId, currentStatus) => {
    try {
      await transactionService.toggleRecurringStatus(transactionId, !currentStatus);
      toast.success(`Recurring transaction ${!currentStatus ? 'activated' : 'paused'} successfully`);
      loadRecurringTransactions();
    } catch (err) {
      console.error('Error toggling recurring transaction status:', err);
      toast.error('Failed to update recurring transaction status');
    }
  };

  const handleSubmitRecurring = async (transactionData) => {
    try {
      if (editingTransaction) {
        await transactionService.updateRecurring(editingTransaction.Id, transactionData);
        toast.success('Recurring transaction updated successfully');
      } else {
        await transactionService.createRecurring(transactionData);
        toast.success('Recurring transaction created successfully');
      }
      setShowForm(false);
      setEditingTransaction(null);
      loadRecurringTransactions();
    } catch (err) {
      console.error('Error saving recurring transaction:', err);
      toast.error('Failed to save recurring transaction');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const getFilteredTransactions = () => {
    if (!recurringTransactions) return [];
    
    return recurringTransactions.filter(transaction => {
      const matchesSearch = !filters.search || 
        transaction.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesFrequency = !filters.frequency || transaction.frequency === filters.frequency;
      const matchesStatus = !filters.status || 
        (filters.status === 'active' && transaction.is_active) ||
        (filters.status === 'inactive' && !transaction.is_active);
      const matchesType = !filters.type || transaction.type === filters.type;
      
      return matchesSearch && matchesFrequency && matchesStatus && matchesType;
    });
  };

  const getFrequencyBadge = (frequency) => {
    const colors = {
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800',
      yearly: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={colors[frequency] || 'bg-gray-100 text-gray-800'}>
        {frequency?.charAt(0).toUpperCase() + frequency?.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (isActive) => {
    return (
      <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
        {isActive ? 'Active' : 'Paused'}
      </Badge>
    );
  };

  const calculateNextOccurrence = (lastDate, frequency) => {
    const date = new Date(lastDate);
    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        return 'Unknown';
    }
    return formatDate(date.toISOString());
  };

  if (loading) {
    return <Loading message="Loading recurring transactions..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadRecurringTransactions} />;
  }

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Recurring Transactions
            </h1>
            <p className="text-gray-600">
              Manage your recurring income and expenses
            </p>
          </div>
          <Button
            onClick={handleAddRecurring}
            icon="Plus"
            className="shadow-md hover:shadow-lg"
          >
            Add Recurring Transaction
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <SearchFilter
          onFilter={handleFilter}
          placeholder="Search recurring transactions..."
          additionalFilters={[
            {
              key: 'frequency',
              label: 'Frequency',
              options: [
                { value: '', label: 'All Frequencies' },
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ]
            },
            {
              key: 'status',
              label: 'Status',
              options: [
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Paused' }
              ]
            },
            {
              key: 'type',
              label: 'Type',
              options: [
                { value: '', label: 'All Types' },
                { value: 'income', label: 'Income' },
                { value: 'expense', label: 'Expense' }
              ]
            }
          ]}
        />
      </motion.div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="mb-6"
        >
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={handleSubmitRecurring}
            onCancel={handleCancelForm}
            isRecurring={true}
          />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredTransactions.length === 0 ? (
          <Empty
            icon="Repeat"
            title="No recurring transactions found"
            description={
              filters.search || filters.frequency || filters.status || filters.type
                ? "Try adjusting your search criteria to find more recurring transactions."
                : "Start by creating your first recurring transaction to automate your regular income and expenses."
            }
            action={
              <Button onClick={handleAddRecurring} icon="Plus">
                Add Recurring Transaction
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.Id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          <ApperIcon 
                            name={transaction.type === 'income' ? 'TrendingUp' : 'TrendingDown'}
                            size={20}
                            className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}
                          />
                          <span className="font-semibold text-gray-900">
                            {transaction.description || transaction.Name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getFrequencyBadge(transaction.frequency)}
                          {getStatusBadge(transaction.is_active)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Amount:</span>
                          <span className={`ml-1 font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                          </span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Category:</span>
                          <span className="ml-1">{transaction.category || 'Uncategorized'}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Last Date:</span>
                          <span className="ml-1">{formatDate(transaction.date)}</span>
                        </div>
                        
                        <div>
                          <span className="font-medium">Next Occurrence:</span>
                          <span className="ml-1">
                            {transaction.is_active ? 
                              calculateNextOccurrence(transaction.date, transaction.frequency) : 
                              'Paused'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleStatus(transaction.Id, transaction.is_active)}
                        icon={transaction.is_active ? 'Pause' : 'Play'}
                        title={transaction.is_active ? 'Pause recurring transaction' : 'Resume recurring transaction'}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditRecurring(transaction)}
                        icon="Edit"
                        title="Edit recurring transaction"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteRecurring(transaction.Id)}
                        icon="Trash"
                        title="Delete recurring transaction"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      />
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default RecurringTransactions;
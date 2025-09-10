import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import TransactionForm from "@/components/organisms/TransactionForm";
import TransactionItem from "@/components/molecules/TransactionItem";
import SearchFilter from "@/components/molecules/SearchFilter";
import transactionService from "@/services/api/transactionService";
import categoryService from "@/services/api/categoryService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [transactionsData, categoriesData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);
      
      // Sort transactions by date (newest first)
      const sortedTransactions = transactionsData.sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      setTransactions(sortedTransactions);
      setFilteredTransactions(sortedTransactions);
      
      // Get unique category names
      const categoryNames = [...new Set(categoriesData.map(cat => cat.name))];
      setCategories(categoryNames);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filters) => {
    let filtered = [...transactions];

    // Search filter
// Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t => {
        const matchesDescription = t.description.toLowerCase().includes(searchLower);
        const matchesCategory = t.category.toLowerCase().includes(searchLower);
        const matchesAmount = Math.abs(t.amount).toString().includes(searchLower);
        const matchesFormattedAmount = `$${Math.abs(t.amount).toFixed(2)}`.includes(searchLower);
        
        return matchesDescription || matchesCategory || matchesAmount || matchesFormattedAmount;
      });
    }

    // Apply date range filter
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(t => {
        const transactionDate = new Date(t.date);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        let dateMatches = true;
        if (startDate) {
          dateMatches = dateMatches && transactionDate >= startDate;
        }
        if (endDate) {
          // Set end date to end of day for inclusive filtering
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          dateMatches = dateMatches && transactionDate <= endOfDay;
        }
        
        return dateMatches;
      });
    }

    // Apply amount range filter
    if (filters.minAmount || filters.maxAmount) {
      filtered = filtered.filter(t => {
        const amount = Math.abs(t.amount);
        const minAmount = filters.minAmount ? parseFloat(filters.minAmount) : 0;
        const maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : Infinity;
        
        return amount >= minAmount && amount <= maxAmount;
      });
    }

    // Apply category filter
    if (filters.categories && filters.categories.length > 0) {
      filtered = filtered.filter(t => 
        filters.categories.includes(t.category)
      );
    }

    // Apply transaction type filter
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(filters.dateFrom));
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(filters.dateTo));
    }

    setFilteredTransactions(filtered);
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) {
      return;
    }

    try {
      await transactionService.delete(transactionId);
      toast.success("Transaction deleted successfully");
      loadData();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Failed to delete transaction");
    }
  };

  const handleSubmitTransaction = async (transactionData) => {
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.Id, transactionData);
        toast.success("Transaction updated successfully");
      } else {
        await transactionService.create(transactionData);
        toast.success("Transaction added successfully");
      }
      
      setShowForm(false);
      setEditingTransaction(null);
      loadData();
    } catch (error) {
      console.error("Error saving transaction:", error);
      throw error;
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  if (loading) {
    return <Loading type="list" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Transactions</h1>
          <p className="text-gray-600 mt-1">Track and manage all your income and expenses.</p>
        </div>
        
        <Button
          onClick={handleAddTransaction}
          icon="Plus"
          className="shadow-md hover:shadow-lg"
        >
          Add Transaction
        </Button>
      </motion.div>

      {/* Transaction Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <TransactionForm
            transaction={editingTransaction}
            onSubmit={handleSubmitTransaction}
            onCancel={handleCancelForm}
          />
        </motion.div>
      )}

      {/* Filters */}
      {!showForm && transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SearchFilter
            onFilter={handleFilter}
            categories={categories}
            placeholder="Search transactions..."
          />
        </motion.div>
      )}

      {/* Transactions List */}
      {!showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {filteredTransactions.length === 0 ? (
            transactions.length === 0 ? (
              <Empty
                type="transactions"
                onAction={handleAddTransaction}
              />
            ) : (
              <Empty
                title="No matching transactions"
                description="Try adjusting your search filters to find what you're looking for"
                icon="Search"
                actionText="Clear Filters"
              />
            )
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TransactionItem
                    transaction={transaction}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Transactions;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import TransactionItem from "@/components/molecules/TransactionItem";
import transactionService from "@/services/api/transactionService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const RecentTransactions = ({ limit = 5 }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      
      const allTransactions = await transactionService.getAll();
      
      // Sort by date (newest first) and limit
      const recentTransactions = allTransactions
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, limit);
      
      setTransactions(recentTransactions);
    } catch (err) {
      console.error("Error loading recent transactions:", err);
      setError("Failed to load recent transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [limit]);

  const handleViewAll = () => {
    navigate("/transactions");
  };

  const handleAddTransaction = () => {
    navigate("/transactions");
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Error message={error} onRetry={loadTransactions} />
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        {transactions.length > 0 && (
          <Button variant="outline" size="sm" onClick={handleViewAll}>
            View All
          </Button>
        )}
      </div>

      {transactions.length === 0 ? (
        <Empty
          type="transactions"
          onAction={handleAddTransaction}
        />
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.Id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
              <TransactionItem
                transaction={transaction}
                // Don't show edit/delete actions on dashboard - keep it simple
              />
            </div>
          ))}
          
          {transactions.length >= limit && (
            <div className="pt-4 border-t border-gray-100">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleViewAll}
                className="w-full"
              >
                View All Transactions
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default RecentTransactions;
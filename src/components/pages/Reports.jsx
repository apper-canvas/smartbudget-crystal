import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Select from "@/components/atoms/Select";
import SpendingChart from "@/components/organisms/SpendingChart";
import TrendChart from "@/components/organisms/TrendChart";
import { transactionService } from "@/services/api/transactionService";
import { formatCurrency, getCurrentMonthYear, getMonthName } from "@/utils/formatters";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const Reports = () => {
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    topCategories: [],
    monthlyAverage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("current"); // current, last3, last6, last12
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadReportData();
  }, [timeRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const allTransactions = await transactionService.getAll();
      setTransactions(allTransactions);
      
      // Filter transactions based on time range
      const filteredTransactions = filterTransactionsByRange(allTransactions, timeRange);
      
      if (filteredTransactions.length === 0) {
        setReportData({
          totalIncome: 0,
          totalExpenses: 0,
          netSavings: 0,
          topCategories: [],
          monthlyAverage: 0
        });
        return;
      }

      // Calculate totals
      const income = filteredTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const expenses = filteredTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const netSavings = income - expenses;

      // Calculate top spending categories
      const categoryTotals = {};
      filteredTransactions
        .filter(t => t.type === "expense")
        .forEach(t => {
          categoryTotals[t.category] = (categoryTotals[t.category] || 0) + Math.abs(t.amount);
        });

      const topCategories = Object.entries(categoryTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount }));

      // Calculate monthly average (for multi-month ranges)
      const monthsInRange = getMonthsInRange(timeRange);
      const monthlyAverage = monthsInRange > 0 ? expenses / monthsInRange : expenses;

      setReportData({
        totalIncome: income,
        totalExpenses: expenses,
        netSavings,
        topCategories,
        monthlyAverage
      });
    } catch (err) {
      console.error("Error loading report data:", err);
      setError("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const filterTransactionsByRange = (transactions, range) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    switch (range) {
      case "current":
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === currentYear && 
                 date.getMonth() + 1 === currentMonth;
        });
        
      case "last3":
        return transactions.filter(t => {
          const date = new Date(t.date);
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
          return date >= threeMonthsAgo && date <= now;
        });
        
      case "last6":
        return transactions.filter(t => {
          const date = new Date(t.date);
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
          return date >= sixMonthsAgo && date <= now;
        });
        
      case "last12":
        return transactions.filter(t => {
          const date = new Date(t.date);
          const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
          return date >= twelveMonthsAgo && date <= now;
        });
        
      default:
        return transactions;
    }
  };

  const getMonthsInRange = (range) => {
    switch (range) {
      case "current": return 1;
      case "last3": return 3;
      case "last6": return 6;
      case "last12": return 12;
      default: return 1;
    }
  };

  const getRangeLabel = (range) => {
    switch (range) {
      case "current": return "This Month";
      case "last3": return "Last 3 Months";
      case "last6": return "Last 6 Months";
      case "last12": return "Last 12 Months";
      default: return "This Month";
    }
  };

  if (loading) {
    return <Loading type="dashboard" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadReportData} />;
  }

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold gradient-text">Reports</h1>
            <p className="text-gray-600 mt-1">Analyze your spending patterns and financial trends.</p>
          </div>
        </motion.div>
        
        <Empty
          type="reports"
          onAction={() => window.location.href = "/transactions"}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Reports</h1>
          <p className="text-gray-600 mt-1">Analyze your spending patterns and financial trends.</p>
        </div>
        
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          options={[
            { value: "current", label: "This Month" },
            { value: "last3", label: "Last 3 Months" },
            { value: "last6", label: "Last 6 Months" },
            { value: "last12", label: "Last 12 Months" }
          ]}
          className="w-40"
        />
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(reportData.totalIncome)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{getRangeLabel(timeRange)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {formatCurrency(reportData.totalExpenses)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{getRangeLabel(timeRange)}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Savings</p>
              <p className={`text-2xl font-bold mt-1 ${reportData.netSavings >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(reportData.netSavings)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{getRangeLabel(timeRange)}</p>
            </div>
            <div className={`p-3 rounded-lg ${reportData.netSavings >= 0 ? "bg-green-100" : "bg-red-100"}`}>
              <svg className={`w-6 h-6 ${reportData.netSavings >= 0 ? "text-green-600" : "text-red-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Average</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(reportData.monthlyAverage)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Expenses</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <SpendingChart key={timeRange} />
        <TrendChart />
      </motion.div>

      {/* Top Categories */}
      {reportData.topCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-premium p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Spending Categories - {getRangeLabel(timeRange)}
          </h3>
          <div className="space-y-3">
            {reportData.topCategories.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{item.category}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatCurrency(item.amount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {reportData.totalExpenses > 0 ? 
                      Math.round((item.amount / reportData.totalExpenses) * 100) : 0}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
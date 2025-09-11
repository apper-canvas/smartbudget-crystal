import { useState, useEffect } from "react";
import StatCard from "@/components/molecules/StatCard";
import { transactionService } from "@/services/api/transactionService";
import budgetService from "@/services/api/budgetService";
import goalService from "@/services/api/goalService";
import { getCurrentMonthYear, formatCurrency } from "@/utils/formatters";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const DashboardStats = () => {
  const [stats, setStats] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
    activeBudgets: 0,
    completedGoals: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [transactions, budgets, goals] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll(),
        goalService.getAll()
      ]);

      const { month, year } = getCurrentMonthYear();
      
      // Calculate monthly totals
      const currentMonthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() + 1 === parseInt(month) && 
               transactionDate.getFullYear() === year;
      });

      const monthlyIncome = currentMonthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const monthlyExpenses = currentMonthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Calculate total balance
      const totalBalance = transactions.reduce((sum, t) => {
        return t.type === "income" ? sum + Math.abs(t.amount) : sum - Math.abs(t.amount);
      }, 0);

      // Calculate savings (income - expenses for current month)
      const savings = monthlyIncome - monthlyExpenses;

      // Count active budgets
      const activeBudgets = budgets.filter(b => 
        b.month === month && b.year === year
      ).length;

      // Count completed goals
      const completedGoals = goals.filter(g => 
        g.currentAmount >= g.targetAmount
      ).length;

      setStats({
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        savings,
        activeBudgets,
        completedGoals
      });
    } catch (err) {
      console.error("Error loading stats:", err);
      setError("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-premium p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="h-8 bg-gray-300 rounded mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-full">
        <Error message={error} onRetry={loadStats} />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Balance",
      value: stats.totalBalance,
      icon: "Wallet",
      color: stats.totalBalance >= 0 ? "success" : "error",
      trend: stats.totalBalance >= 0 ? 
        { direction: "up", text: "Positive balance" } : 
        { direction: "down", text: "Negative balance" }
    },
    {
      title: "Monthly Income",
      value: stats.monthlyIncome,
      icon: "TrendingUp",
      color: "primary",
      trend: { direction: "up", text: "This month" }
    },
    {
      title: "Monthly Expenses",
      value: stats.monthlyExpenses,
      icon: "TrendingDown", 
      color: "error",
      trend: { direction: "down", text: "This month" }
    },
    {
      title: "Net Savings",
      value: stats.savings,
      icon: "PiggyBank",
      color: stats.savings >= 0 ? "success" : "warning",
      trend: stats.savings >= 0 ? 
        { direction: "up", text: "Saving money" } : 
        { direction: "down", text: "Spending more" }
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          trend={stat.trend}
        />
      ))}
    </div>
  );
};

export default DashboardStats;
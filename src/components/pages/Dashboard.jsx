import { useEffect } from "react";
import { motion } from "framer-motion";
import DashboardStats from "@/components/organisms/DashboardStats";
import SpendingChart from "@/components/organisms/SpendingChart";
import TrendChart from "@/components/organisms/TrendChart";
import RecentTransactions from "@/components/organisms/RecentTransactions";
import { notificationService } from "@/services/api/notificationService";
const Dashboard = () => {
  useEffect(() => {
    // Check for budget alerts when dashboard loads
    notificationService.checkBudgetAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <DashboardStats />
      </motion.div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <SpendingChart type="donut" />
        <TrendChart />
      </motion.div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <RecentTransactions limit={6} />
      </motion.div>
    </div>
  );
};

export default Dashboard;
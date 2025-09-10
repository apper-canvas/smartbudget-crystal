import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data yet", 
  description = "Get started by adding your first item",
  actionText = "Add Item",
  onAction,
  icon = "Plus",
  type = "default" 
}) => {
  const getEmptyContent = () => {
    switch (type) {
      case "transactions":
        return {
          icon: "Receipt",
          title: "No transactions yet",
          description: "Start tracking your finances by adding your first transaction",
          actionText: "Add Transaction"
        };
      case "budgets":
        return {
          icon: "Target",
          title: "No budgets set",
          description: "Create budgets to keep your spending on track",
          actionText: "Create Budget"
        };
      case "goals":
        return {
          icon: "Trophy",
          title: "No savings goals",
          description: "Set savings goals to achieve your financial dreams",
          actionText: "Add Goal"
        };
      case "reports":
        return {
          icon: "BarChart3",
          title: "No data to display",
          description: "Add some transactions to see your spending reports",
          actionText: "Add Transaction"
        };
      default:
        return { icon, title, description, actionText };
    }
  };

  const content = getEmptyContent();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-6"
      >
        <ApperIcon name={content.icon} size={40} className="text-primary" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-gray-900 mb-3"
      >
        {content.title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-gray-600 mb-8 max-w-md"
      >
        {content.description}
      </motion.p>

      {onAction && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="Plus" size={16} />
          <span>{content.actionText}</span>
        </motion.button>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-sm text-gray-500"
      >
        Need help getting started? Check out our quick tips!
      </motion.div>
    </motion.div>
  );
};

export default Empty;
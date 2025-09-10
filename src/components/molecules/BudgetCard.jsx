import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, calculateBudgetHealth, getBudgetStatus, getBudgetStatusColor } from "@/utils/formatters";

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const percentage = calculateBudgetHealth(budget.currentSpent, budget.monthlyLimit);
  const status = getBudgetStatus(budget.currentSpent, budget.monthlyLimit);
  const remaining = budget.monthlyLimit - budget.currentSpent;

  const getCategoryIcon = (category) => {
    const iconMap = {
      "Food & Dining": "Utensils",
      "Transportation": "Car",
      "Shopping": "ShoppingBag",
      "Entertainment": "Music",
      "Bills & Utilities": "Receipt",
      "Healthcare": "Heart",
      "Education": "BookOpen",
      "Travel": "Plane",
      "Groceries": "ShoppingCart",
      "Gas": "Fuel",
      "Other": "MoreHorizontal"
    };
    return iconMap[category] || "Circle";
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "over": return "error";
      case "warning": return "warning";
      case "good": return "success";
      default: return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "over": return "Over Budget";
      case "warning": return "Close to Limit";
      case "good": return "On Track";
      default: return "Unknown";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="p-6 hover:shadow-card-hover transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <ApperIcon name={getCategoryIcon(budget.category)} size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{budget.category}</h3>
              <p className="text-sm text-gray-600">
                {budget.month}/{budget.year}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusBadgeVariant(status)} size="sm">
              {getStatusText(status)}
            </Badge>
            <div className="flex items-center space-x-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(budget)}
                  className="p-1 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded transition-colors"
                >
                  <ApperIcon name="Edit2" size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(budget.Id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <ApperIcon name="Trash2" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Spent</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round(percentage)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-2 rounded-full ${
                status === "over" ? "bg-red-500" :
                status === "warning" ? "bg-orange-500" :
                "bg-green-500"
              }`}
            />
          </div>
        </div>

        {/* Amount Details */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Spent</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(budget.currentSpent)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Remaining</p>
            <p className={`font-semibold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(budget.monthlyLimit)}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default BudgetCard;
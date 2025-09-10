import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency, formatDate } from "@/utils/formatters";

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
  const isIncome = transaction.type === "income";
  
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
      "Salary": "DollarSign",
      "Freelance": "Briefcase",
      "Investment": "TrendingUp",
      "Gift": "Gift",
      "Other Income": "Plus",
      "Other": "MoreHorizontal"
    };
    return iconMap[category] || "Circle";
  };

  const getCategoryColor = (category, type) => {
    if (type === "income") return "text-green-600 bg-green-100";
    
    const colorMap = {
      "Food & Dining": "text-orange-600 bg-orange-100",
      "Transportation": "text-blue-600 bg-blue-100",
      "Shopping": "text-purple-600 bg-purple-100",
      "Entertainment": "text-pink-600 bg-pink-100",
      "Bills & Utilities": "text-red-600 bg-red-100",
      "Healthcare": "text-green-600 bg-green-100",
      "Education": "text-indigo-600 bg-indigo-100",
      "Travel": "text-cyan-600 bg-cyan-100",
      "Groceries": "text-emerald-600 bg-emerald-100",
      "Gas": "text-yellow-600 bg-yellow-100"
    };
    return colorMap[category] || "text-gray-600 bg-gray-100";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="p-4 hover:shadow-card-hover transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${getCategoryColor(transaction.category, transaction.type)}`}>
              <ApperIcon name={getCategoryIcon(transaction.category)} size={20} />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {transaction.description}
              </div>
              <div className="text-sm text-gray-600">
                {transaction.category} • {formatDate(transaction.date)}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className={`font-semibold ${isIncome ? "text-green-600" : "text-red-600"}`}>
                {isIncome ? "+" : "-"}{formatCurrency(Math.abs(transaction.amount))}
              </div>
              <Badge variant={isIncome ? "success" : "error"} size="sm">
                {isIncome ? "Income" : "Expense"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(transaction)}
                  className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                >
                  <ApperIcon name="Edit2" size={16} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(transaction.Id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <ApperIcon name="Trash2" size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default TransactionItem;
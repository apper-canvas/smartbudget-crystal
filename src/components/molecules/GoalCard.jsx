import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import ProgressRing from "@/components/molecules/ProgressRing";
import { formatCurrency, formatDate, getGoalProgress, isOverdue, getDaysUntilDeadline } from "@/utils/formatters";

const GoalCard = ({ goal, onEdit, onDelete, onAddFunds }) => {
  const progress = getGoalProgress(goal.currentAmount, goal.targetAmount);
  const isGoalOverdue = isOverdue(goal.deadline);
  const daysLeft = getDaysUntilDeadline(goal.deadline);
  const isCompleted = progress >= 100;

  const getStatusBadge = () => {
    if (isCompleted) return { variant: "success", text: "Completed" };
    if (isGoalOverdue) return { variant: "error", text: "Overdue" };
    if (daysLeft <= 30) return { variant: "warning", text: `${daysLeft} days left` };
    return { variant: "info", text: `${daysLeft} days left` };
  };

  const status = getStatusBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="p-6 hover:shadow-card-hover transition-all duration-300">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{goal.name}</h3>
            <p className="text-sm text-gray-600">
              Target: {formatDate(goal.deadline)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={status.variant} size="sm">
              {status.text}
            </Badge>
            <div className="flex items-center space-x-1">
              {onEdit && (
                <button
                  onClick={() => onEdit(goal)}
                  className="p-1 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded transition-colors"
                >
                  <ApperIcon name="Edit2" size={14} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(goal.Id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <ApperIcon name="Trash2" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mb-6">
          <ProgressRing
            current={goal.currentAmount}
            target={goal.targetAmount}
            size={100}
            strokeWidth={6}
            color={isCompleted ? "success" : isGoalOverdue ? "error" : "primary"}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Current</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(goal.currentAmount)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Target</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(goal.targetAmount)}
            </p>
          </div>
        </div>

        {!isCompleted && onAddFunds && (
          <button
            onClick={() => onAddFunds(goal)}
            className="w-full btn-primary text-sm py-2"
          >
            <ApperIcon name="Plus" size={14} className="mr-1" />
            Add Funds
          </button>
        )}

        {isCompleted && (
          <div className="flex items-center justify-center text-green-600 font-medium">
            <ApperIcon name="CheckCircle" size={16} className="mr-2" />
            Goal Achieved!
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default GoalCard;
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { formatCurrency } from "@/utils/formatters";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendIcon,
  color = "primary",
  isLoading = false 
}) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10", 
    success: "text-green-600 bg-green-100",
    warning: "text-orange-600 bg-orange-100",
    error: "text-red-600 bg-red-100"
  };

  const trendColors = {
    up: "text-red-600",
    down: "text-green-600",
    neutral: "text-gray-600"
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
          <div className="h-8 bg-gray-300 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <Card className="p-6 hover:shadow-card-hover transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              {typeof value === "number" ? formatCurrency(value) : value}
            </p>
            {trend && (
              <div className="flex items-center text-sm">
                {trendIcon && (
                  <ApperIcon 
                    name={trendIcon} 
                    size={14} 
                    className={`mr-1 ${trendColors[trend.direction] || "text-gray-600"}`} 
                  />
                )}
                <span className={trendColors[trend.direction] || "text-gray-600"}>
                  {trend.text}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
              <ApperIcon name={icon} size={24} />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
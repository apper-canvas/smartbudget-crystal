import { motion } from "framer-motion";
import { formatCurrency, formatPercent } from "@/utils/formatters";

const ProgressRing = ({ 
  current, 
  target, 
  label, 
  size = 120,
  strokeWidth = 8,
  showAmount = true,
  color = "primary"
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colors = {
    primary: "#2E7D32",
    secondary: "#1565C0",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336"
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors[color]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{
              filter: "drop-shadow(0 2px 4px rgba(46, 125, 50, 0.2))"
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="text-2xl font-bold text-gray-900"
          >
            {Math.round(percentage)}%
          </motion.div>
          {showAmount && (
            <div className="text-xs text-gray-600 mt-1">
              {formatCurrency(current)}
              <br />
              of {formatCurrency(target)}
            </div>
          )}
        </div>
      </div>
      
      {label && (
        <div className="mt-3 text-sm font-medium text-gray-700 text-center">
          {label}
        </div>
      )}
    </div>
  );
};

export default ProgressRing;
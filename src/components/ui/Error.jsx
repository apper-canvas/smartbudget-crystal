import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry, type = "default" }) => {
  const getErrorIcon = () => {
    if (type === "network") return "WifiOff";
    if (type === "notfound") return "Search";
    return "AlertCircle";
  };

  const getErrorTitle = () => {
    if (type === "network") return "Connection Error";
    if (type === "notfound") return "No Data Found";
    return "Error";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4"
      >
        <ApperIcon name={getErrorIcon()} size={32} className="text-red-600" />
      </motion.div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {getErrorTitle()}
      </h3>

      <p className="text-gray-600 mb-6 max-w-md">
        {message}
      </p>

      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <ApperIcon name="RefreshCw" size={16} />
          <span>Try Again</span>
        </motion.button>
      )}
    </motion.div>
  );
};

export default Error;
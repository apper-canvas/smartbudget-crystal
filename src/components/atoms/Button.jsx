import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Button = React.forwardRef(({ 
  children, 
  variant = "primary", 
  size = "md", 
  icon, 
  iconPosition = "left",
  loading = false,
  disabled = false,
  className,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white focus:ring-primary/50 shadow-sm hover:shadow-md",
    secondary: "bg-gradient-to-r from-secondary to-secondary-light hover:from-secondary-dark hover:to-secondary text-white focus:ring-secondary/50 shadow-sm hover:shadow-md",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50",
    ghost: "text-gray-600 hover:text-primary hover:bg-primary/10 focus:ring-primary/50",
    danger: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white focus:ring-red/50 shadow-sm hover:shadow-md",
    success: "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white focus:ring-green/50 shadow-sm hover:shadow-md"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg"
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20
  };

  return (
    <motion.button
      ref={ref}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"
          />
          Loading...
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <ApperIcon name={icon} size={iconSizes[size]} className="mr-2" />
          )}
          {children}
          {icon && iconPosition === "right" && (
            <ApperIcon name={icon} size={iconSizes[size]} className="ml-2" />
          )}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = "Button";

export default Button;
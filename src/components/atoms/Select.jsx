import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Select = React.forwardRef(({ 
  label,
  error,
  options = [],
  placeholder = "Select an option",
  className,
  children,
  ...props 
}, ref) => {
  const selectId = React.useId();
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="label-field">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "input-field appearance-none pr-10",
            error && "border-red-500 focus:border-red-500 focus:ring-red/20",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ApperIcon name="ChevronDown" size={18} className="text-gray-400" />
        </div>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <ApperIcon name="AlertCircle" size={14} className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;
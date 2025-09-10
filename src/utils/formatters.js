export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateShort = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export const formatPercent = (value, total) => {
  if (total === 0) return "0%";
  return `${Math.round((value / total) * 100)}%`;
};

export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: (now.getMonth() + 1).toString().padStart(2, "0"),
    year: now.getFullYear(),
  };
};

export const getMonthName = (monthNumber) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return months[parseInt(monthNumber) - 1] || "";
};

export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getTrendColor = (current, previous) => {
  if (current > previous) return "text-red-600";
  if (current < previous) return "text-green-600";
  return "text-gray-600";
};

export const getTrendIcon = (current, previous) => {
  if (current > previous) return "TrendingUp";
  if (current < previous) return "TrendingDown";
  return "Minus";
};

export const calculateBudgetHealth = (spent, limit) => {
  if (limit === 0) return 0;
  const percentage = (spent / limit) * 100;
  return Math.min(percentage, 100);
};

export const getBudgetStatus = (spent, limit) => {
  const percentage = calculateBudgetHealth(spent, limit);
  if (percentage >= 100) return "over";
  if (percentage >= 80) return "warning";
  return "good";
};

export const getBudgetStatusColor = (status) => {
  switch (status) {
    case "over": return "text-red-600";
    case "warning": return "text-orange-600";
    case "good": return "text-green-600";
    default: return "text-gray-600";
  }
};

export const getGoalProgress = (current, target) => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

export const isOverdue = (deadline) => {
  return new Date(deadline) < new Date();
};

export const getDaysUntilDeadline = (deadline) => {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
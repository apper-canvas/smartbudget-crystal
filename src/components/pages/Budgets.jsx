import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import BudgetCard from "@/components/molecules/BudgetCard";
import budgetService from "@/services/api/budgetService";
import categoryService from "@/services/api/categoryService";
import { transactionService } from "@/services/api/transactionService";
import { getCurrentMonthYear, getMonthName } from "@/utils/formatters";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    monthlyLimit: "",
    month: "",
    year: ""
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
    initializeFormDates();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [budgetsData, categoriesData, transactionsData] = await Promise.all([
        budgetService.getAll(),
        categoryService.getAll(),
        transactionService.getAll()
      ]);
      
      // Get expense categories only
      const expenseCategories = categoriesData.filter(cat => cat.type === "expense");
      setCategories(expenseCategories);
      
      // Calculate current spending for each budget
      const budgetsWithSpending = budgetsData.map(budget => {
        const budgetTransactions = transactionsData.filter(t => {
          const transactionDate = new Date(t.date);
          return t.type === "expense" &&
                 t.category === budget.category &&
                 transactionDate.getMonth() + 1 === parseInt(budget.month) &&
                 transactionDate.getFullYear() === budget.year;
        });
        
        const currentSpent = budgetTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        return {
          ...budget,
          currentSpent
        };
      });
      
      setBudgets(budgetsWithSpending);
    } catch (err) {
      console.error("Error loading budgets:", err);
      setError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  const initializeFormDates = () => {
    const { month, year } = getCurrentMonthYear();
    setFormData(prev => ({
      ...prev,
      month,
      year: year.toString()
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.category) {
      errors.category = "Category is required";
    }
    
    if (!formData.monthlyLimit || parseFloat(formData.monthlyLimit) <= 0) {
      errors.monthlyLimit = "Monthly limit must be greater than 0";
    }
    
    if (!formData.month) {
      errors.month = "Month is required";
    }
    
    if (!formData.year) {
      errors.year = "Year is required";
    }

    // Check for duplicate budget
    if (!editingBudget) {
      const existingBudget = budgets.find(b => 
        b.category === formData.category && 
        b.month === formData.month && 
        b.year === parseInt(formData.year)
      );
      
      if (existingBudget) {
        errors.category = "Budget already exists for this category and month";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const budgetData = {
        Id: editingBudget?.Id || Date.now(),
        category: formData.category,
        monthlyLimit: parseFloat(formData.monthlyLimit),
        currentSpent: editingBudget?.currentSpent || 0,
        month: formData.month,
        year: parseInt(formData.year)
      };
      
      if (editingBudget) {
        await budgetService.update(editingBudget.Id, budgetData);
        toast.success("Budget updated successfully");
      } else {
        await budgetService.create(budgetData);
        toast.success("Budget created successfully");
      }
      
      resetForm();
      loadData();
    } catch (error) {
      console.error("Error saving budget:", error);
      toast.error("Failed to save budget");
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      monthlyLimit: budget.monthlyLimit.toString(),
      month: budget.month,
      year: budget.year.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (budgetId) => {
    if (!window.confirm("Are you sure you want to delete this budget?")) {
      return;
    }

    try {
      await budgetService.delete(budgetId);
      toast.success("Budget deleted successfully");
      loadData();
    } catch (error) {
      console.error("Error deleting budget:", error);
      toast.error("Failed to delete budget");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingBudget(null);
    const { month, year } = getCurrentMonthYear();
    setFormData({
      category: "",
      monthlyLimit: "",
      month,
      year: year.toString()
    });
    setFormErrors({});
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (loading) {
    return <Loading type="list" />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Budgets</h1>
          <p className="text-gray-600 mt-1">Set spending limits and track your progress.</p>
        </div>
        
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="shadow-md hover:shadow-lg"
        >
          Create Budget
        </Button>
      </motion.div>

      {/* Budget Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingBudget ? "Edit Budget" : "Create New Budget"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  error={formErrors.category}
                  placeholder="Select category"
                  options={categories.map(cat => ({
                    value: cat.name,
                    label: cat.name
                  }))}
                />

                <Input
                  label="Monthly Limit"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  icon="DollarSign"
                  value={formData.monthlyLimit}
                  onChange={(e) => handleInputChange("monthlyLimit", e.target.value)}
                  error={formErrors.monthlyLimit}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Month"
                  value={formData.month}
                  onChange={(e) => handleInputChange("month", e.target.value)}
                  error={formErrors.month}
                  options={Array.from({ length: 12 }, (_, i) => {
                    const monthNum = (i + 1).toString().padStart(2, "0");
                    return {
                      value: monthNum,
                      label: getMonthName(monthNum)
                    };
                  })}
                />

                <Input
                  label="Year"
                  type="number"
                  min="2020"
                  max="2030"
                  value={formData.year}
                  onChange={(e) => handleInputChange("year", e.target.value)}
                  error={formErrors.year}
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button type="submit" icon="Save">
                  {editingBudget ? "Update Budget" : "Create Budget"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Budgets List */}
      {!showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {budgets.length === 0 ? (
            <Empty
              type="budgets"
              onAction={() => setShowForm(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((budget, index) => (
                <motion.div
                  key={budget.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <BudgetCard
                    budget={budget}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Budgets;
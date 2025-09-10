import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import categoryService from "@/services/api/categoryService";
import { generateId } from "@/utils/formatters";
import { toast } from "react-toastify";

const TransactionForm = ({ transaction, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    type: "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date().toISOString().split("T")[0]
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadCategories();
    if (transaction) {
      setFormData({
        type: transaction.type,
        amount: Math.abs(transaction.amount).toString(),
        category: transaction.category,
        description: transaction.description,
        date: transaction.date
      });
    }
  }, [transaction]);

  const loadCategories = async () => {
    try {
      const allCategories = await categoryService.getAll();
      setCategories(allCategories);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const getFilteredCategories = () => {
    return categories.filter(cat => cat.type === formData.type);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const transactionData = {
        Id: transaction?.Id || Date.now(),
        type: formData.type,
        amount: parseFloat(formData.amount),
        category: formData.category,
        description: formData.description.trim(),
        date: formData.date,
        createdAt: transaction?.createdAt || new Date().toISOString()
      };

      await onSubmit(transactionData);
      
      // Reset form if creating new transaction
      if (!transaction) {
        setFormData({
          type: "expense",
          amount: "",
          category: "",
          description: "",
          date: new Date().toISOString().split("T")[0]
        });
        setErrors({});
      }
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }

    // Reset category when type changes
    if (field === "type") {
      setFormData(prev => ({ ...prev, category: "" }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          {transaction ? "Edit Transaction" : "Add New Transaction"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Type"
              value={formData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              error={errors.type}
              options={[
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" }
              ]}
            />

            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              icon="DollarSign"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              error={errors.amount}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              error={errors.category}
              placeholder="Select category"
              options={getFilteredCategories().map(cat => ({
                value: cat.name,
                label: cat.name
              }))}
            />

            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              error={errors.date}
            />
          </div>

          <Input
            label="Description"
            placeholder="Enter transaction description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            error={errors.description}
          />

          <div className="flex justify-end space-x-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              loading={loading}
              icon="Save"
            >
              {transaction ? "Update Transaction" : "Add Transaction"}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  );
};

export default TransactionForm;
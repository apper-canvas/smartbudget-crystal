import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Card from "@/components/atoms/Card";
import GoalCard from "@/components/molecules/GoalCard";
import goalService from "@/services/api/goalService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "",
    deadline: ""
  });
  const [addFundsAmount, setAddFundsAmount] = useState("");
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");
      
const goalsData = await goalService.getAll();
      
      // Transform database field names to UI property names
      const transformedGoals = goalsData.map(goal => ({
        Id: goal.Id,
        name: goal.name_c || goal.Name || '',
        targetAmount: parseFloat(goal.target_amount_c) || 0,
        currentAmount: parseFloat(goal.current_amount_c) || 0,
        deadline: goal.deadline_c || '',
        createdAt: goal.created_at_c || goal.CreatedOn || '',
        Tags: goal.Tags || ''
      }));
      
      // Sort goals by deadline and completion status
      const sortedGoals = transformedGoals.sort((a, b) => {
        // Completed goals go to the end
        if (a.currentAmount >= a.targetAmount && b.currentAmount < b.targetAmount) return 1;
        if (b.currentAmount >= b.targetAmount && a.currentAmount < a.targetAmount) return -1;
        
        // Then sort by deadline
        return new Date(a.deadline) - new Date(b.deadline);
      });
      
      setGoals(sortedGoals);
    } catch (err) {
      console.error("Error loading goals:", err);
      setError("Failed to load savings goals");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Goal name is required";
    }
    
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      errors.targetAmount = "Target amount must be greater than 0";
    }
    
    if (formData.currentAmount && parseFloat(formData.currentAmount) < 0) {
      errors.currentAmount = "Current amount cannot be negative";
    }
    
    if (!formData.deadline) {
      errors.deadline = "Deadline is required";
    } else {
      const deadlineDate = new Date(formData.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (deadlineDate <= today) {
        errors.deadline = "Deadline must be in the future";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
try {
      const goalData = {
        Id: editingGoal?.Id || Date.now(),
        Name: formData.name.trim(),
        name_c: formData.name.trim(),
        target_amount_c: parseFloat(formData.targetAmount),
        current_amount_c: parseFloat(formData.currentAmount) || 0,
        deadline_c: formData.deadline,
        created_at_c: editingGoal?.createdAt || new Date().toISOString(),
        Tags: ''
      };
      
      if (editingGoal) {
        await goalService.update(editingGoal.Id, goalData);
        toast.success("Goal updated successfully");
      } else {
        await goalService.create(goalData);
        toast.success("Goal created successfully");
      }
      
      resetForm();
      loadGoals();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal");
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline
    });
    setShowForm(true);
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      await goalService.delete(goalId);
      toast.success("Goal deleted successfully");
      loadGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  const handleAddFunds = (goal) => {
    setSelectedGoal(goal);
    setAddFundsAmount("");
    setShowAddFunds(true);
  };

  const handleAddFundsSubmit = async (e) => {
    e.preventDefault();
    
    const amount = parseFloat(addFundsAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
const updatedGoal = {
        current_amount_c: selectedGoal.currentAmount + amount
      };
      
      await goalService.update(selectedGoal.Id, updatedGoal);
      toast.success(`Added $${amount.toLocaleString()} to ${selectedGoal.name}`);
      
      setShowAddFunds(false);
      setSelectedGoal(null);
      setAddFundsAmount("");
      loadGoals();
    } catch (error) {
      console.error("Error adding funds:", error);
      toast.error("Failed to add funds");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingGoal(null);
    setFormData({
      name: "",
      targetAmount: "",
      currentAmount: "",
      deadline: ""
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
    return <Error message={error} onRetry={loadGoals} />;
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Savings Goals</h1>
          <p className="text-gray-600 mt-1">Set and track your financial goals.</p>
        </div>
        
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="shadow-md hover:shadow-lg"
        >
          Add Goal
        </Button>
      </motion.div>

      {/* Goal Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              {editingGoal ? "Edit Goal" : "Create New Goal"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Goal Name"
                placeholder="e.g., Emergency Fund, Vacation, New Car"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                error={formErrors.name}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Target Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  icon="DollarSign"
                  value={formData.targetAmount}
                  onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                  error={formErrors.targetAmount}
                />

                <Input
                  label="Current Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  icon="DollarSign"
                  value={formData.currentAmount}
                  onChange={(e) => handleInputChange("currentAmount", e.target.value)}
                  error={formErrors.currentAmount}
                />
              </div>

              <Input
                label="Target Date"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                error={formErrors.deadline}
                min={new Date().toISOString().split("T")[0]}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
                <Button type="submit" icon="Save">
                  {editingGoal ? "Update Goal" : "Create Goal"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Add Funds Modal */}
      {showAddFunds && selectedGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAddFunds(false)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Add Funds to {selectedGoal.name}
            </h3>
            
            <form onSubmit={handleAddFundsSubmit} className="space-y-4">
              <Input
                label="Amount to Add"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                icon="DollarSign"
                value={addFundsAmount}
                onChange={(e) => setAddFundsAmount(e.target.value)}
              />
              
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddFunds(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" icon="Plus">
                  Add Funds
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Goals List */}
      {!showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {goals.length === 0 ? (
            <Empty
              type="goals"
              onAction={() => setShowForm(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GoalCard
                    goal={goal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddFunds={handleAddFunds}
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

export default Goals;
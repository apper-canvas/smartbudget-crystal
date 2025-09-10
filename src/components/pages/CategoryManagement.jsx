import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import categoryService from "@/services/api/categoryService";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    color: "#FF8F00"
  });
  const [formErrors, setFormErrors] = useState({});

  const predefinedColors = [
    "#FF8F00", "#1565C0", "#9C27B0", "#E91E63", "#F44336",
    "#4CAF50", "#3F51B5", "#00BCD4", "#8BC34A", "#FFC107",
    "#607D8B", "#2E7D32", "#388E3C", "#43A047", "#66BB6A"
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || category.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = "Category name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Category name must be at least 2 characters";
    } else {
      // Check for duplicate names (excluding current editing category)
      const isDuplicate = categories.some(cat => 
        cat.name.toLowerCase() === formData.name.trim().toLowerCase() && 
        cat.Id !== editingCategory?.Id
      );
      if (isDuplicate) {
        errors.name = "A category with this name already exists";
      }
    }
    
    if (!formData.type) {
      errors.type = "Category type is required";
    }
    
    if (!formData.color) {
      errors.color = "Category color is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const categoryData = {
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        isDefault: false
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.Id, categoryData);
        toast.success("Category updated successfully");
      } else {
        await categoryService.create(categoryData);
        toast.success("Category created successfully");
      }

      await loadCategories();
      resetForm();
    } catch (err) {
      console.error("Error saving category:", err);
      toast.error(editingCategory ? "Failed to update category" : "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      type: category.type,
      color: category.color
    });
    setFormErrors({});
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    const category = categories.find(cat => cat.Id === categoryId);
    
    if (category.isDefault) {
      toast.warning("Default categories cannot be deleted");
      return;
    }

    if (!confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      await categoryService.delete(categoryId);
      toast.success("Category deleted successfully");
      await loadCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
      toast.error("Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "expense",
      color: "#FF8F00"
    });
    setFormErrors({});
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
  };

  if (loading && categories.length === 0) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCategories} />;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold gradient-text">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage your expense and income categories.</p>
        </div>
        
        <Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="shadow-md hover:shadow-lg"
        >
          Add Category
        </Button>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search categories..."
              icon="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <Select
              placeholder="All Types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: "", label: "All Types" },
                { value: "expense", label: "Expense" },
                { value: "income", label: "Income" }
              ]}
            />
            
            {(searchTerm || typeFilter) && (
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {filteredCategories.map((category) => (
            <motion.div
              key={category.Id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <Badge 
                        variant={category.type === "expense" ? "danger" : "success"}
                        className="mt-1"
                      >
                        {category.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(category)}
                      icon="Edit"
                      className="h-8 w-8 p-0"
                    />
                    {!category.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.Id)}
                        icon="Trash2"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      />
                    )}
                  </div>
                </div>
                
                {category.isDefault && (
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <ApperIcon name="Shield" size={12} className="mr-1" />
                    Default Category
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredCategories.length === 0 && !loading && (
        <Empty 
          title="No categories found"
          description={searchTerm || typeFilter ? "Try adjusting your filters" : "Create your first category to get started"}
        />
      )}

      {/* Category Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetForm}
                    icon="X"
                    className="h-8 w-8 p-0"
                  />
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Category Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={formErrors.name}
                    placeholder="Enter category name"
                    required
                  />

                  <Select
                    label="Type"
                    value={formData.type}
                    onChange={(e) => handleInputChange("type", e.target.value)}
                    error={formErrors.type}
                    options={[
                      { value: "expense", label: "Expense" },
                      { value: "income", label: "Income" }
                    ]}
                    required
                  />

                  <div>
                    <label className="label-field">Color</label>
                    <div className="grid grid-cols-8 gap-2 mb-2">
                      {predefinedColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            formData.color === color
                              ? "border-gray-800 scale-110"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => handleInputChange("color", color)}
                        />
                      ))}
                    </div>
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange("color", e.target.value)}
                      className="w-full h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    {formErrors.color && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.color}</p>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button type="submit" className="flex-1" disabled={loading}>
                      {loading ? "Saving..." : editingCategory ? "Update Category" : "Add Category"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryManagement;
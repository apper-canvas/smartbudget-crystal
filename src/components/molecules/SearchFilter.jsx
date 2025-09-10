import { useState } from "react";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";

const SearchFilter = ({ 
  onFilter, 
  categories = [], 
  showDateFilter = true,
  showCategoryFilter = true,
  placeholder = "Search..." 
}) => {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    dateFrom: "",
    dateTo: "",
    type: ""
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      search: "",
      category: "",
      dateFrom: "",
      dateTo: "",
      type: ""
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== "");

  return (
<div className="card-premium p-6 space-y-6">
      {/* Keyword Search */}
      <div>
        <label className="label-field">Search Keywords</label>
        <Input
          placeholder="Search by description, category, or amount..."
          value={filters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full"
        />
      </div>

      {/* Date Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Start Date</label>
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="label-field">End Date</label>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Amount Range Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label-field">Min Amount ($)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="0.00"
            value={filters.minAmount || ''}
            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
            className="w-full"
          />
        </div>
        <div>
          <label className="label-field">Max Amount ($)</label>
          <Input
            type="number"
            step="0.01"
            placeholder="999999.99"
            value={filters.maxAmount || ''}
            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Category Multi-Select */}
      <div>
        <label className="label-field">Categories</label>
        <Select
          value={filters.categories || []}
          onChange={(value) => handleFilterChange('categories', value)}
          options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
          multiple={true}
          placeholder="Select categories to filter..."
          className="w-full"
        />
      </div>

      {/* Transaction Type */}
      <div>
        <label className="label-field">Transaction Type</label>
        <Select
          value={filters.type || ''}
          onChange={(value) => handleFilterChange('type', value)}
          options={[
            { value: '', label: 'All Types' },
            { value: 'income', label: 'Income' },
            { value: 'expense', label: 'Expense' }
          ]}
          className="w-full"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          onClick={handleClear}
          variant="outline"
          className="flex-1"
        >
          Clear All Filters
        </Button>
        <Button
          onClick={() => onFilter(filters)}
          className="flex-1 btn-primary"
        >
          Apply Filters
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          placeholder={placeholder}
          icon="Search"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
        />

        {showCategoryFilter && (
          <Select
            placeholder="All Categories"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            options={categories.map(cat => ({ value: cat, label: cat }))}
          />
        )}

        <Select
          placeholder="All Types"
          value={filters.type}
          onChange={(e) => handleFilterChange("type", e.target.value)}
          options={[
            { value: "income", label: "Income" },
            { value: "expense", label: "Expense" }
          ]}
        />

        {showDateFilter && (
          <div className="flex space-x-2">
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              className="flex-1"
            />
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
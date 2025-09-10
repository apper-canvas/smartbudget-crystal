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
    <div className="card-premium p-4 space-y-4">
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
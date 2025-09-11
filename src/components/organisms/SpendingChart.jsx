import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { getCurrentMonthYear } from "@/utils/formatters";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const SpendingChart = ({ type = "pie" }) => {
  const [chartData, setChartData] = useState({ categories: [], amounts: [], colors: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const transactions = await transactionService.getAll();
      const { month, year } = getCurrentMonthYear();
      
      // Filter current month expenses only
      const currentMonthExpenses = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === "expense" && 
               transactionDate.getMonth() + 1 === parseInt(month) && 
               transactionDate.getFullYear() === year;
      });

      if (currentMonthExpenses.length === 0) {
        setChartData({ categories: [], amounts: [], colors: [] });
        return;
      }

      // Group by category and sum amounts
      const categoryTotals = currentMonthExpenses.reduce((acc, transaction) => {
        const category = transaction.category;
        acc[category] = (acc[category] || 0) + Math.abs(transaction.amount);
        return acc;
      }, {});

      // Convert to arrays for chart
      const categories = Object.keys(categoryTotals);
      const amounts = Object.values(categoryTotals);
      
      // Generate colors for categories
      const colorPalette = [
        "#2E7D32", "#1565C0", "#FF8F00", "#F44336", "#4CAF50",
        "#2196F3", "#FF9800", "#9C27B0", "#00BCD4", "#795548",
        "#607D8B", "#E91E63", "#3F51B5", "#009688", "#8BC34A"
      ];
      
      const colors = categories.map((_, index) => 
        colorPalette[index % colorPalette.length]
      );

      setChartData({ categories, amounts, colors });
    } catch (err) {
      console.error("Error loading chart data:", err);
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChartData();
  }, []);

  if (loading) {
    return <Loading type="chart" />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <Error message={error} onRetry={loadChartData} />
      </Card>
    );
  }

  if (chartData.categories.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ApperIcon name="PieChart" size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Spending Data</h3>
          <p className="text-gray-600 text-center">
            Add some expense transactions to see your spending breakdown
          </p>
        </div>
      </Card>
    );
  }

  const pieOptions = {
    chart: {
      type: "pie",
      toolbar: {
        show: false
      }
    },
    labels: chartData.categories,
    colors: chartData.colors,
    legend: {
      position: "bottom",
      horizontalAlign: "center",
      fontSize: "13px",
      fontFamily: "Inter, sans-serif",
      markers: {
        width: 12,
        height: 12,
        radius: 6
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "0%"
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
        fontFamily: "Inter, sans-serif",
        fontWeight: 500
      },
      formatter: function(val) {
        return val.toFixed(1) + "%";
      }
    },
    tooltip: {
      style: {
        fontSize: "13px",
        fontFamily: "Inter, sans-serif"
      },
      y: {
        formatter: function(val) {
          return "$" + val.toLocaleString();
        }
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          height: 300
        },
        legend: {
          position: "bottom"
        }
      }
    }]
  };

  const donutOptions = {
    ...pieOptions,
    plotOptions: {
      pie: {
        donut: {
          size: "45%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Spent",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              color: "#374151",
              formatter: function(w) {
                const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return "$" + total.toLocaleString();
              }
            }
          }
        }
      }
    }
  };

  const options = type === "donut" ? donutOptions : pieOptions;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Spending Breakdown</h3>
        <div className="flex items-center text-sm text-gray-600">
          <ApperIcon name="Calendar" size={16} className="mr-1" />
          This Month
        </div>
      </div>
      <div className="relative">
        <Chart
          options={options}
          series={chartData.amounts}
          type="pie"
          height={400}
        />
      </div>
    </Card>
  );
};

export default SpendingChart;
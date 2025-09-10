import { useState, useEffect } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Select from "@/components/atoms/Select";
import ApperIcon from "@/components/ApperIcon";
import transactionService from "@/services/api/transactionService";
import { getMonthName } from "@/utils/formatters";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";

const TrendChart = () => {
  const [chartData, setChartData] = useState({ months: [], income: [], expenses: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("6"); // 6 months default

  const loadTrendData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const transactions = await transactionService.getAll();
      
      // Calculate months to show
      const monthsToShow = parseInt(timeRange);
      const currentDate = new Date();
      const monthsData = [];

      // Generate last N months
      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        const monthName = getMonthName((date.getMonth() + 1).toString().padStart(2, "0"));
        
        monthsData.push({
          key: monthKey,
          name: monthName,
          year: date.getFullYear(),
          month: date.getMonth() + 1
        });
      }

      // Calculate income and expenses for each month
      const incomeData = [];
      const expenseData = [];
      const monthLabels = [];

      monthsData.forEach(monthInfo => {
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() + 1 === monthInfo.month && 
                 transactionDate.getFullYear() === monthInfo.year;
        });

        const monthIncome = monthTransactions
          .filter(t => t.type === "income")
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const monthExpenses = monthTransactions
          .filter(t => t.type === "expense")
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        monthLabels.push(monthInfo.name);
        incomeData.push(monthIncome);
        expenseData.push(monthExpenses);
      });

      setChartData({
        months: monthLabels,
        income: incomeData,
        expenses: expenseData
      });
    } catch (err) {
      console.error("Error loading trend data:", err);
      setError("Failed to load trend data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrendData();
  }, [timeRange]);

  const handleTimeRangeChange = (e) => {
    setTimeRange(e.target.value);
  };

  if (loading) {
    return <Loading type="chart" />;
  }

  if (error) {
    return (
      <Card className="p-6">
        <Error message={error} onRetry={loadTrendData} />
      </Card>
    );
  }

  const options = {
    chart: {
      type: "line",
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    stroke: {
      curve: "smooth",
      width: 3
    },
    colors: ["#2E7D32", "#F44336"],
    xaxis: {
      categories: chartData.months,
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif"
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px",
          fontFamily: "Inter, sans-serif"
        },
        formatter: function(val) {
          return "$" + val.toLocaleString();
        }
      }
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 3
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "13px",
      fontFamily: "Inter, sans-serif",
      markers: {
        width: 12,
        height: 12,
        radius: 6
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

  const series = [
    {
      name: "Income",
      data: chartData.income
    },
    {
      name: "Expenses", 
      data: chartData.expenses
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses Trend</h3>
        <Select
          value={timeRange}
          onChange={handleTimeRangeChange}
          options={[
            { value: "3", label: "3 Months" },
            { value: "6", label: "6 Months" },
            { value: "12", label: "12 Months" }
          ]}
          className="w-32"
        />
      </div>
      <div className="relative">
        <Chart
          options={options}
          series={series}
          type="line"
          height={400}
        />
      </div>
    </Card>
  );
};

export default TrendChart;
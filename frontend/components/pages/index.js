// frontend/pages/index.js
import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Wallet, BellRing, Filter } from 'lucide-react';

// Placeholder for shadcn/ui components (replace with actual imports if running in a shadcn/ui project)
// These are minimal implementations to allow the code to run standalone in the preview.
const Card = ({ children, className }) => <div className={`bg-white shadow-md rounded-lg p-6 ${className}`}>{children}</div>;
const CardHeader = ({ children, className }) => <div className={`mb-4 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }) => <h3 className={`text-xl font-semibold ${className}`}>{children}</h3>;
const CardDescription = ({ children, className }) => <p className={`text-gray-600 text-sm ${className}`}>{children}</p>;
const CardContent = ({ children, className }) => <div className={`${className}`}>{children}</div>;
const Button = ({ children, className, variant = 'default', size = 'default', ...props }) => {
  const baseStyle = 'px-4 py-2 rounded-md font-medium transition-colors duration-200';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
    ghost: 'text-gray-700 hover:bg-gray-100',
  };
  const sizes = {
    default: '',
    sm: 'text-sm px-3 py-1.5',
    lg: 'text-lg px-6 py-3',
  };
  return <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};
const Select = ({ children, onValueChange, value }) => <select onChange={(e) => onValueChange(e.target.value)} value={value} className="p-2 border rounded-md">{children}</select>;
const SelectTrigger = ({ children }) => <>{children}</>;
const SelectValue = ({ placeholder }) => <span className="text-gray-700">{placeholder}</span>;
const SelectContent = ({ children }) => <>{children}</>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

// Backend API URL (important: use http://localhost:5000 for local development)
const API_BASE_URL = 'http://localhost:5000/api';

function HomePage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMonth, setFilterMonth] = useState('all');
  const [budgetAlerts, setBudgetAlerts] = useState([
    { id: 1, message: 'You are close to exceeding your "Entertainment" budget for the month.', type: 'warning' },
    { id: 2, message: 'Your "Food" expenses are 15% higher than last month.', type: 'info' },
  ]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/transactions`),
          fetch(`${API_BASE_URL}/categories`)
        ]);

        if (!transactionsRes.ok || !categoriesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const transactionsData = await transactionsRes.json();
        const categoriesData = await categoriesRes.json();

        setTransactions(transactionsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Optional: Fetch data periodically for "real-time" updates
    const interval = setInterval(fetchData, 30000); // Fetch every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Process data for charts and summaries
  const { monthlyData, expenseCategories, investments, totalIncome, totalExpenses, netSavings, filteredTransactions, monthlySummary, allMonths } = useMemo(() => {
    // Initialize default values
    let monthlyData = [];
    let expenseCategories = [];
    let investments = []; // Placeholder for investments, as backend doesn't provide it yet
    let currentMonth = new Date().toLocaleString('default', { month: 'long' });

    // Process transactions to generate monthly data
    const monthlyAggregates = transactions.reduce((acc, t) => {
      const date = new Date(t.date);
      const monthName = date.toLocaleString('default', { month: 'short' });
      if (!acc[monthName]) {
        acc[monthName] = { name: monthName, income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[monthName].income += parseFloat(t.amount);
      } else {
        acc[monthName].expenses += parseFloat(t.amount);
      }
      return acc;
    }, {});

    // Ensure all 12 months are present, even if no transactions
    const fullYearMonths = Array.from({ length: 12 }).map((_, i) => new Date(0, i).toLocaleString('default', { month: 'short' }));
    monthlyData = fullYearMonths.map(month => monthlyAggregates[month] || { name: month, income: 0, expenses: 0 });

    // Process transactions for expense categories
    const categoryAggregates = transactions.reduce((acc, t) => {
      if (t.type === 'expense') {
        if (!acc[t.category]) {
          acc[t.category] = { name: t.category, value: 0 };
        }
        acc[t.category].value += parseFloat(t.amount);
      }
      return acc;
    }, {});
    expenseCategories = Object.values(categoryAggregates).map(cat => ({
      ...cat,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] // Assign random color for now
    }));

    // For investments, using mock data as backend doesn't provide it yet
    investments = [
      { name: 'Stocks', value: Math.floor(Math.random() * 5000) + 10000, color: '#0088FE' },
      { name: 'Bonds', value: Math.floor(Math.random() * 3000) + 5000, color: '#00C49F' },
      { name: 'Real Estate', value: Math.floor(Math.random() * 8000) + 15000, color: '#FFBB28' },
      { name: 'Mutual Funds', value: Math.floor(Math.random() * 4000) + 8000, color: '#FF8042' },
    ];


    const currentMonthShort = currentMonth.substring(0, 3);
    const currentMonthData = monthlyData.find(m => m.name === currentMonthShort);
    const totalIncome = currentMonthData ? currentMonthData.income : 0;
    const totalExpenses = currentMonthData ? currentMonthData.expenses : 0;
    const netSavings = totalIncome - totalExpenses;

    const filteredTransactions = filterMonth === 'all'
      ? transactions
      : transactions.filter(t => new Date(t.date).toLocaleString('default', { month: 'long' }).toLowerCase() === filterMonth.toLowerCase());

    const summary = filteredTransactions.reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleString('default', { month: 'long' });
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      if (transaction.type === 'income') {
        acc[month].income += parseFloat(transaction.amount);
      } else {
        acc[month].expenses += parseFloat(transaction.amount);
      }
      return acc;
    }, {});

    const allMonths = monthlyData.map(m => new Date(Date.parse(m.name + " 1, 2000")).toLocaleString('default', { month: 'long'}));

    return {
      monthlyData,
      expenseCategories,
      investments,
      totalIncome,
      totalExpenses,
      netSavings,
      filteredTransactions,
      monthlySummary: summary[filterMonth] || { income: 0, expenses: 0 },
      allMonths
    };
  }, [transactions, filterMonth]);


  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BEE', '#FF6384', '#36A2EB'];

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-100">Loading dashboard...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 font-inter p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 p-4 bg-white rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Fintrack Dashboard</h1>
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="flex items-center space-x-2">
            <BellRing size={18} />
            <span>Alerts ({budgetAlerts.length})</span>
          </Button>
          <Button>Add Transaction</Button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Balance</CardTitle>
            <Wallet size={20} className="text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${(totalIncome - totalExpenses).toFixed(2)}</div>
            <p className="text-xs text-white opacity-80">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Income</CardTitle>
            <TrendingUp size={20} className="text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalIncome.toFixed(2)}</div>
            <p className="text-xs text-white opacity-80">+15.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total Expenses</CardTitle>
            <TrendingDown size={20} className="text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalExpenses.toFixed(2)}</div>
            <p className="text-xs text-white opacity-80">-5.2% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Net Savings</CardTitle>
            <DollarSign size={20} className="text-white opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${netSavings.toFixed(2)}</div>
            <p className="text-xs text-white opacity-80">{netSavings >= 0 ? 'Positive savings' : 'Negative savings'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Income vs. Expenses (Monthly)</CardTitle>
            <CardDescription>Overview of your financial flow throughout the year.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#82ca9d" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="expenses" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
            <CardDescription>Breakdown of your spending by category.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Investment Portfolio</CardTitle>
            <CardDescription>Distribution of your investments.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={investments} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Transactions and Monthly Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>A list of your latest financial activities.</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={18} />
              <Select onValueChange={setFilterMonth} value={filterMonth}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {allMonths.map((month) => (
                    <SelectItem key={month} value={month.toLowerCase()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.slice(0, 10).map((transaction) => ( // Display top 10 transactions
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{transaction.category}</td>
                      <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredTransactions.length === 0 && (
              <p className="text-center text-gray-500 mt-4">No transactions found for the selected month.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary ({filterMonth === 'all' ? new Date().toLocaleString('default', { month: 'long'}) : new Date(Date.parse(filterMonth + " 1, 2000")).toLocaleString('default', { month: 'long'})})</CardTitle>
            <CardDescription>Detailed summary of income and expenses for the selected period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Income:</span>
                <span className="font-semibold text-green-600">${monthlySummary.income.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Expenses:</span>
                <span className="font-semibold text-red-600">${monthlySummary.expenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-4 mt-4">
                <span className="text-lg font-bold">Net Savings:</span>
                <span className={`text-lg font-bold ${monthlySummary.income - monthlySummary.expenses >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${(monthlySummary.income - monthlySummary.expenses).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Alerts</CardTitle>
          <CardDescription>Important notifications regarding your budget.</CardDescription>
        </CardHeader>
        <CardContent>
          {budgetAlerts.length > 0 ? (
            <ul className="space-y-3">
              {budgetAlerts.map((alert) => (
                <li key={alert.id} className={`p-3 rounded-md flex items-center space-x-3 ${alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' : 'bg-blue-50 border border-blue-200 text-blue-800'}`}>
                  <BellRing size={20} />
                  <span>{alert.message}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No new budget alerts.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HomePage;

import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Target, TrendingUp, Calendar, Award, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const Savings: React.FC = () => {
  const { incomeEntries, expenseEntries, savingsGoals, addSavingsGoal, updateSavingsGoal } = useData();
  const [showModal, setShowModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    type: 'monthly' as const
  });

  // Calculate available balance
  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalSavingsAllocated = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const availableBalance = totalIncome - totalExpenses - totalSavingsAllocated;
  const savingsRate = totalIncome > 0 ? ((totalSavingsAllocated / totalIncome) * 100) : 0;

  // Validation function for savings transactions
  const validateSavingsTransaction = (amount: number): { isValid: boolean; error?: string } => {
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than $0' };
    }
    
    if (amount > availableBalance) {
      return { 
        isValid: false, 
        error: `Insufficient funds. Available balance: $${availableBalance.toFixed(2)}` 
      };
    }
    
    if (amount < 1) {
      return { isValid: false, error: 'Minimum savings amount is $1.00' };
    }
    
    return { isValid: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const targetAmount = parseFloat(formData.targetAmount);
      
      if (targetAmount <= 0) {
        setError('Target amount must be greater than $0');
        setLoading(false);
        return;
      }
      
      addSavingsGoal({
        ...formData,
        targetAmount,
        currentAmount: 0
      });
      
      setSuccess('Savings goal created successfully!');
      setShowModal(false);
      setFormData({
        title: '',
        targetAmount: '',
        deadline: '',
        type: 'monthly'
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create savings goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addToSavingsGoal = async (goalId: string, amount: number) => {
    setError('');
    setLoading(true);
    
    try {
      const validation = validateSavingsTransaction(amount);
      
      if (!validation.isValid) {
        setError(validation.error || 'Invalid transaction');
        setLoading(false);
        return;
      }
      
      const goal = savingsGoals.find(g => g.id === goalId);
      if (!goal) {
        setError('Savings goal not found');
        setLoading(false);
        return;
      }
      
      const newAmount = Math.min(goal.currentAmount + amount, goal.targetAmount);
      
      updateSavingsGoal(goalId, {
        currentAmount: newAmount
      });
      
      setSuccess(`Successfully added $${amount.toFixed(2)} to your savings goal!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add funds. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomAmountSubmit = () => {
    const amount = parseFloat(customAmount);
    if (isNaN(amount)) {
      setError('Please enter a valid amount');
      return;
    }
    
    addToSavingsGoal(selectedGoalId, amount);
    setShowAddFundsModal(false);
    setCustomAmount('');
    setSelectedGoalId('');
  };

  // Chart data preparation
  const savingsProgressData = savingsGoals.map(goal => ({
    name: goal.title,
    current: goal.currentAmount,
    target: goal.targetAmount,
    progress: (goal.currentAmount / goal.targetAmount) * 100
  }));

  const monthlyTrendData = React.useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthIncome = incomeEntries
        .filter(entry => entry.date.startsWith(monthKey))
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const monthExpenses = expenseEntries
        .filter(entry => entry.date.startsWith(monthKey))
        .reduce((sum, entry) => sum + entry.amount, 0);
      
      const monthSavings = monthIncome - monthExpenses;
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        savings: Math.max(0, monthSavings),
        income: monthIncome,
        expenses: monthExpenses
      });
    }
    
    return months;
  }, [incomeEntries, expenseEntries]);

  const goalStatusData = savingsGoals.map(goal => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return {
      name: goal.title,
      value: progress,
      amount: goal.currentAmount,
      target: goal.targetAmount
    };
  });

  const chartConfig = {
    savings: {
      label: "Savings",
      color: "hsl(var(--chart-1))",
    },
    income: {
      label: "Income",
      color: "hsl(var(--chart-2))",
    },
    expenses: {
      label: "Expenses",
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 flex items-center">
          <CheckCircle className="text-green-600 mr-2" size={18} />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-center">
          <AlertCircle className="text-red-600 mr-2" size={18} />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Savings & Goals</h1>
          <p className="text-gray-600 text-sm">Track your savings progress and achieve your financial goals</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <Plus size={18} className="mr-2" />
          Add Goal
        </button>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg sm:text-2xl font-bold text-green-600">${availableBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Available for savings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Saved</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg sm:text-2xl font-bold text-purple-600">${totalSavingsAllocated.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Across all goals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg sm:text-2xl font-bold text-blue-600">{savingsRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of total income
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Goals</CardTitle>
            <Award className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-lg sm:text-2xl font-bold text-orange-600">
              {savingsGoals.filter(g => g.currentAmount < g.targetAmount).length}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Savings Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Monthly Savings Trend</CardTitle>
            <CardDescription className="text-sm">
              Track your savings potential over the last 12 months
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ fill: "#8884d8" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Savings Goals Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Savings Goals Progress</CardTitle>
            <CardDescription className="text-sm">
              Visual breakdown of your goal completion status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {goalStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Savings Progress Bar Chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Goal Progress Comparison</CardTitle>
          <CardDescription className="text-sm">
            Compare progress across all your savings goals
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={savingsProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Bar dataKey="current" fill="#8884d8" />
                <Bar dataKey="target" fill="#e5e7eb" opacity={0.3} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Savings Goals */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Your Savings Goals</h2>
        </div>
        
        <div className="p-6">
          {savingsGoals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No savings goals yet</h3>
              <p className="text-gray-600 mb-4">Create your first savings goal to start building your financial future</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {savingsGoals.map((goal) => {
                const progress = (goal.currentAmount / goal.targetAmount) * 100;
                const isCompleted = goal.currentAmount >= goal.targetAmount;
                const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={goal.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Calendar size={14} className="mr-1" />
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                          <span className="ml-2">•</span>
                          <span className="ml-2 capitalize">{goal.type} goal</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">
                          ${goal.currentAmount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">
                          of ${goal.targetAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress</span>
                        <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-purple-600'}`}>
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-green-500' : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.min(100, progress)}%` }}
                        ></div>
                      </div>
                    </div>

                    {isCompleted ? (
                      <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg">
                        <Award className="text-green-600 mr-2" size={20} />
                        <span className="text-green-800 font-medium">Goal Achieved! 🎉</span>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => addToSavingsGoal(goal.id, 50)}
                          disabled={loading || availableBalance < 50}
                          className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add $50
                        </button>
                        <button
                          onClick={() => addToSavingsGoal(goal.id, 100)}
                          disabled={loading || availableBalance < 100}
                          className="flex-1 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add $100
                        </button>
                        <button
                          onClick={() => {
                            setSelectedGoalId(goal.id);
                            setShowAddFundsModal(true);
                          }}
                          disabled={loading || availableBalance <= 0}
                          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Custom Amount
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Financial Tips */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center mb-3">
          <Target className="mr-2" size={24} />
          <h3 className="text-lg font-semibold">Smart Savings Tips</h3>
        </div>
        <ul className="space-y-2 text-indigo-100">
          <li>• Aim to save at least 20% of your income</li>
          <li>• Set up automatic transfers to your savings account</li>
          <li>• Create an emergency fund covering 3-6 months of expenses</li>
          <li>• Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
          <li>• Track your available balance before making savings commitments</li>
        </ul>
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Savings Goal</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g., Emergency Fund, New MacBook"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      title: '',
                      targetAmount: '',
                      deadline: '',
                      type: 'monthly'
                    });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Amount Modal */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Custom Amount</h2>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                Available Balance: <span className="font-bold">${availableBalance.toFixed(2)}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Add ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={availableBalance}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter amount"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddFundsModal(false);
                    setCustomAmount('');
                    setSelectedGoalId('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomAmountSubmit}
                  disabled={loading || !customAmount || parseFloat(customAmount) <= 0}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Adding...' : 'Add Funds'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;
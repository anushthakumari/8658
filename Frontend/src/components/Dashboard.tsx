import React from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  Award,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { projects, incomeEntries, expenseEntries, savingsGoals } = useData();

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const activeProjects = projects.filter(p => p.status === 'active').length;

  const recentTransactions = [
    ...incomeEntries.slice(-3).map(entry => ({
      ...entry,
      type: 'income' as const,
      projectName: projects.find(p => p.id === entry.projectId)?.name || 'Unknown'
    })),
    ...expenseEntries.slice(-3).map(entry => ({
      ...entry,
      type: 'expense' as const,
      projectName: projects.find(p => p.id === entry.projectId)?.name || 'Unknown'
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Here's your financial overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingUp className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netProfit.toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Target className={netProfit >= 0 ? 'text-green-600' : 'text-red-600'} size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Projects</p>
              <p className="text-2xl font-bold text-blue-600">{activeProjects}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Award className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Income</span>
                <span className="text-sm font-medium">${totalIncome.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalIncome / Math.max(totalIncome, totalExpenses)) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Expenses</span>
                <span className="text-sm font-medium">${totalExpenses.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-red-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (totalExpenses / Math.max(totalIncome, totalExpenses)) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No transactions yet</p>
            ) : (
              recentTransactions.map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? 
                        <ArrowUp className="text-green-600" size={16} /> : 
                        <ArrowDown className="text-red-600" size={16} />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.projectName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>



      {/* Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Your Achievements</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
            <Award className="text-yellow-600 mr-3" size={20} />
            <div>
              <p className="font-medium text-sm">Welcome Aboard!</p>
              <p className="text-xs text-gray-600">Created your account</p>
            </div>
          </div>
          {totalIncome > 0 && (
            <div className="flex items-center p-3 bg-green-50 rounded-lg">
              <DollarSign className="text-green-600 mr-3" size={20} />
              <div>
                <p className="font-medium text-sm">First Income</p>
                <p className="text-xs text-gray-600">Recorded your first payment</p>
              </div>
            </div>
          )}
          {projects.length > 0 && (
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <Target className="text-blue-600 mr-3" size={20} />
              <div>
                <p className="font-medium text-sm">Project Manager</p>
                <p className="text-xs text-gray-600">Created your first project</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
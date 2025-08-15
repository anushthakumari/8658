import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, TrendingDown, Calendar, Tag, Laptop, CreditCard, Wrench, Megaphone } from 'lucide-react';

const Expenses: React.FC = () => {
  const { projects, expenseEntries, addExpenseEntry } = useData();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'software' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addExpenseEntry({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    
    setShowModal(false);
    setFormData({
      projectId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: 'software'
    });
  };

  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'software': return 'bg-blue-100 text-blue-800';
      case 'subscriptions': return 'bg-purple-100 text-purple-800';
      case 'equipment': return 'bg-orange-100 text-orange-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'software': return Laptop;
      case 'subscriptions': return CreditCard;
      case 'equipment': return Wrench;
      case 'marketing': return Megaphone;
      default: return Tag;
    }
  };

  const expensesByCategory = expenseEntries.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Tracking</h1>
          <p className="text-gray-600">Monitor your business expenses and stay on budget</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Expense
        </button>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-red-100 mb-1">Total Expenses</p>
            <p className="text-3xl font-bold">${totalExpenses.toFixed(2)}</p>
          </div>
          <TrendingDown size={48} className="text-red-200" />
        </div>
      </div>

      {/* Expense Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(expensesByCategory).map(([category, amount]) => {
          const Icon = getCategoryIcon(category);
          return (
            <div key={category} className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Icon size={20} className="text-gray-600 mr-2" />
                  <span className="font-medium capitalize">{category}</span>
                </div>
                <span className="text-red-600 font-bold">${amount.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expense Entries */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Expense History</h2>
        </div>
        
        <div className="divide-y">
          {expenseEntries.length === 0 ? (
            <div className="p-12 text-center">
              <TrendingDown className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses recorded yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your business expenses to better manage your finances</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Your First Expense
              </button>
            </div>
          ) : (
            expenseEntries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => {
                const project = projects.find(p => p.id === entry.projectId);
                const Icon = getCategoryIcon(entry.category);
                return (
                  <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Icon size={20} className="text-gray-600 mr-2" />
                          <h3 className="font-semibold text-gray-900 mr-3">{entry.description}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                            {entry.category}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <Tag size={14} className="mr-1" />
                            {project?.name || 'General Business'}
                          </div>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-red-600">-${entry.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{project?.clientName || 'Business Expense'}</p>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Add Expense Entry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project (Optional)
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">General Business Expense</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.clientName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="e.g., Adobe Creative Suite subscription"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="software">Software Tools</option>
                  <option value="subscriptions">Subscriptions</option>
                  <option value="equipment">Equipment</option>
                  <option value="marketing">Marketing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({
                      projectId: '',
                      amount: '',
                      description: '',
                      date: new Date().toISOString().split('T')[0],
                      category: 'software'
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, DollarSign, Calendar, Tag } from 'lucide-react';

const Income: React.FC = () => {
  const { projects, incomeEntries, addIncomeEntry } = useData();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    projectId: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'project-payment' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addIncomeEntry({
      ...formData,
      amount: parseFloat(formData.amount)
    });
    
    setShowModal(false);
    setFormData({
      projectId: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: 'project-payment'
    });
  };

  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'project-payment': return 'bg-green-100 text-green-800';
      case 'bonus': return 'bg-blue-100 text-blue-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income Tracking</h1>
          <p className="text-gray-600">Track all your freelance income and payments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Add Income
        </button>
      </div>

      {/* Total Income Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-1">Total Income</p>
            <p className="text-3xl font-bold">${totalIncome.toFixed(2)}</p>
          </div>
          <DollarSign size={48} className="text-green-200" />
        </div>
      </div>

      {/* Income Entries */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Income History</h2>
        </div>
        
        <div className="divide-y">
          {incomeEntries.length === 0 ? (
            <div className="p-12 text-center">
              <DollarSign className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No income recorded yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your freelance income to see your financial progress</p>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add Your First Income
              </button>
            </div>
          ) : (
            incomeEntries
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((entry) => {
                const project = projects.find(p => p.id === entry.projectId);
                return (
                  <div key={entry.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="font-semibold text-gray-900 mr-3">{entry.description}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                            {entry.category.replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 space-x-4">
                          <div className="flex items-center">
                            <Tag size={14} className="mr-1" />
                            {project?.name || 'Unknown Project'}
                          </div>
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">+${entry.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{project?.clientName || 'Unknown Client'}</p>
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
            <h2 className="text-xl font-bold mb-4">Add Income Entry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">Select a project</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Website design payment"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="project-payment">Project Payment</option>
                  <option value="bonus">Bonus</option>
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
                      category: 'project-payment'
                    });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  Lightbulb, 
  TrendingUp, 
  Shield, 
  Target, 
  PiggyBank, 
  Calculator,
  AlertTriangle,
  CheckCircle,
  Filter,
  Zap
} from 'lucide-react';
import {
  calculateFinancialMetrics,
  generateFinancialTips,
  getTipsByCategory,
  getActionableTips,
  FinancialTip
} from '../utils/financialTips';

const FinancialTips: React.FC = () => {
  const { incomeEntries, expenseEntries, savingsGoals } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showOnlyActionable, setShowOnlyActionable] = useState(false);

  const financialData = useMemo(() => 
    calculateFinancialMetrics(incomeEntries, expenseEntries, savingsGoals),
    [incomeEntries, expenseEntries, savingsGoals]
  );

  const allTips = useMemo(() => 
    generateFinancialTips(financialData),
    [financialData]
  );

  const filteredTips = useMemo(() => {
    let tips = allTips;
    
    if (selectedCategory !== 'all') {
      tips = getTipsByCategory(tips, selectedCategory);
    }
    
    if (showOnlyActionable) {
      tips = getActionableTips(tips);
    }
    
    return tips;
  }, [allTips, selectedCategory, showOnlyActionable]);

  const categories = [
    { id: 'all', name: 'All Tips', icon: Lightbulb },
    { id: 'emergency', name: 'Emergency Fund', icon: Shield },
    { id: 'saving', name: 'Savings', icon: PiggyBank },
    { id: 'budgeting', name: 'Budgeting', icon: Calculator },
    { id: 'investing', name: 'Investing', icon: TrendingUp },
    { id: 'goals', name: 'Goals', icon: Target },
    { id: 'taxes', name: 'Taxes', icon: AlertTriangle }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'medium': return <Zap className="h-5 w-5 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.id === category);
    if (categoryData) {
      const IconComponent = categoryData.icon;
      return <IconComponent className="h-4 w-4" />;
    }
    return <Lightbulb className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Tips</h1>
          <p className="text-gray-600 mt-1">
            Personalized advice based on your income and savings
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="bg-blue-50 px-3 py-2 rounded-lg">
            <span className="text-blue-600 font-medium">
              Savings Rate: {financialData.savingsRate.toFixed(1)}%
            </span>
          </div>
          <div className="bg-green-50 px-3 py-2 rounded-lg">
            <span className="text-green-600 font-medium">
              Available: ${financialData.availableBalance.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Category Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline h-4 w-4 mr-1" />
              Filter by Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <IconComponent className="h-3 w-3" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actionable Filter */}
          <div className="flex items-end">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showOnlyActionable}
                onChange={(e) => setShowOnlyActionable(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Actionable only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Tips Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTips.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg border border-gray-200 p-8 text-center">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tips Found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? "You're doing great! No specific recommendations at this time."
                : `No tips available for the ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} category.`
              }
            </p>
          </div>
        ) : (
          filteredTips.map((tip: FinancialTip) => (
            <div
              key={tip.id}
              className={`bg-white rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow ${getPriorityColor(tip.priority)}`}
            >
              <div className="p-6">
                {/* Tip Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(tip.category)}
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {tip.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getPriorityIcon(tip.priority)}
                    <span className="text-xs font-medium text-gray-500 capitalize">
                      {tip.priority}
                    </span>
                  </div>
                </div>

                {/* Tip Content */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {tip.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tip.content}
                </p>

                {/* Actionable Badge */}
                {tip.actionable && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <Zap className="h-3 w-3" />
                      Action Required
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredTips.length > 0 && (
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredTips.length}
              </div>
              <div className="text-sm text-gray-600">Total Tips</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {filteredTips.filter(tip => tip.priority === 'high').length}
              </div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredTips.filter(tip => tip.priority === 'medium').length}
              </div>
              <div className="text-sm text-gray-600">Medium Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredTips.filter(tip => tip.actionable).length}
              </div>
              <div className="text-sm text-gray-600">Actionable</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialTips;
import { IncomeEntry, ExpenseEntry, SavingsGoal } from '../types';

export interface FinancialTip {
  id: string;
  title: string;
  content: string;
  category: 'budgeting' | 'saving' | 'investing' | 'taxes' | 'emergency' | 'goals';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

export interface FinancialData {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  savingsRate: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  availableBalance: number;
  savingsGoals: SavingsGoal[];
}

export const calculateFinancialMetrics = (
  incomeEntries: IncomeEntry[],
  expenseEntries: ExpenseEntry[],
  savingsGoals: SavingsGoal[]
): FinancialData => {
  const totalIncome = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const availableBalance = totalIncome - totalExpenses - totalSavings;
  
  // Calculate monthly averages (assuming data from last 12 months)
  const monthlyIncome = totalIncome / 12;
  const monthlyExpenses = totalExpenses / 12;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    totalSavings,
    savingsRate,
    monthlyIncome,
    monthlyExpenses,
    availableBalance,
    savingsGoals
  };
};

export const generateFinancialTips = (financialData: FinancialData): FinancialTip[] => {
  const tips: FinancialTip[] = [];
  const { 
    totalIncome, 
    totalExpenses, 
    totalSavings, 
    savingsRate, 
    monthlyIncome, 
    monthlyExpenses, 
    availableBalance,
    savingsGoals 
  } = financialData;

  // Emergency Fund Tips
  const emergencyFund = totalSavings;
  const recommendedEmergencyFund = monthlyExpenses * 6;
  
  if (emergencyFund < recommendedEmergencyFund) {
    tips.push({
      id: 'emergency-fund',
      title: 'Build Your Emergency Fund',
      content: `You currently have $${emergencyFund.toFixed(2)} in savings. Financial experts recommend having 6 months of expenses (approximately $${recommendedEmergencyFund.toFixed(2)}) as an emergency fund. Consider allocating a portion of your available balance ($${availableBalance.toFixed(2)}) to build this safety net.`,
      category: 'emergency',
      priority: 'high',
      actionable: true
    });
  }

  // Savings Rate Tips
  if (savingsRate < 10) {
    tips.push({
      id: 'increase-savings-rate',
      title: 'Increase Your Savings Rate',
      content: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial advisors recommend saving at least 10-20% of your income. Try to increase your monthly savings by $${(monthlyIncome * 0.1 - (totalSavings / 12)).toFixed(2)} to reach the 10% target.`,
      category: 'saving',
      priority: 'high',
      actionable: true
    });
  } else if (savingsRate >= 10 && savingsRate < 20) {
    tips.push({
      id: 'good-savings-rate',
      title: 'Great Savings Progress!',
      content: `Your savings rate of ${savingsRate.toFixed(1)}% is above the recommended 10% minimum. Consider increasing it to 20% for even better financial security and faster goal achievement.`,
      category: 'saving',
      priority: 'medium',
      actionable: true
    });
  } else {
    tips.push({
      id: 'excellent-savings-rate',
      title: 'Excellent Savings Discipline!',
      content: `Outstanding! Your savings rate of ${savingsRate.toFixed(1)}% is excellent. You're well on your way to financial independence. Consider exploring investment opportunities to grow your wealth faster.`,
      category: 'investing',
      priority: 'low',
      actionable: true
    });
  }

  // Expense Management Tips
  const expenseToIncomeRatio = (totalExpenses / totalIncome) * 100;
  if (expenseToIncomeRatio > 70) {
    tips.push({
      id: 'reduce-expenses',
      title: 'Review Your Expenses',
      content: `Your expenses account for ${expenseToIncomeRatio.toFixed(1)}% of your income. Consider reviewing your spending categories to identify areas where you can cut back. The 50/30/20 rule suggests spending no more than 50% on needs and 30% on wants.`,
      category: 'budgeting',
      priority: 'high',
      actionable: true
    });
  }

  // Available Balance Tips
  if (availableBalance > monthlyIncome * 2) {
    tips.push({
      id: 'invest-surplus',
      title: 'Consider Investing Your Surplus',
      content: `You have $${availableBalance.toFixed(2)} available. This surplus could be working harder for you. Consider investing in index funds, stocks, or other investment vehicles to grow your wealth over time.`,
      category: 'investing',
      priority: 'medium',
      actionable: true
    });
  } else if (availableBalance < 0) {
    tips.push({
      id: 'budget-deficit',
      title: 'Address Budget Deficit',
      content: `You're spending more than you earn. Your deficit is $${Math.abs(availableBalance).toFixed(2)}. Focus on reducing expenses or increasing income to get back on track financially.`,
      category: 'budgeting',
      priority: 'high',
      actionable: true
    });
  }

  // Savings Goals Tips
  const activeGoals = savingsGoals.filter(goal => goal.currentAmount < goal.targetAmount);
  if (activeGoals.length === 0 && totalSavings > recommendedEmergencyFund) {
    tips.push({
      id: 'set-savings-goals',
      title: 'Set New Savings Goals',
      content: `You have a solid emergency fund! Consider setting specific savings goals for things like a house down payment, vacation, new equipment, or retirement. Having clear goals makes saving more motivating.`,
      category: 'goals',
      priority: 'medium',
      actionable: true
    });
  }

  // Tax Planning Tips
  if (monthlyIncome > 5000) {
    tips.push({
      id: 'tax-planning',
      title: 'Consider Tax Planning Strategies',
      content: `With your income level, you might benefit from tax planning strategies. Consider contributing to retirement accounts (401k, IRA), tracking business expenses for deductions, and consulting with a tax professional.`,
      category: 'taxes',
      priority: 'medium',
      actionable: true
    });
  }

  // Income Growth Tips
  if (totalIncome > 0) {
    tips.push({
      id: 'diversify-income',
      title: 'Diversify Your Income Streams',
      content: `As a freelancer, consider developing multiple income streams to reduce risk. This could include recurring clients, passive income through courses or products, or different types of projects.`,
      category: 'budgeting',
      priority: 'medium',
      actionable: true
    });
  }

  // Sort tips by priority
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return tips.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
};

export const getTipsByCategory = (tips: FinancialTip[], category: string): FinancialTip[] => {
  return tips.filter(tip => tip.category === category);
};

export const getActionableTips = (tips: FinancialTip[]): FinancialTip[] => {
  return tips.filter(tip => tip.actionable);
};
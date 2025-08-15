export interface User {
  id: string;
  name: string;
  email: string;
  currency: string;
  joinDate: string;
  totalIncome: number;
  totalSavings: number;
  achievements: string[];
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  expectedPayment: number;
  status: 'active' | 'completed' | 'on-hold';
  createdDate: string;
  budgetAllocation: number; // percentage
}

export interface IncomeEntry {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  date: string;
  category: 'project-payment' | 'bonus' | 'other';
}

export interface ExpenseEntry {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  date: string;
  category: 'software' | 'subscriptions' | 'equipment' | 'marketing' | 'other';
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  type: 'monthly' | 'yearly';
}

export interface FinancialTip {
  id: string;
  title: string;
  content: string;
  category: 'budgeting' | 'saving' | 'investing' | 'taxes';
}
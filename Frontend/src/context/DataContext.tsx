import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, IncomeEntry, ExpenseEntry, SavingsGoal } from '../types';
import { useAuth } from './AuthContext';
import { projectsAPI, incomeAPI, expenseAPI } from '../services/api';

interface DataContextType {
  projects: Project[];
  incomeEntries: IncomeEntry[];
  expenseEntries: ExpenseEntry[];
  savingsGoals: SavingsGoal[];
  loading: boolean;
  addProject: (project: Omit<Project, 'id' | 'createdDate'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addIncomeEntry: (entry: Omit<IncomeEntry, 'id'>) => Promise<void>;
  addExpenseEntry: (entry: Omit<ExpenseEntry, 'id'>) => Promise<void>;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [incomeEntries, setIncomeEntries] = useState<IncomeEntry[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<ExpenseEntry[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Load all data in parallel
      const [projectsResponse, incomeResponse, expenseResponse] = await Promise.all([
        projectsAPI.getProjects({ limit: 100 }),
        incomeAPI.getIncomeEntries({ limit: 100 }),
        expenseAPI.getExpenseEntries({ limit: 100 })
      ]);

      setProjects(projectsResponse.projects);
      setIncomeEntries(incomeResponse.entries);
      setExpenseEntries(expenseResponse.entries);

      // Load savings goals from localStorage for now (since backend doesn't have this endpoint yet)
      const userGoals = JSON.parse(localStorage.getItem(`savings-goals-${user.id}`) || '[]');
      setSavingsGoals(userGoals);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDataOnUserChange = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Load all data in parallel
        const [projectsResponse, incomeResponse, expenseResponse] = await Promise.all([
          projectsAPI.getProjects({ limit: 100 }),
          incomeAPI.getIncomeEntries({ limit: 100 }),
          expenseAPI.getExpenseEntries({ limit: 100 })
        ]);

        setProjects(projectsResponse.projects);
        setIncomeEntries(incomeResponse.entries);
        setExpenseEntries(expenseResponse.entries);

        // Load savings goals from localStorage for now (since backend doesn't have this endpoint yet)
        const userGoals = JSON.parse(localStorage.getItem(`savings-goals-${user.id}`) || '[]');
        setSavingsGoals(userGoals);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDataOnUserChange();
  }, [user]);

  const refreshData = async () => {
    await loadData();
  };

  const addProject = async (project: Omit<Project, 'id' | 'createdDate'>) => {
    try {
      const newProject = await projectsAPI.createProject(project);
      setProjects(prev => [...prev, newProject]);
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectsAPI.updateProject(id, updates);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsAPI.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  };

  const addIncomeEntry = async (entry: Omit<IncomeEntry, 'id'>) => {
    try {
      const newEntry = await incomeAPI.createIncomeEntry(entry);
      setIncomeEntries(prev => [...prev, newEntry]);
    } catch (error) {
      console.error('Failed to create income entry:', error);
      throw error;
    }
  };

  const addExpenseEntry = async (entry: Omit<ExpenseEntry, 'id'>) => {
    try {
      const newEntry = await expenseAPI.createExpenseEntry(entry);
      setExpenseEntries(prev => [...prev, newEntry]);
    } catch (error) {
      console.error('Failed to create expense entry:', error);
      throw error;
    }
  };

  // These will use localStorage until we implement savings goals API
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
    };
    const updatedGoals = [...savingsGoals, newGoal];
    setSavingsGoals(updatedGoals);
    if (user) {
      localStorage.setItem(`savings-goals-${user.id}`, JSON.stringify(updatedGoals));
    }
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    const updatedGoals = savingsGoals.map(g => g.id === id ? { ...g, ...updates } : g);
    setSavingsGoals(updatedGoals);
    if (user) {
      localStorage.setItem(`savings-goals-${user.id}`, JSON.stringify(updatedGoals));
    }
  };

  return (
    <DataContext.Provider value={{
      projects,
      incomeEntries,
      expenseEntries,
      savingsGoals,
      loading,
      addProject,
      updateProject,
      deleteProject,
      addIncomeEntry,
      addExpenseEntry,
      addSavingsGoal,
      updateSavingsGoal,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};

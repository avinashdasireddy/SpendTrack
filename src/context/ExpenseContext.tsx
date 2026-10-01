import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Expense, ExpenseCategory, ToastMessage, ToastAction } from '../types';
import { useAuth } from './AuthContext';
import { formatINR } from '../utils/currency';
import { getKolkataDateString, getKolkataYesterdayString } from '../utils/date';
import { triggerHaptic } from '../utils/haptics';

interface ExpenseContextType {
  expenses: Expense[];
  isLoading: boolean;
  addExpense: (
    data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ) => Promise<Expense>;
  updateExpense: (
    id: string,
    updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>
  ) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  undoDelete: () => Promise<void>;
  clearAllExpenses: () => Promise<void>;
  loadSampleData: () => Promise<void>;
  importExpenses: (importedList: Partial<Expense>[]) => Promise<{ addedCount: number; duplicateCount: number }>;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info', action?: ToastAction) => void;
  monthlyBudget: number | null;
  setMonthlyBudget: (amount: number | null) => void;
  categoryBudgets: Partial<Record<ExpenseCategory, number>>;
  setCategoryBudget: (category: ExpenseCategory, amount: number | null) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [monthlyBudget, setMonthlyBudgetState] = useState<number | null>(null);
  const [categoryBudgets, setCategoryBudgetsState] = useState<Partial<Record<ExpenseCategory, number>>>({});

  // Keep track of the last deleted expense for Undo capability
  const lastDeletedRef = useRef<{ expense: Expense; index: number } | null>(null);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'success', action?: ToastAction) => {
      const id = 'toast_' + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message, action }]);

      // Extended timeout if there is an actionable Undo button (6 seconds)
      const duration = action ? 6000 : 4000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Storage key is strictly scoped to the authenticated user's UID
  const getStorageKey = useCallback(
    (uid: string) => `spendtrack_expenses_${uid}`,
    []
  );

  const getBudgetKey = useCallback(
    (uid: string) => `spendtrack_budget_${uid}`,
    []
  );

  // Load expenses and budget whenever user changes
  useEffect(() => {
    if (!user) {
      setExpenses([]);
      setMonthlyBudgetState(null);
      setCategoryBudgetsState({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const key = getStorageKey(user.uid);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Expense[];
        // Double verify user ownership boundary
        const userExpenses = parsed.filter((e) => e.userId === user.uid);
        setExpenses(userExpenses);
      } else {
        setExpenses([]);
      }

      // Load budget
      const budgetKey = getBudgetKey(user.uid);
      const rawBudget = localStorage.getItem(budgetKey);
      if (rawBudget) {
        const parsedBudget = JSON.parse(rawBudget);
        setMonthlyBudgetState(parsedBudget.overallAmount ?? null);
        setCategoryBudgetsState(parsedBudget.categoryBudgets ?? {});
      } else {
        setMonthlyBudgetState(null);
        setCategoryBudgetsState({});
      }
    } catch (err) {
      console.error('Failed to load user expenses from storage', err);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, getStorageKey, getBudgetKey]);

  // Sync with changes from other tabs or windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (user && e.key === getStorageKey(user.uid) && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as Expense[];
          setExpenses(parsed.filter((item) => item.userId === user.uid));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user, getStorageKey]);

  // Save array to storage strictly scoped to user
  const persistExpenses = useCallback(
    (updated: Expense[]) => {
      if (!user) return;
      const key = getStorageKey(user.uid);
      localStorage.setItem(key, JSON.stringify(updated));
      setExpenses(updated);
    },
    [user, getStorageKey]
  );

  const setMonthlyBudget = useCallback(
    (amount: number | null) => {
      if (!user) return;
      setMonthlyBudgetState(amount);
      const budgetKey = getBudgetKey(user.uid);
      const current = localStorage.getItem(budgetKey);
      const obj = current ? JSON.parse(current) : { categoryBudgets: {} };
      obj.overallAmount = amount;
      localStorage.setItem(budgetKey, JSON.stringify(obj));
      if (amount !== null) {
        showToast(`Monthly budget set to ${formatINR(amount)}!`);
      } else {
        showToast('Monthly budget removed', 'info');
      }
    },
    [user, getBudgetKey, showToast]
  );

  const setCategoryBudget = useCallback(
    (category: ExpenseCategory, amount: number | null) => {
      if (!user) return;
      setCategoryBudgetsState((prev) => {
        const copy = { ...prev };
        if (amount === null) {
          delete copy[category];
        } else {
          copy[category] = amount;
        }

        const budgetKey = getBudgetKey(user.uid);
        const current = localStorage.getItem(budgetKey);
        const obj = current ? JSON.parse(current) : { overallAmount: monthlyBudget };
        obj.categoryBudgets = copy;
        localStorage.setItem(budgetKey, JSON.stringify(obj));
        return copy;
      });
      if (amount !== null) {
        showToast(`${category} budget set to ${formatINR(amount)}!`);
      }
    },
    [user, getBudgetKey, monthlyBudget, showToast]
  );

  const addExpense = async (
    data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'userId'>
  ): Promise<Expense> => {
    if (!user) {
      throw new Error('You must be signed in to record an expense.');
    }

    if (data.amount <= 0 || isNaN(data.amount)) {
      throw new Error('Amount must be greater than ₹0');
    }

    if (!data.reason || !data.reason.trim()) {
      throw new Error('Please enter what and why you spent this money.');
    }

    const now = Date.now();
    const newExpense: Expense = {
      ...data,
      id: 'exp_' + Math.random().toString(36).substring(2, 11) + '_' + now,
      userId: user.uid,
      reason: data.reason.trim(),
      notes: data.notes?.trim() || '',
      createdAt: now,
      updatedAt: now,
    };

    // Prepend to top
    const updated = [newExpense, ...expenses];
    persistExpenses(updated);

    showToast(`Recorded ${formatINR(newExpense.amount)} for ${newExpense.category}!`);
    return newExpense;
  };

  const updateExpense = async (
    id: string,
    updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Expense> => {
    if (!user) {
      throw new Error('You must be signed in to edit an expense.');
    }

    const index = expenses.findIndex((e) => e.id === id && e.userId === user.uid);
    if (index === -1) {
      throw new Error('Expense not found or unauthorized.');
    }

    if (updates.amount !== undefined && (updates.amount <= 0 || isNaN(updates.amount))) {
      throw new Error('Amount must be greater than ₹0');
    }

    const existing = expenses[index];
    const updatedItem: Expense = {
      ...existing,
      ...updates,
      reason: updates.reason !== undefined ? updates.reason.trim() : existing.reason,
      notes: updates.notes !== undefined ? updates.notes?.trim() : existing.notes,
      updatedAt: Date.now(),
    };

    const copy = [...expenses];
    copy[index] = updatedItem;
    persistExpenses(copy);

    showToast(`Updated expense: ${formatINR(updatedItem.amount)}`);
    return updatedItem;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('You must be signed in to delete an expense.');
    }

    const index = expenses.findIndex((e) => e.id === id && e.userId === user.uid);
    if (index === -1) return;

    const target = expenses[index];
    lastDeletedRef.current = { expense: target, index };

    const remaining = expenses.filter((e) => e.id !== id);
    persistExpenses(remaining);

    // Provide immediate UNDO action in the toast
    showToast(
      `Deleted ${formatINR(target.amount)} (${target.category})`,
      'info',
      {
        label: 'UNDO',
        onClick: () => {
          undoDelete();
        },
      }
    );
  };

  const undoDelete = async (): Promise<void> => {
    if (!lastDeletedRef.current || !user) return;
    const { expense, index } = lastDeletedRef.current;

    // Check if not already restored
    if (expenses.some((e) => e.id === expense.id)) return;

    const copy = [...expenses];
    const insertIdx = Math.min(index, copy.length);
    copy.splice(insertIdx, 0, expense);

    persistExpenses(copy);
    lastDeletedRef.current = null;
    triggerHaptic('success');
    showToast(`Restored ${formatINR(expense.amount)} (${expense.reason})`, 'success');
  };

  const clearAllExpenses = async (): Promise<void> => {
    if (!user) return;
    persistExpenses([]);
    showToast('All expense records cleared', 'info');
  };

  const importExpenses = async (
    importedList: Partial<Expense>[]
  ): Promise<{ addedCount: number; duplicateCount: number }> => {
    if (!user) throw new Error('Must be signed in to import records');

    let addedCount = 0;
    let duplicateCount = 0;
    const currentList = [...expenses];
    const existingIds = new Set(currentList.map((e) => e.id));
    const now = Date.now();

    for (const item of importedList) {
      if (!item.amount || isNaN(item.amount) || item.amount <= 0 || !item.reason) {
        continue;
      }

      // If item already exists by ID
      if (item.id && existingIds.has(item.id)) {
        duplicateCount++;
        continue;
      }

      const newExpense: Expense = {
        id: item.id || 'exp_' + Math.random().toString(36).substring(2, 11) + '_' + (now + addedCount),
        userId: user.uid,
        amount: Number(item.amount),
        category: (item.category as ExpenseCategory) || 'Other',
        reason: String(item.reason).trim(),
        paymentMethod: (item.paymentMethod as any) || 'UPI',
        date: item.date || getKolkataDateString(),
        time: item.time || '12:00',
        notes: item.notes ? String(item.notes).trim() : '',
        createdAt: item.createdAt || now,
        updatedAt: item.updatedAt || now,
      };

      currentList.push(newExpense);
      existingIds.add(newExpense.id);
      addedCount++;
    }

    if (addedCount > 0) {
      // Sort by date descending
      currentList.sort((a, b) => b.date.localeCompare(a.date));
      persistExpenses(currentList);
      triggerHaptic('success');
      showToast(`Imported ${addedCount} expenses successfully!`);
    } else {
      showToast('No new expenses found to import', 'info');
    }

    return { addedCount, duplicateCount };
  };

  const loadSampleData = async (): Promise<void> => {
    if (!user) return;
    const today = getKolkataDateString();
    const yesterday = getKolkataYesterdayString();
    const now = Date.now();

    const samples: Expense[] = [
      {
        id: 'sample_1',
        userId: user.uid,
        amount: 25,
        category: 'Food',
        reason: 'Chai & biscuits at tea stall',
        paymentMethod: 'UPI',
        date: today,
        time: '09:30',
        notes: 'Morning tea',
        createdAt: now - 3600000 * 5,
        updatedAt: now - 3600000 * 5,
      },
      {
        id: 'sample_2',
        userId: user.uid,
        amount: 60,
        category: 'Travel',
        reason: 'Metro card recharge',
        paymentMethod: 'UPI',
        date: today,
        time: '10:15',
        notes: 'Daily commute',
        createdAt: now - 3600000 * 4,
        updatedAt: now - 3600000 * 4,
      },
      {
        id: 'sample_3',
        userId: user.uid,
        amount: 180,
        category: 'Food',
        reason: 'Lunch thali with colleagues',
        paymentMethod: 'UPI',
        date: today,
        time: '13:30',
        notes: 'North Indian lunch',
        createdAt: now - 3600000 * 2,
        updatedAt: now - 3600000 * 2,
      },
      {
        id: 'sample_4',
        userId: user.uid,
        amount: 340,
        category: 'Groceries',
        reason: 'Milk, bread and vegetables',
        paymentMethod: 'UPI',
        date: yesterday,
        time: '18:45',
        notes: 'Local vegetable market',
        createdAt: now - 86400000,
        updatedAt: now - 86400000,
      },
      {
        id: 'sample_5',
        userId: user.uid,
        amount: 799,
        category: 'Recharge',
        reason: 'Airtel 3-month mobile recharge',
        paymentMethod: 'UPI',
        date: yesterday,
        time: '11:00',
        notes: 'Unlimited 5G pack',
        createdAt: now - 86400000 * 1.5,
        updatedAt: now - 86400000 * 1.5,
      },
      {
        id: 'sample_6',
        userId: user.uid,
        amount: 1450,
        category: 'Shopping',
        reason: 'Cotton summer shirt',
        paymentMethod: 'Credit Card',
        date: yesterday,
        time: '16:20',
        notes: 'Weekend sale',
        createdAt: now - 86400000 * 2,
        updatedAt: now - 86400000 * 2,
      },
    ];

    persistExpenses(samples);
    triggerHaptic('success');
    showToast('Loaded sample expenses for quick testing!');
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        isLoading,
        addExpense,
        updateExpense,
        deleteExpense,
        undoDelete,
        clearAllExpenses,
        loadSampleData,
        importExpenses,
        toasts,
        removeToast,
        showToast,
        monthlyBudget,
        setMonthlyBudget,
        categoryBudgets,
        setCategoryBudget,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Sun, Moon, Sparkles, HelpCircle, Settings as SettingsIcon, WifiOff } from 'lucide-react';
import { ActiveTab, Expense } from '../../types';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getKolkataGreeting, formatFullDate } from '../../utils/date';
import { AddExpenseModal } from '../modals/AddExpenseModal';
import { DeleteConfirmDialog } from '../modals/DeleteConfirmDialog';
import { ExpenseDetailSheet } from '../modals/ExpenseDetailSheet';
import { OnboardingModal } from '../modals/OnboardingModal';
import { ToastContainer } from '../common/ToastContainer';
import { useExpenses } from '../../context/ExpenseContext';

import { triggerHaptic } from '../../utils/haptics';

interface AppShellProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  children: (props: {
    onEditExpense: (expense: Expense) => void;
    onDeleteExpense: (expense: Expense) => void;
    onSelectExpense: (expense: Expense) => void;
    onOpenAddExpense: () => void;
  }) => React.ReactNode;
}

export function AppShell({ activeTab, onSelectTab, children }: AppShellProps) {
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { deleteExpense, showToast } = useExpenses();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [selectedDetailExpense, setSelectedDetailExpense] = useState<Expense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
    return !localStorage.getItem('spendtrack_onboarded_dismissed');
  });
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerHaptic('success');
      showToast('Connection restored. Online sync active.', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      triggerHaptic('warning');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showToast]);

  const handleOpenAdd = () => {
    triggerHaptic('medium');
    setExpenseToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    triggerHaptic('light');
    setSelectedDetailExpense(null);
    setExpenseToEdit(expense);
    setIsAddModalOpen(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    triggerHaptic('medium');
    setSelectedDetailExpense(null);
    setExpenseToDelete(expense);
  };

  const handleSelectExpense = (expense: Expense) => {
    triggerHaptic('light');
    setSelectedDetailExpense(expense);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;
    try {
      setIsDeleting(true);
      await deleteExpense(expenseToDelete.id);
      triggerHaptic('success');
      setExpenseToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDismissOnboarding = () => {
    localStorage.setItem('spendtrack_onboarded_dismissed', 'true');
    setIsOnboardingOpen(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col lg:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      {/* Desktop Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenAddExpense={handleOpenAdd}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-28 lg:pb-10">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 px-4 sm:px-8 py-3 pt-safe flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white truncate">
              {getKolkataGreeting(user?.displayName)}
            </h2>
            <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 truncate">
              {formatFullDate()}
            </p>
          </div>

          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
            {/* Onboarding info trigger */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsOnboardingOpen(true);
              }}
              className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center active:scale-95 cursor-pointer"
              title="Quick Guide"
              aria-label="Quick Guide"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Quick theme toggle */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
              }}
              className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center active:scale-95 cursor-pointer"
              title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle Theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* Settings button on mobile with user avatar styling */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onSelectTab('settings');
              }}
              className="lg:hidden w-10 h-10 min-w-[44px] min-h-[44px] rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center active:scale-95 cursor-pointer"
              title="Settings"
              aria-label="Settings"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                {user?.displayName?.charAt(0) || <SettingsIcon className="w-3.5 h-3.5" />}
              </div>
            </button>

            {/* Primary Desktop + Add Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs hover:shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ Add Expense</span>
            </button>
          </div>
        </header>

        {/* Offline Notification Banner */}
        {!isOnline && (
          <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2">
            <WifiOff className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>You're currently offline. Your records are preserved safely and will sync on reconnect.</span>
          </div>
        )}

        {/* Routed Screen View with animated page transition */}
        <main className="flex-1 px-3.5 sm:px-8 py-5 sm:py-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {children({
                onEditExpense: handleEditExpense,
                onDeleteExpense: handleDeleteExpense,
                onSelectExpense: handleSelectExpense,
                onOpenAddExpense: handleOpenAdd,
              })}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenAddExpense={handleOpenAdd}
      />

      {/* Add / Edit Expense Bottom Sheet Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        expenseToEdit={expenseToEdit}
      />

      {/* Expense Detail Sheet */}
      <ExpenseDetailSheet
        expense={selectedDetailExpense}
        isOpen={Boolean(selectedDetailExpense)}
        onClose={() => setSelectedDetailExpense(null)}
        onEdit={handleEditExpense}
        onDelete={handleDeleteExpense}
      />

      {/* Delete Confirmation Sheet */}
      <DeleteConfirmDialog
        isOpen={Boolean(expenseToDelete)}
        expense={expenseToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
        isDeleting={isDeleting}
      />

      {/* Onboarding Dialog */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleDismissOnboarding}
        onOpenAddExpense={handleOpenAdd}
      />

      {/* Floating Notifications */}
      <ToastContainer />
    </div>
  );
}

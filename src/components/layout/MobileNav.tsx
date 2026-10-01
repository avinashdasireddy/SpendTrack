import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Plus,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface MobileNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
}

export function MobileNav({
  activeTab,
  onSelectTab,
  onOpenAddExpense,
}: MobileNavProps) {
  const handleTabSelect = (tab: ActiveTab) => {
    triggerHaptic('light');
    onSelectTab(tab);
  };

  const handleAddClick = () => {
    triggerHaptic('medium');
    onOpenAddExpense();
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-zinc-900/92 backdrop-blur-xl border-t border-zinc-200/80 dark:border-zinc-800/80 px-2 pt-1 pb-safe shadow-xl">
      <div className="flex items-center justify-between max-w-md mx-auto relative px-1">
        {/* 1. Dashboard / Home */}
        <button
          type="button"
          onClick={() => handleTabSelect('dashboard')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-95 ${
            activeTab === 'dashboard'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
          }`}
          aria-label="Home Dashboard"
        >
          <LayoutDashboard className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
          {activeTab === 'dashboard' && (
            <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
          )}
        </button>

        {/* 2. Expenses */}
        <button
          type="button"
          onClick={() => handleTabSelect('expenses')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-95 ${
            activeTab === 'expenses'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
          }`}
          aria-label="Expenses List"
        >
          <Receipt className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Expenses</span>
          {activeTab === 'expenses' && (
            <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
          )}
        </button>

        {/* 3. Center Elevated + Add Action Button (Native iOS feel) */}
        <div className="relative -top-5 px-1 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={handleAddClick}
            className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 transition-all border-[3.5px] border-white dark:border-zinc-900 cursor-pointer"
            title="Add Expense"
            aria-label="Add Expense"
          >
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </button>
        </div>

        {/* 4. Reports */}
        <button
          type="button"
          onClick={() => handleTabSelect('reports')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-95 ${
            activeTab === 'reports'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
          }`}
          aria-label="Analytics & Reports"
        >
          <BarChart3 className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Reports</span>
          {activeTab === 'reports' && (
            <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
          )}
        </button>

        {/* 5. Calendar */}
        <button
          type="button"
          onClick={() => handleTabSelect('calendar')}
          className={`flex-1 min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-95 ${
            activeTab === 'calendar'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 font-medium'
          }`}
          aria-label="Monthly Calendar"
        >
          <Calendar className="w-5 h-5 stroke-[2]" />
          <span className="text-[10px] mt-0.5 tracking-tight">Calendar</span>
          {activeTab === 'calendar' && (
            <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
}

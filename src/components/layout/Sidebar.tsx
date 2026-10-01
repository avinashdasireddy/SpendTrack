import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Calendar,
  Settings,
  PlusCircle,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ActiveTab } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useExpenses } from '../../context/ExpenseContext';
import { getLifetimeTotal, getTransactionCount } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  onOpenAddExpense,
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const { expenses } = useExpenses();

  const lifetimeTotal = getLifetimeTotal(expenses);
  const txnCount = getTransactionCount(expenses);

  const navItems: { key: ActiveTab; label: string; icon: React.ElementType }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'expenses', label: 'Expenses', icon: Receipt },
    { key: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { key: 'calendar', label: 'Calendar View', icon: Calendar },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
              SpendTrack
            </h1>
            <p className="text-[11px] text-zinc-400 font-medium">
              Personal Expense Tracker
            </p>
          </div>
        </div>
      </div>

      {/* Prominent + Add Expense Button */}
      <div className="px-5 pt-5 pb-2">
        <button
          type="button"
          onClick={onOpenAddExpense}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectTab(item.key)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400 dark:text-emerald-600' : 'text-zinc-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Lifetime mini card */}
      <div className="mx-4 mb-4 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-800">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Lifetime Spent
        </div>
        <div className="text-lg font-bold text-zinc-900 dark:text-white font-mono tabular-nums mt-0.5">
          {formatINR(lifetimeTotal)}
        </div>
        <div className="text-[11px] text-zinc-400 mt-0.5">
          {txnCount} {txnCount === 1 ? 'total record' : 'total records'}
        </div>
      </div>

      {/* User profile footer */}
      {user && (
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-center text-xs shrink-0 border border-emerald-500/30">
              {user.displayName?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                {user.displayName}
              </p>
              <p className="text-[10px] text-zinc-400 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={signOut}
            title="Log out"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}
    </aside>
  );
}

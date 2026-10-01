import React, { useState } from 'react';
import {
  User,
  Mail,
  Moon,
  Sun,
  Laptop,
  IndianRupee,
  Clock,
  Download,
  Trash2,
  Database,
  ShieldCheck,
  LogOut,
  Users,
  Check,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, Theme } from '../context/ThemeContext';
import { useExpenses } from '../context/ExpenseContext';
import { exportExpensesToCSV } from '../utils/exportCsv';
import { getLifetimeTotal, getTransactionCount } from '../utils/calculations';
import { formatINR } from '../utils/currency';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { triggerHaptic } from '../utils/haptics';

interface SettingsViewProps {
  onNavigateToDashboard: () => void;
}

export function SettingsView({ onNavigateToDashboard }: SettingsViewProps) {
  const { user, signOut, switchAccount } = useAuth();
  const { theme, setTheme } = useTheme();
  const { expenses, clearAllExpenses, loadSampleData } = useExpenses();

  const [confirmClear, setConfirmClear] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState(user?.email || '');

  const totalSpent = getLifetimeTotal(expenses);
  const txnCount = getTransactionCount(expenses);

  const handleExportAll = () => {
    exportExpensesToCSV(expenses, user?.displayName);
  };

  const handleConfirmClear = async () => {
    try {
      setIsClearing(true);
      await clearAllExpenses();
      setConfirmClear(false);
    } finally {
      setIsClearing(false);
    }
  };

  const handleSwitchAccount = (email: string, name: string) => {
    const uid = 'usr_' + btoa(email).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
    switchAccount(uid, email, name);
    setSelectedDemoUser(email);
  };

  const themeOptions: { value: Theme; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Laptop },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Settings & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Manage your account profile, visual theme, and data storage
        </p>
      </div>

      {/* 1. Profile & Google Account */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-2xs space-y-4 sm:space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
              Google Account Profile
            </h3>
            <p className="text-xs text-zinc-400">
              Authenticated user details & security boundary
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-extrabold text-base flex items-center justify-center shrink-0 shadow-xs">
              {user?.displayName?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                  {user?.displayName || 'User'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email || 'user@example.com'}</span>
              </div>
              <div className="text-[10px] text-zinc-400 font-mono mt-1">
                UID: {user?.uid}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              signOut();
            }}
            className="min-h-[44px] w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* User Isolation Demonstration / Switch Account */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-500" />
            <span>Multi-User Account Isolation:</span>
          </label>
          <p className="text-xs text-zinc-400 mb-3">
            Every user's expenses belong strictly to that user UID. Switch accounts below to verify data isolation:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSwitchAccount('avinashdasireddy@gmail.com', 'Avinash Dasireddy')}
              className={`p-3.5 rounded-2xl border text-xs text-left transition-all active:scale-[0.98] ${
                selectedDemoUser === 'avinashdasireddy@gmail.com'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Avinash Dasireddy (Primary)</span>
                {selectedDemoUser === 'avinashdasireddy@gmail.com' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">avinashdasireddy@gmail.com</div>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchAccount('test.investor@spendtrack.io', 'Demo Tester')}
              className={`p-3.5 rounded-2xl border text-xs text-left transition-all active:scale-[0.98] ${
                selectedDemoUser === 'test.investor@spendtrack.io'
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                  : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="font-bold flex items-center justify-between">
                <span>Demo Tester (Isolated Account)</span>
                {selectedDemoUser === 'test.investor@spendtrack.io' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-0.5">test.investor@spendtrack.io</div>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Appearance / Theme */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Appearance & Dark Mode</span>
        </h3>
        <p className="text-xs text-zinc-400">
          Choose your interface preference. Your selection is persisted automatically.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <Icon className="w-5 h-5 mb-2" />
                <span>{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 mt-1" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Regional Preferences */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-2xs space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-emerald-500" />
          <span>Currency & Regional Timezone</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Active Currency
            </span>
            <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono flex items-center gap-1.5">
              <span>Indian Rupee (INR)</span>
              <span className="text-emerald-600 font-bold">₹</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              Formatted using the standard Indian numbering system (e.g. ₹1,25,000).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
              Timezone
            </span>
            <div className="text-base font-extrabold text-zinc-900 dark:text-white font-mono flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Asia/Kolkata (IST = UTC+5:30)</span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
              All day boundaries, yesterday calculations, and weekly totals strictly respect IST midnight.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Data Management & Backup */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
              Data Management & Backup
            </h3>
            <p className="text-xs text-zinc-400">
              Export data, load sample records for instant testing, or reset
            </p>
          </div>
        </div>

        {/* Database overview */}
        <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/80 text-xs">
          <div>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">User Record Total:</span>
            <span className="font-extrabold text-zinc-900 dark:text-white ml-2 font-mono">
              {txnCount} records (<AnimatedNumber value={totalSpent} />)
            </span>
          </div>

          <button
            type="button"
            onClick={handleExportAll}
            disabled={expenses.length === 0}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 flex items-center gap-1.5 disabled:opacity-40 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Load Sample Data Button */}
          <button
            type="button"
            onClick={async () => {
              await loadSampleData();
              onNavigateToDashboard();
            }}
            className="flex-1 py-3 px-4 rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold hover:bg-emerald-100 transition-colors text-center active:scale-95"
          >
            Load 5 Realistic Sample Expenses
          </button>

          {/* Clear Data Button */}
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmClear}
                disabled={isClearing}
                className="px-4 py-3 rounded-2xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 active:scale-95"
              >
                {isClearing ? 'Clearing...' : 'Confirm Clear'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-3.5 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold active:scale-95"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="py-3 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 text-xs font-bold hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Current Account Data</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

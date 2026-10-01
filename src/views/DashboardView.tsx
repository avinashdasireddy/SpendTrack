import React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  CalendarDays,
  CalendarRange,
  Calendar,
  Wallet,
  TrendingUp,
  Receipt,
  Award,
  ArrowRight,
  PlusCircle,
  PieChart,
} from 'lucide-react';
import { Expense } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import {
  getTodayTotal,
  getYesterdayTotal,
  getWeekTotal,
  getMonthTotal,
  getLifetimeTotal,
  getAverageTransaction,
  getLargestExpense,
  getTopCategory,
  getTransactionCount,
} from '../utils/calculations';
import { SummaryCard } from '../components/common/SummaryCard';
import { SpendingTrendChart } from '../components/charts/SpendingTrendChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { formatINR } from '../utils/currency';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { triggerHaptic } from '../utils/haptics';

interface DashboardViewProps {
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onSelectExpense?: (expense: Expense) => void;
  onOpenAddExpense: () => void;
  onNavigateToExpenses: () => void;
  onNavigateToReports: () => void;
}

export function DashboardView({
  onEditExpense,
  onDeleteExpense,
  onSelectExpense,
  onOpenAddExpense,
  onNavigateToExpenses,
  onNavigateToReports,
}: DashboardViewProps) {
  const { expenses } = useExpenses();

  const todayTotal = getTodayTotal(expenses);
  const yesterdayTotal = getYesterdayTotal(expenses);
  const weekTotal = getWeekTotal(expenses);
  const monthTotal = getMonthTotal(expenses);
  const lifetimeTotal = getLifetimeTotal(expenses);
  const avgTransaction = getAverageTransaction(expenses);
  const largest = getLargestExpense(expenses);
  const topCat = getTopCategory(expenses);
  const totalCount = getTransactionCount(expenses);

  // Today's count
  const todayCount = expenses.filter(
    (e) => e.date === new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
  ).length;

  // Today vs yesterday comparison
  let todaySubtitle = 'No spending yesterday';
  if (yesterdayTotal > 0) {
    const diff = todayTotal - yesterdayTotal;
    const diffPercent = Math.round((Math.abs(diff) / yesterdayTotal) * 100);
    todaySubtitle =
      diff > 0
        ? `+${formatINR(diff)} (${diffPercent}%) vs yesterday`
        : diff < 0
        ? `-${formatINR(Math.abs(diff))} (${diffPercent}%) vs yesterday`
        : 'Identical to yesterday';
  } else if (todayTotal > 0) {
    todaySubtitle = `${todayCount} ${todayCount === 1 ? 'transaction' : 'transactions'} today`;
  }

  // Recent 6 transactions
  const recentExpenses = expenses.slice(0, 6);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6 sm:space-y-7"
    >
      {/* 1. Hero Card: Today's Spending */}
      <motion.section variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Hero Today Card */}
          <div className="lg:col-span-6">
            <SummaryCard
              title="TODAY'S SPENDING"
              amount={todayTotal}
              subtitle={todaySubtitle}
              icon={CalendarDays}
              accentColor="#10B981"
              badgeText={todayTotal > 0 ? `${todayCount} txns today` : '₹0 Spent'}
              badgeType="success"
              isHero={true}
            />
          </div>

          {/* Quick 2-row Summary on Mobile / Side cards on Desktop */}
          <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* THIS WEEK */}
            <SummaryCard
              title="THIS WEEK"
              amount={weekTotal}
              subtitle="Mon - Sun"
              icon={CalendarRange}
              accentColor="#3B82F6"
            />

            {/* THIS MONTH */}
            <SummaryCard
              title="THIS MONTH"
              amount={monthTotal}
              subtitle="Current Month"
              icon={Calendar}
              accentColor="#8B5CF6"
            />

            {/* OVERALL */}
            <div className="col-span-2 sm:col-span-1">
              <SummaryCard
                title="LIFETIME"
                amount={lifetimeTotal}
                subtitle={`${totalCount} total txns`}
                icon={Wallet}
                accentColor="#F59E0B"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. Secondary Quick Metrics Row */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Largest expense */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Largest Expense
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white font-mono mt-0.5">
              <AnimatedNumber value={largest.amount} />
            </div>
            {largest.expense ? (
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[170px] block font-medium">
                {largest.expense.reason}
              </span>
            ) : (
              <span className="text-[11px] text-zinc-400">None yet</span>
            )}
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
        </div>

        {/* Average transaction */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Avg Transaction
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white font-mono mt-0.5">
              <AnimatedNumber value={avgTransaction} />
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Per recorded expense
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Top category */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 flex items-center justify-between shadow-2xs">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Top Category
            </span>
            <div className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white font-mono mt-0.5">
              <AnimatedNumber value={topCat ? topCat.amount : 0} />
            </div>
            {topCat ? (
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mt-1 block">
                {topCat.category}
              </span>
            ) : (
              <span className="text-[11px] text-zinc-400">None yet</span>
            )}
          </div>
          <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <PieChart className="w-5 h-5" />
          </div>
        </div>
      </motion.section>

      {/* 3. Charts Section: Trend + Category Donut */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Spending Trend (2 cols on large) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Spending Trend
              </h3>
            </div>
            <button
              type="button"
              onClick={onNavigateToReports}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 active:scale-95"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <SpendingTrendChart expenses={expenses} />
        </div>

        {/* Category Breakdown (1 col on large) */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 space-y-4 flex flex-col justify-between shadow-2xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <span>Category Breakdown</span>
              </h3>
            </div>
            <CategoryDonutChart expenses={expenses} />
          </div>
        </div>
      </motion.section>

      {/* 4. Recent Expenses Section */}
      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
              Recent Expenses
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Tap any item to view full details
            </p>
          </div>

          <div className="flex items-center gap-2">
            {expenses.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onNavigateToExpenses();
                }}
                className="min-h-[44px] text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors active:scale-95 cursor-pointer"
              >
                <span>View All ({expenses.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenAddExpense();
              }}
              className="sm:hidden min-h-[44px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 active:scale-95 shadow-xs cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add</span>
            </button>
          </div>
        </div>

        {/* Empty state or list */}
        {recentExpenses.length === 0 ? (
          <div className="p-8 sm:p-12 text-center rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 space-y-3.5 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Receipt className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">
              No expenses recorded yet.
            </h4>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Start by adding your first expense. Every rupee you record updates your dashboard and analytics in real time.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenAddExpense();
                }}
                className="min-h-[44px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 active:scale-95 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                <span>+ Record First Expense</span>
              </button>
            </div>
          </div>
        ) : (
          <ExpenseList
            expenses={recentExpenses}
            onEdit={onEditExpense}
            onDelete={onDeleteExpense}
            onSelect={onSelectExpense}
            groupByDate={false}
          />
        )}
      </motion.section>
    </motion.div>
  );
}

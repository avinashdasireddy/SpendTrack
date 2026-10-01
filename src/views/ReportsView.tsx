import React from 'react';
import { motion, type Variants } from 'motion/react';
import {
  TrendingUp,
  PieChart,
  BarChart2,
  CreditCard,
  CalendarDays,
  Calendar,
  Award,
  Wallet,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';
import {
  getLifetimeTotal,
  getAverageDailySpending,
  getAverageTransaction,
  getLargestExpense,
  getTransactionCount,
  getHighestSpendingDay,
  getFirstAndLatestExpense,
  getTopCategory,
} from '../utils/calculations';
import { formatINR } from '../utils/currency';
import { formatDisplayDate } from '../utils/date';
import { SpendingTrendChart } from '../components/charts/SpendingTrendChart';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { DailyBarChart } from '../components/charts/DailyBarChart';
import { PaymentMethodChart } from '../components/charts/PaymentMethodChart';
import { MonthlyComparisonChart } from '../components/charts/MonthlyComparisonChart';
import { CategoryBadge } from '../components/common/CategoryBadge';
import { AnimatedNumber } from '../components/common/AnimatedNumber';

export function ReportsView() {
  const { expenses } = useExpenses();

  const totalSpending = getLifetimeTotal(expenses);
  const avgDaily = getAverageDailySpending(expenses);
  const avgTransaction = getAverageTransaction(expenses);
  const largest = getLargestExpense(expenses);
  const totalTxns = getTransactionCount(expenses);
  const highestDay = getHighestSpendingDay(expenses);
  const { first, latest } = getFirstAndLatestExpense(expenses);
  const topCat = getTopCategory(expenses);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
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
      className="space-y-7 sm:space-y-8"
    >
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
          Analytics & Spending Reports
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
          Understand where your money goes and uncover deep spending habits
        </p>
      </div>

      {/* 5 Top Summary Metric Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. TOTAL SPENDING */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Total Spending
            </span>
            <Wallet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
            <AnimatedNumber value={totalSpending} />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Lifetime recorded</p>
        </div>

        {/* 2. AVERAGE DAILY */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Avg Daily
            </span>
            <CalendarDays className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
            <AnimatedNumber value={avgDaily} />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Per calendar day</p>
        </div>

        {/* 3. AVERAGE TRANSACTION */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Avg Transaction
            </span>
            <Receipt className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
            <AnimatedNumber value={avgTransaction} />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Per transaction</p>
        </div>

        {/* 4. LARGEST EXPENSE */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Largest Expense
            </span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
            <AnimatedNumber value={largest.amount} />
          </div>
          <p className="text-[10px] text-zinc-400 mt-1 truncate">
            {largest.expense?.reason || 'None yet'}
          </p>
        </div>

        {/* 5. TOTAL TRANSACTIONS */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">
              Transactions
            </span>
            <Sparkles className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white font-mono">
            {totalTxns}
          </div>
          <p className="text-[10px] text-zinc-400 mt-1">Total entries</p>
        </div>
      </motion.div>

      {/* Chart 1: Spending Trend with full period options */}
      <motion.section variants={itemVariants} className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              1. Spending Trend
            </h3>
            <p className="text-xs text-zinc-400">
              Interactive daily spending curves across flexible time horizons
            </p>
          </div>
        </div>

        <SpendingTrendChart expenses={expenses} />
      </motion.section>

      {/* Charts 2 & 3: Category Donut & Daily Bar */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Category Breakdown */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                2. Category Breakdown
              </h3>
              <p className="text-xs text-zinc-400">
                Where is your money going across categories?
              </p>
            </div>
          </div>

          <CategoryDonutChart expenses={expenses} />
        </div>

        {/* Daily Spending Bars */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                3. Daily Spending Breakdown
              </h3>
              <p className="text-xs text-zinc-400">
                Recent day-by-day bar comparison
              </p>
            </div>
          </div>

          <DailyBarChart expenses={expenses} days={14} />
        </div>
      </motion.section>

      {/* Charts 4 & 5: Payment Methods & Monthly Comparison */}
      <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* Payment Methods */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                4. Payment Method Distribution
              </h3>
              <p className="text-xs text-zinc-400">
                UPI vs Cash vs Cards vs Bank Transfer
              </p>
            </div>
          </div>

          <PaymentMethodChart expenses={expenses} />
        </div>

        {/* Monthly Comparison */}
        <div className="p-5 sm:p-6 rounded-[28px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 space-y-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                5. Month-over-Month Comparison
              </h3>
              <p className="text-xs text-zinc-400">
                Historical monthly comparisons throughout the year
              </p>
            </div>
          </div>

          <MonthlyComparisonChart expenses={expenses} />
        </div>
      </motion.section>

      {/* Key Insights Highlights Callout */}
      <motion.section variants={itemVariants} className="p-6 rounded-[28px] bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
        <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Lifetime Financial Snapshot</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-900/60">
            <span className="text-zinc-500 dark:text-zinc-400 block mb-1">Top Cost Driver</span>
            {topCat ? (
              <div className="flex items-center gap-2">
                <CategoryBadge category={topCat.category} size="sm" />
                <span className="font-extrabold text-zinc-900 dark:text-white font-mono">
                  {formatINR(topCat.amount)}
                </span>
              </div>
            ) : (
              <span className="text-zinc-400 font-medium">None yet</span>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-900/60">
            <span className="text-zinc-500 dark:text-zinc-400 block mb-1">Highest Single Day</span>
            {highestDay ? (
              <div>
                <span className="font-extrabold text-zinc-900 dark:text-white font-mono">
                  {formatINR(highestDay.amount)}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 ml-1.5 font-mono">
                  ({formatDisplayDate(highestDay.date)})
                </span>
              </div>
            ) : (
              <span className="text-zinc-400 font-medium">None yet</span>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-100 dark:border-emerald-900/60">
            <span className="text-zinc-500 dark:text-zinc-400 block mb-1">Tracking Span</span>
            {first && latest ? (
              <div className="font-mono text-zinc-800 dark:text-zinc-200 font-semibold">
                {formatDisplayDate(first.date)} → {formatDisplayDate(latest.date)}
              </div>
            ) : (
              <span className="text-zinc-400 font-medium">No recorded transactions</span>
            )}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

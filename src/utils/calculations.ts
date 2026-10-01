import { Expense, ExpenseCategory, PaymentMethod, CATEGORIES, PAYMENT_METHODS } from '../types';
import {
  getKolkataTodayString,
  getKolkataYesterdayString,
  getKolkataCurrentWeekRange,
  getKolkataCurrentMonthString,
  getKolkataCurrentYearString,
  getNowKolkata,
} from './date';

/**
 * Total amount spent today in Asia/Kolkata
 */
export function getTodayTotal(expenses: Expense[]): number {
  const todayStr = getKolkataTodayString();
  return expenses
    .filter((e) => e.date === todayStr)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Total amount spent yesterday in Asia/Kolkata
 */
export function getYesterdayTotal(expenses: Expense[]): number {
  const yesterdayStr = getKolkataYesterdayString();
  return expenses
    .filter((e) => e.date === yesterdayStr)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Total amount spent this current week in Asia/Kolkata (Monday - Sunday)
 */
export function getWeekTotal(expenses: Expense[]): number {
  const { start, end } = getKolkataCurrentWeekRange();
  return expenses
    .filter((e) => e.date >= start && e.date <= end)
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Total amount spent in a given month (defaults to current month: YYYY-MM)
 */
export function getMonthTotal(expenses: Expense[], monthStr?: string): number {
  const targetMonth = monthStr || getKolkataCurrentMonthString();
  return expenses
    .filter((e) => e.date.startsWith(targetMonth))
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Total amount spent in a given year (defaults to current year: YYYY)
 */
export function getYearTotal(expenses: Expense[], yearStr?: string): number {
  const targetYear = yearStr || getKolkataCurrentYearString();
  return expenses
    .filter((e) => e.date.startsWith(targetYear))
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Total lifetime / overall amount spent across all recorded expenses
 */
export function getLifetimeTotal(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Total count of transactions
 */
export function getTransactionCount(expenses: Expense[]): number {
  return expenses.length;
}

/**
 * Largest individual transaction amount
 */
export function getLargestExpense(expenses: Expense[]): { amount: number; expense?: Expense } {
  if (expenses.length === 0) return { amount: 0 };
  const sorted = [...expenses].sort((a, b) => b.amount - a.amount);
  return {
    amount: sorted[0].amount,
    expense: sorted[0],
  };
}

/**
 * Average transaction amount
 */
export function getAverageTransaction(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  const total = getLifetimeTotal(expenses);
  return Math.round((total / expenses.length) * 100) / 100;
}

/**
 * Average daily spending in the current month (or all active days)
 */
export function getAverageDailySpending(expenses: Expense[], monthStr?: string): number {
  const targetMonth = monthStr || getKolkataCurrentMonthString();
  const monthExpenses = expenses.filter((e) => e.date.startsWith(targetMonth));
  if (monthExpenses.length === 0) return 0;

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate days elapsed in the month so far
  const now = getNowKolkata();
  const currentMonth = getKolkataCurrentMonthString();
  let daysCount = 1;

  if (targetMonth === currentMonth) {
    daysCount = Math.max(1, now.getDate());
  } else {
    // Days in that full past month
    const [y, m] = targetMonth.split('-').map(Number);
    daysCount = new Date(y, m, 0).getDate();
  }

  return Math.round((total / daysCount) * 100) / 100;
}

/**
 * Total spending grouped by category
 */
export function getCategoryTotals(expenses: Expense[]): {
  category: ExpenseCategory;
  amount: number;
  percentage: number;
  count: number;
}[] {
  const total = getLifetimeTotal(expenses);
  const map: Record<string, { amount: number; count: number }> = {};

  CATEGORIES.forEach((cat) => {
    map[cat] = { amount: 0, count: 0 };
  });

  expenses.forEach((e) => {
    if (!map[e.category]) {
      map[e.category] = { amount: 0, count: 0 };
    }
    map[e.category].amount += e.amount;
    map[e.category].count += 1;
  });

  return CATEGORIES.map((cat) => {
    const amount = map[cat]?.amount || 0;
    const count = map[cat]?.count || 0;
    const percentage = total > 0 ? Math.round((amount / total) * 1000) / 10 : 0;
    return {
      category: cat,
      amount,
      percentage,
      count,
    };
  }).sort((a, b) => b.amount - a.amount);
}

/**
 * Top category by spending amount
 */
export function getTopCategory(expenses: Expense[]): { category: ExpenseCategory; amount: number } | null {
  const categories = getCategoryTotals(expenses);
  if (categories.length === 0 || categories[0].amount === 0) return null;
  return {
    category: categories[0].category,
    amount: categories[0].amount,
  };
}

/**
 * Total spending grouped by payment method
 */
export function getPaymentMethodTotals(expenses: Expense[]): {
  method: PaymentMethod;
  amount: number;
  percentage: number;
  count: number;
}[] {
  const total = getLifetimeTotal(expenses);
  const map: Record<string, { amount: number; count: number }> = {};

  PAYMENT_METHODS.forEach((pm) => {
    map[pm] = { amount: 0, count: 0 };
  });

  expenses.forEach((e) => {
    if (!map[e.paymentMethod]) {
      map[e.paymentMethod] = { amount: 0, count: 0 };
    }
    map[e.paymentMethod].amount += e.amount;
    map[e.paymentMethod].count += 1;
  });

  return PAYMENT_METHODS.map((pm) => {
    const amount = map[pm]?.amount || 0;
    const count = map[pm]?.count || 0;
    const percentage = total > 0 ? Math.round((amount / total) * 1000) / 10 : 0;
    return {
      method: pm,
      amount,
      percentage,
      count,
    };
  }).sort((a, b) => b.amount - a.amount);
}

/**
 * Finds the highest spending day in a given month
 */
export function getHighestSpendingDay(
  expenses: Expense[],
  monthStr?: string
): { date: string; amount: number; count: number } | null {
  const targetMonth = monthStr || getKolkataCurrentMonthString();
  const monthExpenses = expenses.filter((e) => e.date.startsWith(targetMonth));
  if (monthExpenses.length === 0) return null;

  const dayMap: Record<string, { amount: number; count: number }> = {};
  monthExpenses.forEach((e) => {
    if (!dayMap[e.date]) {
      dayMap[e.date] = { amount: 0, count: 0 };
    }
    dayMap[e.date].amount += e.amount;
    dayMap[e.date].count += 1;
  });

  let maxDate = '';
  let maxAmount = 0;
  let maxCount = 0;

  Object.entries(dayMap).forEach(([date, data]) => {
    if (data.amount > maxAmount) {
      maxAmount = data.amount;
      maxDate = date;
      maxCount = data.count;
    }
  });

  return maxDate ? { date: maxDate, amount: maxAmount, count: maxCount } : null;
}

/**
 * Returns first and latest recorded expense
 */
export function getFirstAndLatestExpense(expenses: Expense[]): {
  first?: Expense;
  latest?: Expense;
} {
  if (expenses.length === 0) return {};
  const sorted = [...expenses].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return (a.time || '').localeCompare(b.time || '');
  });
  return {
    first: sorted[0],
    latest: sorted[sorted.length - 1],
  };
}

/**
 * Daily spending trend for the last N days up to today
 */
export function getDailySpendingTrend(
  expenses: Expense[],
  daysCount: number = 30
): { date: string; label: string; amount: number; count: number }[] {
  const today = getNowKolkata();
  const result: { date: string; label: string; amount: number; count: number }[] = [];

  const dayExpenseMap: Record<string, { amount: number; count: number }> = {};
  expenses.forEach((e) => {
    if (!dayExpenseMap[e.date]) {
      dayExpenseMap[e.date] = { amount: 0, count: 0 };
    }
    dayExpenseMap[e.date].amount += e.amount;
    dayExpenseMap[e.date].count += 1;
  });

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const label = d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: daysCount > 14 ? 'numeric' : 'short',
    });

    result.push({
      date: dateStr,
      label,
      amount: dayExpenseMap[dateStr]?.amount || 0,
      count: dayExpenseMap[dateStr]?.count || 0,
    });
  }

  return result;
}

/**
 * Monthly comparison for the given year (or all 12 months)
 */
export function getMonthlyComparison(
  expenses: Expense[],
  yearStr?: string
): { monthKey: string; label: string; amount: number; count: number }[] {
  const targetYear = yearStr || getKolkataCurrentYearString();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return months.map((monthName, idx) => {
    const monthNum = String(idx + 1).padStart(2, '0');
    const monthKey = `${targetYear}-${monthNum}`;
    const monthExpenses = expenses.filter((e) => e.date.startsWith(monthKey));
    const amount = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      monthKey,
      label: monthName,
      amount,
      count: monthExpenses.length,
    };
  });
}

/**
 * Returns factual, non-speculative insights based strictly on recorded user expenses
 */
export function getFactualInsights(expenses: Expense[]): {
  id: string;
  title: string;
  description: string;
  icon: 'category' | 'trend' | 'calendar' | 'wallet' | 'payment';
}[] {
  if (expenses.length === 0) {
    return [
      {
        id: 'no_data',
        title: 'Ready to track',
        description: 'Start logging your daily expenses to unlock personalized spending insights.',
        icon: 'wallet',
      },
    ];
  }

  const insights: {
    id: string;
    title: string;
    description: string;
    icon: 'category' | 'trend' | 'calendar' | 'wallet' | 'payment';
  }[] = [];

  const currentMonth = getKolkataCurrentMonthString();
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const currentMonthTotal = currentMonthExpenses.reduce((s, e) => s + e.amount, 0);

  // 1. Top category this month
  if (currentMonthExpenses.length > 0) {
    const catTotals = getCategoryTotals(currentMonthExpenses);
    if (catTotals.length > 0 && catTotals[0].amount > 0) {
      const top = catTotals[0];
      insights.push({
        id: 'top_category_month',
        title: `${top.category} is your top category`,
        description: `You have spent ₹${top.amount.toLocaleString('en-IN')} on ${top.category} this month (${top.percentage}% of monthly spending).`,
        icon: 'category',
      });
    }
  }

  // 2. Average daily spending
  const avgDaily = getAverageDailySpending(expenses);
  if (avgDaily > 0) {
    insights.push({
      id: 'avg_daily_spending',
      title: 'Daily Spending Pace',
      description: `Your average daily spending this month is ₹${avgDaily.toLocaleString('en-IN')}.`,
      icon: 'trend',
    });
  }

  // 3. Highest spending single day
  const highestDay = getHighestSpendingDay(expenses);
  if (highestDay) {
    insights.push({
      id: 'highest_day',
      title: 'Highest Spending Day',
      description: `Your highest recorded day was ${highestDay.date} with ₹${highestDay.amount.toLocaleString('en-IN')} across ${highestDay.count} transactions.`,
      icon: 'calendar',
    });
  }

  // 4. Most preferred payment method
  const pmTotals = getPaymentMethodTotals(expenses);
  if (pmTotals.length > 0 && pmTotals[0].amount > 0) {
    const topPm = pmTotals[0];
    insights.push({
      id: 'top_payment_method',
      title: `${topPm.method} Preferred`,
      description: `${topPm.method} accounts for ${topPm.percentage}% of all your recorded transactions (₹${topPm.amount.toLocaleString('en-IN')}).`,
      icon: 'payment',
    });
  }

  // 5. Total transaction volume
  const totalCount = expenses.length;
  const lifetimeTotal = getLifetimeTotal(expenses);
  insights.push({
    id: 'lifetime_volume',
    title: 'Total Financial Footprint',
    description: `You have logged ${totalCount} transactions totaling ₹${lifetimeTotal.toLocaleString('en-IN')}.`,
    icon: 'wallet',
  });

  return insights;
}

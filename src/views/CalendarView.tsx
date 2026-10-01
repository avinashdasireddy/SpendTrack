import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import { Expense } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import {
  getNowKolkata,
  getKolkataDateString,
  formatFullDate,
  formatMonthName,
} from '../utils/date';
import { formatINR } from '../utils/currency';
import { ExpenseItem } from '../components/expenses/ExpenseItem';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { triggerHaptic } from '../utils/haptics';

interface CalendarViewProps {
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onSelectExpense?: (expense: Expense) => void;
  onOpenAddExpense: () => void;
}

export function CalendarView({
  onEditExpense,
  onDeleteExpense,
  onSelectExpense,
  onOpenAddExpense,
}: CalendarViewProps) {
  const { expenses } = useExpenses();

  const now = getNowKolkata();
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(getKolkataDateString());

  // Aggregate expenses by date map
  const expensesByDate = useMemo(() => {
    const map = new Map<string, { total: number; count: number; items: Expense[] }>();
    expenses.forEach((e) => {
      const existing = map.get(e.date) || { total: 0, count: 0, items: [] };
      existing.total += e.amount;
      existing.count += 1;
      existing.items.push(e);
      map.set(e.date, existing);
    });
    return map;
  }, [expenses]);

  // Calendar cells matrix
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Monday as day 1 in India (Sun = 0)
    let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInMonth = lastDayOfMonth.getDate();

    const cells: {
      dayNumber: number;
      dateStr: string;
      isCurrentMonth: boolean;
      total: number;
      count: number;
    }[] = [];

    // Previous month padding
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = prevMonthLastDate - i;
      const prevMonthIdx = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(prevDate).padStart(2, '0')}`;
      const data = expensesByDate.get(dateStr);

      cells.push({
        dayNumber: prevDate,
        dateStr,
        isCurrentMonth: false,
        total: data?.total || 0,
        count: data?.count || 0,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const data = expensesByDate.get(dateStr);

      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        total: data?.total || 0,
        count: data?.count || 0,
      });
    }

    // Next month padding to fill grid
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remaining = totalSlots - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonthIdx = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const data = expensesByDate.get(dateStr);

      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: false,
        total: data?.total || 0,
        count: data?.count || 0,
      });
    }

    return cells;
  }, [currentYear, currentMonth, expensesByDate]);

  // Selected date details
  const selectedDayData = expensesByDate.get(selectedDate);
  const selectedExpenses = selectedDayData?.items || [];
  const selectedDayTotal = selectedDayData?.total || 0;

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleJumpToToday = () => {
    const today = getNowKolkata();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(getKolkataDateString());
  };

  const currentYearMonthKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
  const monthTotal = expenses
    .filter((e) => e.date.startsWith(currentYearMonthKey))
    .reduce((sum, e) => sum + e.amount, 0);

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span>Spending Calendar</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Browse expenses day by day and observe daily spending patterns
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={handleJumpToToday}
            className="px-3.5 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors active:scale-95 shadow-2xs"
          >
            Today
          </button>

          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors active:scale-90"
              title="Previous Month"
              aria-label="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2.5 text-xs sm:text-sm font-bold text-zinc-900 dark:text-white min-w-[120px] text-center font-mono">
              {formatMonthName(currentYearMonthKey)}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors active:scale-90"
              title="Next Month"
              aria-label="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Month Total Banner with AnimatedNumber */}
      <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
          Total in <strong className="text-zinc-800 dark:text-zinc-200">{formatMonthName(currentYearMonthKey)}</strong>:
        </span>
        <span className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white font-mono">
          <AnimatedNumber value={monthTotal} />
        </span>
      </div>

      {/* Two Column Layout: Calendar on Left, Selected Day Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-[28px] p-3.5 sm:p-6 shadow-2xs">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2 text-center text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            {weekdays.map((wd) => (
              <div key={wd} className="py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {calendarDays.map((cell) => {
              const isSelected = cell.dateStr === selectedDate;
              const hasExpenses = cell.total > 0;
              const isToday = cell.dateStr === getKolkataDateString();

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSelectedDate(cell.dateStr);
                  }}
                  className={`min-h-[58px] sm:min-h-[74px] p-1.5 sm:p-2 rounded-2xl flex flex-col justify-between items-start text-left transition-all border active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20 shadow-xs'
                      : hasExpenses
                      ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                      : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/20'
                  } ${!cell.isCurrentMonth ? 'opacity-30' : 'opacity-100'}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center font-mono ${
                        isToday
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                          : isSelected
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {hasExpenses && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    )}
                  </div>

                  {hasExpenses && (
                    <div className="w-full mt-1">
                      <div className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white font-mono truncate">
                        {formatINR(cell.total)}
                      </div>
                      <div className="text-[9px] text-zinc-400 font-mono hidden sm:block">
                        {cell.count} {cell.count === 1 ? 'txn' : 'txns'}
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-[28px] p-5 sm:p-6 shadow-2xs flex flex-col">
          {/* Header of selected day */}
          <div className="flex items-start justify-between pb-3.5 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Selected Day
              </span>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                {formatFullDate(selectedDate)}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onOpenAddExpense();
              }}
              className="w-10 h-10 min-w-[44px] min-h-[44px] rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center active:scale-90 cursor-pointer"
              title="Add expense for this day"
              aria-label="Add expense for this day"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Selected day summary cards */}
          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">
                Total Spent
              </span>
              <div className="text-lg font-extrabold text-zinc-900 dark:text-white font-mono tabular-nums mt-0.5">
                <AnimatedNumber value={selectedDayTotal} />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
              <span className="text-[10px] uppercase text-zinc-400 font-bold tracking-wider">
                Transactions
              </span>
              <div className="text-lg font-extrabold text-zinc-900 dark:text-white font-mono tabular-nums mt-0.5">
                {selectedExpenses.length}
              </div>
            </div>
          </div>

          {/* List of items on this day */}
          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {selectedExpenses.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <p className="font-medium">No expenses recorded for this day.</p>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    onOpenAddExpense();
                  }}
                  className="min-h-[44px] inline-flex items-center justify-center mt-2 px-4 py-2 text-emerald-600 dark:text-emerald-400 font-bold hover:underline active:scale-95 cursor-pointer"
                >
                  + Add Expense on {selectedDate}
                </button>
              </div>
            ) : (
              selectedExpenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onEdit={onEditExpense}
                  onDelete={onDeleteExpense}
                  onSelect={onSelectExpense}
                  compact={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

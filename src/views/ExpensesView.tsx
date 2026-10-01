import React, { useState, useMemo } from 'react';
import { Download, PlusCircle, LayoutList, Table as TableIcon } from 'lucide-react';
import { Expense } from '../types';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { ExpenseFilters, FilterState } from '../components/expenses/ExpenseFilters';
import { ExpenseList } from '../components/expenses/ExpenseList';
import { ExpenseTable } from '../components/expenses/ExpenseTable';
import { exportExpensesToCSV } from '../utils/exportCsv';
import {
  getKolkataTodayString,
  getKolkataYesterdayString,
  getKolkataCurrentWeekRange,
  getKolkataCurrentMonthString,
} from '../utils/date';
import { formatINR } from '../utils/currency';
import { AnimatedNumber } from '../components/common/AnimatedNumber';
import { triggerHaptic } from '../utils/haptics';

interface ExpensesViewProps {
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expense: Expense) => void;
  onSelectExpense?: (expense: Expense) => void;
  onOpenAddExpense: () => void;
}

export function ExpensesView({
  onEditExpense,
  onDeleteExpense,
  onSelectExpense,
  onOpenAddExpense,
}: ExpensesViewProps) {
  const { expenses } = useExpenses();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  const initialFilters: FilterState = {
    searchQuery: '',
    category: 'ALL',
    paymentMethod: 'ALL',
    dateRangePreset: 'ALL',
    sortBy: 'date_desc',
  };

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Apply filters and sorting
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.reason.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.paymentMethod.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    // 2. Category
    if (filters.category !== 'ALL') {
      result = result.filter((e) => e.category === filters.category);
    }

    // 3. Payment Method
    if (filters.paymentMethod !== 'ALL') {
      result = result.filter((e) => e.paymentMethod === filters.paymentMethod);
    }

    // 4. Date Presets
    if (filters.dateRangePreset === 'TODAY') {
      const today = getKolkataTodayString();
      result = result.filter((e) => e.date === today);
    } else if (filters.dateRangePreset === 'YESTERDAY') {
      const yesterday = getKolkataYesterdayString();
      result = result.filter((e) => e.date === yesterday);
    } else if (filters.dateRangePreset === 'THIS_WEEK') {
      const { start, end } = getKolkataCurrentWeekRange();
      result = result.filter((e) => e.date >= start && e.date <= end);
    } else if (filters.dateRangePreset === 'THIS_MONTH') {
      const month = getKolkataCurrentMonthString();
      result = result.filter((e) => e.date.startsWith(month));
    } else if (filters.dateRangePreset === 'CUSTOM') {
      if (filters.startDate) {
        result = result.filter((e) => e.date >= filters.startDate!);
      }
      if (filters.endDate) {
        result = result.filter((e) => e.date <= filters.endDate!);
      }
    }

    // 5. Amount Range
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      if (!isNaN(min)) {
        result = result.filter((e) => e.amount >= min);
      }
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      if (!isNaN(max)) {
        result = result.filter((e) => e.amount <= max);
      }
    }

    // 6. Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date_asc': {
          const comp = a.date.localeCompare(b.date);
          return comp !== 0 ? comp : (a.time || '').localeCompare(b.time || '');
        }
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'date_desc':
        default: {
          const comp = b.date.localeCompare(a.date);
          return comp !== 0 ? comp : (b.time || '').localeCompare(a.time || '');
        }
      }
    });

    return result;
  }, [expenses, filters]);

  const totalFilteredAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const handleExportCSV = () => {
    exportExpensesToCSV(filteredExpenses, user?.displayName);
  };

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Expense History
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Search, filter, and review all recorded transactions
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto w-full sm:w-auto">
          {/* View mode toggle (hidden on mobile) */}
          <div className="hidden sm:inline-flex rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Grouped List View"
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-xl transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Export CSV button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              handleExportCSV();
            }}
            disabled={filteredExpenses.length === 0}
            className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          {/* Add Expense button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenAddExpense();
            }}
            className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <ExpenseFilters
        filters={filters}
        onChange={setFilters}
        onReset={handleResetFilters}
        totalMatches={filteredExpenses.length}
      />

      {/* Sum banner for filtered records with animated number */}
      {filteredExpenses.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-2xs text-xs">
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">
            Total for current selection:
          </span>
          <span className="font-extrabold text-zinc-900 dark:text-white font-mono text-sm sm:text-base">
            <AnimatedNumber value={totalFilteredAmount} />
          </span>
        </div>
      )}

      {/* Expense List or Table */}
      {viewMode === 'table' ? (
        <div className="hidden sm:block">
          <ExpenseTable
            expenses={filteredExpenses}
            onEdit={onEditExpense}
            onDelete={onDeleteExpense}
          />
        </div>
      ) : null}

      {/* Fallback to grouped list on mobile or if list mode selected */}
      <div className={viewMode === 'table' ? 'sm:hidden' : 'block'}>
        <ExpenseList
          expenses={filteredExpenses}
          onEdit={onEditExpense}
          onDelete={onDeleteExpense}
          onSelect={onSelectExpense}
          emptyMessage={
            expenses.length === 0
              ? 'No expenses recorded yet. Tap "+ Add Expense" to begin.'
              : 'No expenses match your search or filter criteria.'
          }
          groupByDate={filters.sortBy === 'date_desc'}
        />
      </div>
    </div>
  );
}

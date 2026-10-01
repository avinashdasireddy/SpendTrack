import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Expense } from '../../types';
import { ExpenseItem } from './ExpenseItem';
import { formatDisplayDate } from '../../utils/date';
import { formatINR } from '../../utils/currency';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onSelect?: (expense: Expense) => void;
  emptyMessage?: string;
  groupByDate?: boolean;
}

export function ExpenseList({
  expenses,
  onEdit,
  onDelete,
  onSelect,
  emptyMessage = 'No expenses found.',
  groupByDate = true,
}: ExpenseListProps) {
  // Group expenses by date
  const grouped = useMemo(() => {
    if (!groupByDate) return null;

    const map = new Map<string, Expense[]>();
    expenses.forEach((e) => {
      const list = map.get(e.date) || [];
      list.push(e);
      map.set(e.date, list);
    });

    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));
    return sortedDates.map((date) => {
      const items = map.get(date) || [];
      const dayTotal = items.reduce((sum, item) => sum + item.amount, 0);
      return { date, items, dayTotal };
    });
  }, [expenses, groupByDate]);

  if (expenses.length === 0) {
    return (
      <div className="py-12 px-4 text-center rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/40 border border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{emptyMessage}</p>
      </div>
    );
  }

  if (!groupByDate || !grouped) {
    return (
      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {expenses.map((expense) => (
            <motion.div
              key={expense.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <ExpenseItem
                expense={expense}
                onEdit={onEdit}
                onDelete={onDelete}
                onSelect={onSelect}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {grouped.map(({ date, items, dayTotal }) => (
        <div key={date} className="space-y-2.5">
          {/* Date group header */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {formatDisplayDate(date)}
            </span>
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 font-mono">
              Day Total: {formatINR(dayTotal)}
            </span>
          </div>

          {/* Group items */}
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {items.map((expense) => (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExpenseItem
                    expense={expense}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSelect={onSelect}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}

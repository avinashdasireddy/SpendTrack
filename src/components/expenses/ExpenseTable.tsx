import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Expense } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate, formatDisplayTime } from '../../utils/date';
import { CategoryBadge, PaymentMethodBadge } from '../common/CategoryBadge';
import { triggerHaptic } from '../../utils/haptics';

interface ExpenseTableProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseTable({
  expenses,
  onEdit,
  onDelete,
}: ExpenseTableProps) {
  if (expenses.length === 0) {
    return (
      <div className="py-12 px-4 text-center rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-dashed border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
        No expense records found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <th className="py-3.5 px-4">Category</th>
            <th className="py-3.5 px-4">Reason / Notes</th>
            <th className="py-3.5 px-4">Payment</th>
            <th className="py-3.5 px-4">Date & Time</th>
            <th className="py-3.5 px-4 text-right">Amount</th>
            <th className="py-3.5 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {expenses.map((expense) => (
            <tr
              key={expense.id}
              className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors group"
            >
              <td className="py-3.5 px-4 whitespace-nowrap">
                <CategoryBadge category={expense.category} size="sm" />
              </td>

              <td className="py-3.5 px-4 max-w-xs">
                <div className="font-semibold text-zinc-900 dark:text-white truncate">
                  {expense.reason}
                </div>
                {expense.notes && (
                  <div className="text-[11px] text-zinc-400 truncate italic">
                    {expense.notes}
                  </div>
                )}
              </td>

              <td className="py-3.5 px-4 whitespace-nowrap">
                <PaymentMethodBadge method={expense.paymentMethod} size="sm" />
              </td>

              <td className="py-3.5 px-4 whitespace-nowrap font-mono text-zinc-600 dark:text-zinc-400">
                <span>{formatDisplayDate(expense.date)}</span>
                {expense.time && (
                  <span className="text-[11px] text-zinc-400 ml-1.5">
                    {formatDisplayTime(expense.time)}
                  </span>
                )}
              </td>

              <td className="py-3.5 px-4 text-right font-mono tabular-nums whitespace-nowrap">
                <span className="font-bold text-zinc-900 dark:text-white text-sm">
                  {formatINR(expense.amount)}
                </span>
              </td>

              <td className="py-3.5 px-4 text-center whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      onEdit(expense);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      onDelete(expense);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

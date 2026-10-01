import React from 'react';
import { Edit2, Trash2, ChevronRight } from 'lucide-react';
import { Expense } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate, formatDisplayTime } from '../../utils/date';
import { CategoryIcon } from '../common/CategoryBadge';
import { CATEGORY_COLORS } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface ExpenseItemProps {
  expense: Expense;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
  onSelect?: (expense: Expense) => void;
  compact?: boolean;
}

export function ExpenseItem({
  expense,
  onEdit,
  onDelete,
  onSelect,
  compact = false,
}: ExpenseItemProps) {
  const catColor = CATEGORY_COLORS[expense.category] || '#10B981';

  const handleRowClick = () => {
    triggerHaptic('light');
    if (onSelect) {
      onSelect(expense);
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-[0.985] cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Category Icon Square with gentle tint */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200 shadow-2xs"
          style={{
            backgroundColor: `${catColor}18`,
            color: catColor,
          }}
        >
          <CategoryIcon category={expense.category} className="w-5 h-5" />
        </div>

        {/* Text information */}
        <div className="min-w-0 flex-1 pr-2">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate tracking-tight">
            {expense.reason}
          </h4>

          {/* Zero-Pill Metadata Discipline: Clean unboxed text with subtle typographic separators */}
          <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{expense.category}</span>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">·</span>
            <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-400">{expense.paymentMethod}</span>
            <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">·</span>
            <span className="text-[11px] font-mono text-zinc-400">
              {formatDisplayDate(expense.date)}
              {expense.time ? ` at ${formatDisplayTime(expense.time)}` : ''}
            </span>
          </div>

          {expense.notes && !compact && (
            <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500 line-clamp-1 italic">
              "{expense.notes}"
            </p>
          )}
        </div>
      </div>

      {/* Right side: Amount and Action buttons */}
      <div className="flex items-center gap-2 shrink-0 ml-2">
        <div className="text-right">
          <div className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white font-mono tabular-nums tracking-tight">
            {formatINR(expense.amount)}
          </div>
        </div>

        {/* Quick Edit/Delete buttons (Touch-friendly 44x44px hitbox) */}
        <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('light');
              onEdit(expense);
            }}
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center active:scale-90"
            title="Edit Expense"
            aria-label="Edit Expense"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerHaptic('medium');
              onDelete(expense);
            }}
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center justify-center active:scale-90"
            title="Delete Expense"
            aria-label="Delete Expense"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 hidden sm:block ml-0.5" />
        </div>
      </div>
    </div>
  );
}

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Edit2, Trash2, Calendar, Clock, CreditCard, FileText } from 'lucide-react';
import { Expense } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatFullDate, formatDisplayTime } from '../../utils/date';
import { CategoryIcon } from '../common/CategoryBadge';
import { CATEGORY_COLORS } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

interface ExpenseDetailSheetProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (expense: Expense) => void;
  onDelete: (expense: Expense) => void;
}

export function ExpenseDetailSheet({
  expense,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ExpenseDetailSheetProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!expense) return null;

  const catColor = CATEGORY_COLORS[expense.category] || '#10B981';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop with iOS blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet / Dialog */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle on mobile */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* Header with close button */}
            <div className="flex items-center justify-between px-6 pt-3 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Transaction Details
              </span>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                }}
                className="w-9 h-9 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hero Amount & Category Banner */}
            <div className="px-6 py-5 text-center flex flex-col items-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-xs"
                style={{
                  backgroundColor: `${catColor}20`,
                  color: catColor,
                }}
              >
                <CategoryIcon category={expense.category} className="w-7 h-7" />
              </div>

              <div className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white font-mono tabular-nums tracking-tight">
                {formatINR(expense.amount)}
              </div>

              <h3 className="mt-1 text-base font-semibold text-zinc-800 dark:text-zinc-200 max-w-sm tracking-tight">
                {expense.reason}
              </h3>

              {/* Zero-Pill Metadata Discipline: Clean unboxed text */}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{expense.category}</span>
                <span aria-hidden="true" className="text-zinc-300 dark:text-zinc-600">·</span>
                <span className="font-mono text-zinc-600 dark:text-zinc-400">{expense.paymentMethod}</span>
              </div>
            </div>

            {/* Details Table Rows */}
            <div className="px-6 py-2 space-y-3 flex-1 overflow-y-auto">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800/80 space-y-3 text-xs">
                {/* Payment Method */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-zinc-400 font-medium">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Payment Method</span>
                  </span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200">
                    {expense.paymentMethod}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-700/50 pt-2.5">
                  <span className="flex items-center gap-2 text-zinc-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Date</span>
                  </span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-200 font-mono">
                    {formatFullDate(expense.date)}
                  </span>
                </div>

                {/* Time */}
                {expense.time && (
                  <div className="flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-700/50 pt-2.5">
                    <span className="flex items-center gap-2 text-zinc-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Time (IST)</span>
                    </span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200 font-mono">
                      {formatDisplayTime(expense.time)}
                    </span>
                  </div>
                )}

                {/* Optional Notes */}
                {expense.notes && (
                  <div className="border-t border-zinc-200/50 dark:border-zinc-700/50 pt-2.5">
                    <span className="flex items-center gap-2 text-zinc-400 mb-1 font-medium">
                      <FileText className="w-3.5 h-3.5" />
                      <span>Notes</span>
                    </span>
                    <p className="text-zinc-700 dark:text-zinc-300 italic pl-5">
                      "{expense.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar (Edit & Delete) with safe area bottom and 44px min hitboxes */}
            <div className="p-5 sm:p-6 pt-3 pb-safe border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  onClose();
                  onDelete(expense);
                }}
                className="min-h-[44px] flex-1 py-2.5 px-4 rounded-2xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  onClose();
                  onEdit(expense);
                }}
                className="min-h-[44px] flex-1 py-2.5 px-4 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-semibold shadow-xs hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Expense</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

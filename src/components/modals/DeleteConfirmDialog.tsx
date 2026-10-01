import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Expense } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';
import { CategoryBadge } from '../common/CategoryBadge';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  expense: Expense | null;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  expense,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  if (!expense) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden p-6 pb-safe"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle for mobile */}
            <div className="sm:hidden pt-1 pb-3 flex justify-center">
              <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Delete this expense?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  This transaction will be permanently removed and totals updated.
                </p>
              </div>
            </div>

            {/* Expense snapshot card */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2.5 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Reason</span>
                <span className="text-xs font-semibold text-zinc-900 dark:text-white max-w-[200px] truncate text-right">
                  {expense.reason}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Amount</span>
                <span className="text-lg font-extrabold text-red-600 dark:text-red-400 font-mono">
                  {formatINR(expense.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Date</span>
                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-mono">
                  {formatDisplayDate(expense.date)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-zinc-400 font-medium">Category</span>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200">{expense.category}</span>
              </div>
            </div>

            {/* Action buttons with min 44px touch height */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isDeleting}
                className="min-h-[44px] flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-colors border border-zinc-200 dark:border-zinc-700 active:scale-95 text-center flex items-center justify-center cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isDeleting}
                className="min-h-[44px] flex-1 sm:flex-initial px-6 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

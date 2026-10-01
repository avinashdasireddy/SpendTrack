import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useExpenses } from '../../context/ExpenseContext';
import { triggerHaptic } from '../../utils/haptics';

export function ToastContainer() {
  const { toasts, removeToast } = useExpenses();

  return (
    <div className="fixed top-4 sm:top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 max-w-sm w-[92%] sm:w-full pointer-events-none pt-safe">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            success: CheckCircle2,
            error: AlertCircle,
            info: Info,
          };
          const colors = {
            success: 'bg-emerald-950/95 text-emerald-200 border-emerald-800/80 shadow-emerald-950/30',
            error: 'bg-red-950/95 text-red-200 border-red-800/80 shadow-red-950/30',
            info: 'bg-zinc-900/95 text-zinc-100 border-zinc-700/80 shadow-zinc-950/30',
          };

          const Icon = icons[toast.type];

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-xl transition-all text-xs font-semibold ${colors[toast.type]}`}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <Icon className="w-4 h-4 shrink-0 text-emerald-400" />
                <span className="truncate">{toast.message}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="min-h-[36px] px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-[11px] uppercase tracking-wider transition-colors active:scale-90 cursor-pointer shadow-xs"
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="w-8 h-8 rounded-xl hover:bg-white/10 transition-colors shrink-0 flex items-center justify-center active:scale-90 text-zinc-400 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

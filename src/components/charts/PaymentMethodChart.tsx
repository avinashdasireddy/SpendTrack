import React from 'react';
import { Expense } from '../../types';
import { getPaymentMethodTotals } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';
import { PAYMENT_ICONS } from '../common/CategoryBadge';

interface PaymentMethodChartProps {
  expenses: Expense[];
}

export function PaymentMethodChart({ expenses }: PaymentMethodChartProps) {
  const paymentTotals = getPaymentMethodTotals(expenses).filter((p) => p.amount > 0);
  const total = paymentTotals.reduce((sum, p) => sum + p.amount, 0);

  if (paymentTotals.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
        No payment data recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {paymentTotals.map((item) => {
        const Icon = PAYMENT_ICONS[item.method];

        return (
          <div key={item.method} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {item.method}
                </span>
                <span className="text-[10px] text-zinc-400">
                  ({item.count} {item.count === 1 ? 'txn' : 'txns'})
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono">
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {formatINR(item.amount)}
                </span>
                <span className="text-[11px] text-zinc-400 w-10 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>

            {/* Progress track */}
            <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-900 dark:bg-zinc-200 transition-all duration-300"
                style={{ width: `${(item.amount / total) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

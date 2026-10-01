import React, { useState } from 'react';
import { Expense } from '../../types';
import { getDailySpendingTrend } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';

import { triggerHaptic } from '../../utils/haptics';

interface DailyBarChartProps {
  expenses: Expense[];
  days?: number;
}

export function DailyBarChart({ expenses, days = 14 }: DailyBarChartProps) {
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    label: string;
    amount: number;
    count: number;
  } | null>(null);

  const data = getDailySpendingTrend(expenses, days);
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="space-y-3">
      {/* Bars container */}
      <div className="relative h-44 flex items-end justify-between gap-1 sm:gap-2 px-1 pt-6 pb-2 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
        {data.map((item) => {
          const heightPercent = item.amount > 0 ? Math.max(8, (item.amount / maxAmount) * 100) : 4;
          const isHovered = hoveredDay?.date === item.date;

          return (
            <div
              key={item.date}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredDay(item)}
              onMouseLeave={() => setHoveredDay(null)}
              onClick={() => {
                triggerHaptic('light');
                setHoveredDay((curr) => (curr?.date === item.date ? null : item));
              }}
            >
              {/* Bar */}
              <div
                className={`w-full rounded-t-lg transition-all duration-200 ${
                  item.amount > 0
                    ? isHovered
                      ? 'bg-emerald-500 ring-2 ring-emerald-400'
                      : 'bg-emerald-600/80 hover:bg-emerald-500'
                    : 'bg-zinc-200 dark:bg-zinc-800'
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              {/* Label */}
              <span className="text-[10px] text-zinc-400 mt-2 truncate w-full text-center font-mono">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail beneath or on hover */}
      <div className="h-6 flex items-center justify-between text-xs px-1">
        {hoveredDay ? (
          <>
            <span className="text-zinc-500 dark:text-zinc-400">
              {formatDisplayDate(hoveredDay.date)}:
            </span>
            <span className="font-bold text-zinc-900 dark:text-white font-mono tabular-nums">
              {formatINR(hoveredDay.amount)}{' '}
              <span className="font-normal text-zinc-400">({hoveredDay.count} transactions)</span>
            </span>
          </>
        ) : (
          <span className="text-zinc-400 text-[11px]">Tap or hover any bar to view day total</span>
        )}
      </div>
    </div>
  );
}

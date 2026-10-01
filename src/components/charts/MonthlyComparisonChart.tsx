import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense } from '../../types';
import { getMonthlyComparison } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';
import { getKolkataCurrentYearString } from '../../utils/date';

interface MonthlyComparisonChartProps {
  expenses: Expense[];
}

export function MonthlyComparisonChart({ expenses }: MonthlyComparisonChartProps) {
  const currentYear = Number(getKolkataCurrentYearString());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [hoveredMonth, setHoveredMonth] = useState<{
    label: string;
    amount: number;
    count: number;
  } | null>(null);

  const monthsData = getMonthlyComparison(expenses, String(selectedYear));
  const maxAmount = Math.max(...monthsData.map((m) => m.amount), 1);
  const yearTotal = monthsData.reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="space-y-4">
      {/* Year navigation & annual total */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Total in {selectedYear}:</span>
          <span className="ml-2 text-sm font-bold text-zinc-900 dark:text-white font-mono">
            {formatINR(yearTotal)}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 border border-zinc-200/80 dark:border-zinc-700/80">
          <button
            type="button"
            onClick={() => setSelectedYear((y) => y - 1)}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Previous Year"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
            {selectedYear}
          </span>
          <button
            type="button"
            onClick={() => setSelectedYear((y) => y + 1)}
            disabled={selectedYear >= currentYear + 1}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors disabled:opacity-30"
            title="Next Year"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Bars */}
      <div className="relative h-48 flex items-end justify-between gap-1.5 sm:gap-2 px-2 pt-6 pb-2 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60">
        {monthsData.map((m) => {
          const heightPercent = m.amount > 0 ? Math.max(8, (m.amount / maxAmount) * 100) : 4;
          const isHovered = hoveredMonth?.label === m.label;

          return (
            <div
              key={m.monthKey}
              className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
              onMouseEnter={() => setHoveredMonth({ label: m.label, amount: m.amount, count: m.count })}
              onMouseLeave={() => setHoveredMonth(null)}
            >
              <div
                className={`w-full rounded-t-lg transition-all duration-200 ${
                  m.amount > 0
                    ? isHovered
                      ? 'bg-blue-500 ring-2 ring-blue-400'
                      : 'bg-blue-600/80 hover:bg-blue-500'
                    : 'bg-zinc-200 dark:bg-zinc-800'
                }`}
                style={{ height: `${heightPercent}%` }}
              />

              <span className="text-[10px] text-zinc-400 mt-2 truncate w-full text-center font-mono">
                {m.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detail beneath or on hover */}
      <div className="h-6 flex items-center justify-between text-xs px-1">
        {hoveredMonth ? (
          <>
            <span className="text-zinc-500 dark:text-zinc-400">
              {hoveredMonth.label} {selectedYear}:
            </span>
            <span className="font-bold text-zinc-900 dark:text-white font-mono">
              {formatINR(hoveredMonth.amount)}{' '}
              <span className="font-normal text-zinc-400">
                ({hoveredMonth.count} {hoveredMonth.count === 1 ? 'transaction' : 'transactions'})
              </span>
            </span>
          </>
        ) : (
          <span className="text-zinc-400 text-[11px]">Hover over any month to see total spent</span>
        )}
      </div>
    </div>
  );
}

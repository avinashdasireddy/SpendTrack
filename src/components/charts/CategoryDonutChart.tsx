import React, { useState } from 'react';
import { Expense } from '../../types';
import { getCategoryTotals } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';
import { CATEGORY_COLORS } from '../../types';
import { CategoryIcon } from '../common/CategoryBadge';
import { triggerHaptic } from '../../utils/haptics';

interface CategoryDonutChartProps {
  expenses: Expense[];
}

export function CategoryDonutChart({ expenses }: CategoryDonutChartProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  const categories = getCategoryTotals(expenses).filter((c) => c.amount > 0);
  const totalAmount = categories.reduce((sum, c) => sum + c.amount, 0);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-dashed border-zinc-200 dark:border-zinc-800">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          No category data to display yet. Record an expense to see breakdown!
        </p>
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 200;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut SVG */}
      <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          {/* Base track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-100 dark:text-zinc-800"
          />

          {categories.map((cat) => {
            const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
            accumulatedPercent += cat.percentage;

            const isHovered = hoveredCategory === cat.category;
            const color = CATEGORY_COLORS[cat.category];

            return (
              <circle
                key={cat.category}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredCategory(cat.category)}
                onMouseLeave={() => setHoveredCategory(null)}
                onClick={() => {
                  triggerHaptic('light');
                  setHoveredCategory((curr) => (curr === cat.category ? null : cat.category));
                }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
          {hoveredCategory ? (
            (() => {
              const active = categories.find((c) => c.category === hoveredCategory);
              return active ? (
                <>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 truncate max-w-[100px]">
                    {active.category}
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-white font-mono tabular-nums">
                    {formatINR(active.amount)}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 font-mono">
                    {active.percentage}%
                  </span>
                </>
              ) : null;
            })()
          ) : (
            <>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400">
                Total
              </span>
              <span className="text-base font-bold text-zinc-900 dark:text-white font-mono tabular-nums">
                {formatINR(totalAmount)}
              </span>
              <span className="text-[10px] text-zinc-400">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 w-full space-y-2 max-h-56 overflow-y-auto pr-1">
        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat.category];
          const isHovered = hoveredCategory === cat.category;

          return (
            <div
              key={cat.category}
              onMouseEnter={() => setHoveredCategory(cat.category)}
              onMouseLeave={() => setHoveredCategory(null)}
              onClick={() => {
                triggerHaptic('light');
                setHoveredCategory((curr) => (curr === cat.category ? null : cat.category));
              }}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer select-none active:scale-[0.98] ${
                isHovered
                  ? 'bg-zinc-100 dark:bg-zinc-800'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  <CategoryIcon category={cat.category} className="w-3 h-3" />
                </div>
                <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                  {cat.category}
                </span>
                <span className="text-[11px] text-zinc-400">
                  ({cat.count})
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono tabular-nums">
                  {formatINR(cat.amount)}
                </span>
                <span className="w-10 text-right font-medium text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
                  {cat.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

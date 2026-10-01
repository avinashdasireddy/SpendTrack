import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Expense } from '../../types';
import { getDailySpendingTrend } from '../../utils/calculations';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { triggerHaptic } from '../../utils/haptics';

interface SpendingTrendChartProps {
  expenses: Expense[];
}

type TrendPeriod = '7d' | '30d' | '3m' | '6m' | '1y';

export function SpendingTrendChart({ expenses }: SpendingTrendChartProps) {
  const [period, setPeriod] = useState<TrendPeriod>('30d');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    label: string;
    amount: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const daysCount = useMemo(() => {
    switch (period) {
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '3m':
        return 90;
      case '6m':
        return 180;
      case '1y':
        return 365;
      default:
        return 30;
    }
  }, [period]);

  const trendData = useMemo(() => {
    return getDailySpendingTrend(expenses, daysCount);
  }, [expenses, daysCount]);

  const maxAmount = useMemo(() => {
    const max = Math.max(...trendData.map((d) => d.amount), 0);
    return max > 0 ? max : 100;
  }, [trendData]);

  const totalPeriodSpending = useMemo(() => {
    return trendData.reduce((sum, d) => sum + d.amount, 0);
  }, [trendData]);

  // Chart dimensions
  const height = 220;
  const paddingX = 20;
  const paddingTop = 25;
  const paddingBottom = 30;
  const innerHeight = height - paddingTop - paddingBottom;

  // Build points
  const points = useMemo(() => {
    const width = 600; // coordinate space
    const step = (width - paddingX * 2) / (trendData.length - 1 || 1);

    return trendData.map((d, index) => {
      const x = paddingX + index * step;
      const y = paddingTop + innerHeight - (d.amount / maxAmount) * innerHeight;
      return { ...d, x, y };
    });
  }, [trendData, maxAmount, innerHeight]);

  // Generate SVG path for line and area
  const { linePath, areaPath } = useMemo<{ linePath: string; areaPath: string }>(() => {
    if (points.length === 0) return { linePath: '', areaPath: '' };

    let line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      line += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    const last = points[points.length - 1];
    const first = points[0];
    const baseline = paddingTop + innerHeight;
    const area = `${line} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;

    return { linePath: line, areaPath: area };
  }, [points, innerHeight]);

  return (
    <div className="space-y-4">
      {/* Top bar with Period selectors and total */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Total in period:</span>
          <span className="ml-2 text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white font-mono tabular-nums">
            <AnimatedNumber value={totalPeriodSpending} />
          </span>
        </div>

        {/* Filter buttons */}
        <div className="inline-flex rounded-2xl bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-semibold">
          {(
            [
              { key: '7d', label: '7D' },
              { key: '30d', label: '30D' },
              { key: '3m', label: '3M' },
              { key: '6m', label: '6M' },
              { key: '1y', label: '1Y' },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setPeriod(item.key);
              }}
              className={`min-h-[34px] px-3 py-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                period === item.key
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Chart Container */}
      <div className="relative w-full h-[220px] bg-zinc-50/50 dark:bg-zinc-800/20 rounded-2xl p-2 border border-zinc-200/60 dark:border-zinc-800/60 select-none">
        <svg
          viewBox="0 0 600 220"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1="20"
            y1={paddingTop}
            x2="580"
            y2={paddingTop}
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-zinc-200 dark:text-zinc-800"
          />
          <line
            x1="20"
            y1={paddingTop + innerHeight / 2}
            x2="580"
            y2={paddingTop + innerHeight / 2}
            stroke="currentColor"
            strokeDasharray="4 4"
            className="text-zinc-200 dark:text-zinc-800"
          />
          <line
            x1="20"
            y1={paddingTop + innerHeight}
            x2="580"
            y2={paddingTop + innerHeight}
            stroke="currentColor"
            className="text-zinc-200 dark:text-zinc-800"
          />

          {/* Area fill */}
          {areaPath && (
            <motion.path
              d={areaPath}
              fill="url(#trendGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* Line */}
          {linePath && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="2.8"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          )}

          {/* Points & Touch hit zones */}
          {points.map((pt, i) => {
            const hasSpending = pt.amount > 0;
            return (
              <g key={i}>
                {hasSpending && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.date === pt.date ? 6 : 3.5}
                    fill="#10B981"
                    stroke="#ffffff"
                    strokeWidth="2"
                    className="transition-all duration-150 pointer-events-none"
                  />
                )}
                {/* Hit area for mouse and mobile touch */}
                <rect
                  x={pt.x - 12}
                  y={0}
                  width={24}
                  height={220}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onTouchStart={() => {
                    triggerHaptic('light');
                    setHoveredPoint(pt);
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-3.5 py-2 rounded-2xl text-xs shadow-xl border border-zinc-700 dark:border-zinc-300 font-mono"
            style={{
              left: `${Math.max(12, Math.min(88, (hoveredPoint.x / 600) * 100))}%`,
              top: `${(hoveredPoint.y / 220) * 100}%`,
            }}
          >
            <div className="font-extrabold text-sm">{formatINR(hoveredPoint.amount)}</div>
            <div className="text-[10px] text-zinc-400 dark:text-zinc-600 font-sans">
              {formatDisplayDate(hoveredPoint.date)} • {hoveredPoint.count}{' '}
              {hoveredPoint.count === 1 ? 'txn' : 'txns'}
            </div>
          </div>
        )}
      </div>

      {/* Axis dates */}
      <div className="flex justify-between text-[11px] text-zinc-400 font-mono px-2">
        <span>{trendData[0]?.label || ''}</span>
        <span>{trendData[Math.floor(trendData.length / 2)]?.label || ''}</span>
        <span>{trendData[trendData.length - 1]?.label || ''}</span>
      </div>
    </div>
  );
}

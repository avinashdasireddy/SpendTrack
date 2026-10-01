import React from 'react';
import { LucideIcon } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface SummaryCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  icon: LucideIcon;
  accentColor?: string;
  badgeText?: string;
  badgeType?: 'neutral' | 'success' | 'warning';
  isHero?: boolean;
}

export function SummaryCard({
  title,
  amount,
  subtitle,
  icon: Icon,
  accentColor = '#10B981',
  badgeText,
  badgeType = 'neutral',
  isHero = false,
}: SummaryCardProps) {
  if (isHero) {
    return (
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 sm:p-7 shadow-lg shadow-emerald-900/15 border border-emerald-500/30 transition-transform duration-200">
        {/* Subtle decorative glow circle */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-2xs">
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-100">
                {title}
              </span>
            </div>
          </div>

          {/* Zero-Pill: Clean unboxed metadata */}
          {badgeText && (
            <span className="text-xs font-semibold text-emerald-100/90 tracking-tight">
              {badgeText}
            </span>
          )}
        </div>

        <div className="relative z-10 mt-4 sm:mt-5">
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-mono tabular-nums text-white">
            <AnimatedNumber value={amount} />
          </div>
          {subtitle && (
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium text-emerald-100/90 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all duration-200 group">
      {/* Subtle top accent bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-opacity duration-300 opacity-70 group-hover:opacity-100"
        style={{ backgroundColor: accentColor }}
      />

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200"
            style={{
              backgroundColor: `${accentColor}15`,
              color: accentColor,
            }}
          >
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-zinc-500 dark:text-zinc-400 truncate">
            {title}
          </span>
        </div>

        {/* Zero-Pill: Clean unboxed metadata */}
        {badgeText && (
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 shrink-0">
            {badgeText}
          </span>
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white font-mono tabular-nums">
          <AnimatedNumber value={amount} />
        </div>
        {subtitle && (
          <p className="mt-1 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

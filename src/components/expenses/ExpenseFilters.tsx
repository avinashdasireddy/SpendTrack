import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, X, ArrowUpDown, Check } from 'lucide-react';
import { ExpenseCategory, PaymentMethod, CATEGORIES, PAYMENT_METHODS } from '../../types';
import { triggerHaptic } from '../../utils/haptics';

export interface FilterState {
  searchQuery: string;
  category: ExpenseCategory | 'ALL';
  paymentMethod: PaymentMethod | 'ALL';
  dateRangePreset: 'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy: 'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc';
}

interface ExpenseFiltersProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
  totalMatches: number;
}

export function ExpenseFilters({
  filters,
  onChange,
  onReset,
  totalMatches,
}: ExpenseFiltersProps) {
  const [showModal, setShowModal] = useState(false);

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.category !== 'ALL' ||
    filters.paymentMethod !== 'ALL' ||
    filters.dateRangePreset !== 'ALL' ||
    Boolean(filters.minAmount) ||
    Boolean(filters.maxAmount);

  const activeChips = [
    filters.category !== 'ALL' && {
      key: 'cat',
      label: `Category: ${filters.category}`,
      onRemove: () => {
        triggerHaptic('light');
        onChange({ ...filters, category: 'ALL' });
      },
    },
    filters.paymentMethod !== 'ALL' && {
      key: 'pm',
      label: `Payment: ${filters.paymentMethod}`,
      onRemove: () => {
        triggerHaptic('light');
        onChange({ ...filters, paymentMethod: 'ALL' });
      },
    },
    filters.dateRangePreset !== 'ALL' && {
      key: 'date',
      label: `Period: ${filters.dateRangePreset.replace('_', ' ')}`,
      onRemove: () => {
        triggerHaptic('light');
        onChange({ ...filters, dateRangePreset: 'ALL' });
      },
    },
    (filters.minAmount || filters.maxAmount) && {
      key: 'amount',
      label: `Amount: ₹${filters.minAmount || '0'} - ₹${filters.maxAmount || '∞'}`,
      onRemove: () => {
        triggerHaptic('light');
        onChange({ ...filters, minAmount: '', maxAmount: '' });
      },
    },
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  return (
    <div className="space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-2xs">
      {/* Top Search bar & quick toggles */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search reason, category, notes, payment..."
            value={filters.searchQuery}
            onChange={(e) => onChange({ ...filters, searchQuery: e.target.value })}
            className="w-full min-h-[44px] pl-9 pr-8 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs sm:text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onChange({ ...filters, searchQuery: '' });
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              aria-label="Clear search query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Sort selector */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={filters.sortBy}
              onChange={(e) => {
                triggerHaptic('light');
                onChange({
                  ...filters,
                  sortBy: e.target.value as FilterState['sortBy'],
                });
              }}
              className="w-full min-h-[44px] appearance-none pl-8 pr-7 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300 focus:outline-hidden cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="amount_desc">Highest Amount</option>
              <option value="amount_asc">Lowest Amount</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Toggle filter modal / panel */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowModal(true);
            }}
            className={`min-h-[44px] flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              hasActiveFilters
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                : 'bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('medium');
                onReset();
              }}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors active:scale-95 cursor-pointer"
              title="Reset all filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips (Zero-Pill: rounded-xl, unboxed feel) */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300"
            >
              <span>{chip.label}</span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:text-red-500 p-0.5 rounded-md min-w-[24px] min-h-[24px] flex items-center justify-center cursor-pointer"
                aria-label={`Remove filter: ${chip.label}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results counter indicator */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
        <span>
          Showing <strong className="text-zinc-800 dark:text-zinc-200 font-semibold">{totalMatches}</strong> matching {totalMatches === 1 ? 'expense' : 'expenses'}
        </span>
        {hasActiveFilters && (
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
            Filtered
          </span>
        )}
      </div>

      {/* Filter Bottom Sheet / Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden p-6 pb-safe space-y-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Grab handle */}
              <div className="sm:hidden pt-1 pb-2 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>

              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Filter Expenses
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filter inputs */}
              <div className="space-y-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        category: e.target.value as ExpenseCategory | 'ALL',
                      })
                    }
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Method Dropdown */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        paymentMethod: e.target.value as PaymentMethod | 'ALL',
                      })
                    }
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="ALL">All Payment Methods</option>
                    {PAYMENT_METHODS.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date range preset */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Date Period
                  </label>
                  <select
                    value={filters.dateRangePreset}
                    onChange={(e) =>
                      onChange({
                        ...filters,
                        dateRangePreset: e.target.value as FilterState['dateRangePreset'],
                      })
                    }
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
                  >
                    <option value="ALL">All Time</option>
                    <option value="TODAY">Today</option>
                    <option value="YESTERDAY">Yesterday</option>
                    <option value="THIS_WEEK">This Week</option>
                    <option value="THIS_MONTH">This Month</option>
                    <option value="CUSTOM">Custom Date Range</option>
                  </select>
                </div>

                {/* Amount range */}
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Amount Range (₹)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min ₹"
                      value={filters.minAmount || ''}
                      onChange={(e) => onChange({ ...filters, minAmount: e.target.value })}
                      className="w-1/2 min-h-[44px] px-3 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white"
                    />
                    <span className="text-zinc-400 text-xs font-bold">-</span>
                    <input
                      type="number"
                      placeholder="Max ₹"
                      value={filters.maxAmount || ''}
                      onChange={(e) => onChange({ ...filters, maxAmount: e.target.value })}
                      className="w-1/2 min-h-[44px] px-3 py-2 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs font-mono text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Custom Date Inputs if CUSTOM selected */}
                {filters.dateRangePreset === 'CUSTOM' && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">From Date</label>
                      <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-zinc-400 mb-1">To Date</label>
                      <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
                        className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sheet action buttons */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    onReset();
                    setShowModal(false);
                  }}
                  className="min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-semibold text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                >
                  Reset All
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowModal(false);
                  }}
                  className="min-h-[44px] px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

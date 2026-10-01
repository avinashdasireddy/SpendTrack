import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, Check, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Expense, ExpenseCategory, PaymentMethod, CATEGORIES, PAYMENT_METHODS, CATEGORY_COLORS } from '../../types';
import { useExpenses } from '../../context/ExpenseContext';
import { getKolkataDateString, getKolkataTimeString, getKolkataYesterdayString } from '../../utils/date';
import { CATEGORY_ICONS, PAYMENT_ICONS } from '../common/CategoryBadge';
import { triggerHaptic } from '../../utils/haptics';
import { parseQuickExpense, ParsedQuickExpense } from '../../utils/quickParser';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

const QUICK_REASONS: { label: string; category: ExpenseCategory }[] = [
  { label: 'Chai / Coffee', category: 'Food' },
  { label: 'Breakfast', category: 'Food' },
  { label: 'Lunch', category: 'Food' },
  { label: 'Dinner', category: 'Food' },
  { label: 'Groceries', category: 'Groceries' },
  { label: 'Auto / Metro / Cab', category: 'Travel' },
  { label: 'Mobile Recharge', category: 'Recharge' },
  { label: 'Medicine', category: 'Health' },
];

export function AddExpenseModal({
  isOpen,
  onClose,
  expenseToEdit,
}: AddExpenseModalProps) {
  const { addExpense, updateExpense } = useExpenses();

  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<ExpenseCategory>('Food');
  const [reason, setReason] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState<string>(getKolkataDateString());
  const [time, setTime] = useState<string>(getKolkataTimeString());
  const [dateMode, setDateMode] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [notes, setNotes] = useState<string>('');
  const [quickInput, setQuickInput] = useState<string>('');
  const [parsedPreview, setParsedPreview] = useState<ParsedQuickExpense | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = getKolkataDateString();
  const yesterdayStr = getKolkataYesterdayString();

  useEffect(() => {
    if (isOpen) {
      if (expenseToEdit) {
        setAmount(String(expenseToEdit.amount));
        setCategory(expenseToEdit.category);
        setReason(expenseToEdit.reason);
        setPaymentMethod(expenseToEdit.paymentMethod);
        setDate(expenseToEdit.date);
        setTime(expenseToEdit.time || getKolkataTimeString());
        setNotes(expenseToEdit.notes || '');

        if (expenseToEdit.date === todayStr) {
          setDateMode('today');
        } else if (expenseToEdit.date === yesterdayStr) {
          setDateMode('yesterday');
        } else {
          setDateMode('custom');
        }
      } else {
        setAmount('');
        setCategory('Food');
        setReason('');
        setPaymentMethod('UPI');
        setDate(todayStr);
        setTime(getKolkataTimeString());
        setDateMode('today');
        setNotes('');
        setQuickInput('');
        setParsedPreview(null);
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, expenseToEdit, todayStr, yesterdayStr]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleQuickInputChange = (val: string) => {
    setQuickInput(val);
    const parsed = parseQuickExpense(val);
    setParsedPreview(parsed);
  };

  const applyQuickParsed = () => {
    if (!parsedPreview) return;
    triggerHaptic('medium');
    if (parsedPreview.amount !== null) {
      setAmount(String(parsedPreview.amount));
    }
    if (parsedPreview.reason) {
      setReason(parsedPreview.reason);
    }
    setCategory(parsedPreview.category);
    setPaymentMethod(parsedPreview.paymentMethod);
    setQuickInput('');
    setParsedPreview(null);
  };

  const handleDateModeChange = (mode: 'today' | 'yesterday' | 'custom') => {
    triggerHaptic('light');
    setDateMode(mode);
    if (mode === 'today') {
      setDate(todayStr);
    } else if (mode === 'yesterday') {
      setDate(yesterdayStr);
    }
  };

  const handleAddPreset = (value: number) => {
    triggerHaptic('light');
    const current = parseFloat(amount) || 0;
    if (!amount || current === 0) {
      setAmount(String(value));
    } else {
      setAmount(String(current + value));
    }
  };

  const handleQuickReasonClick = (item: { label: string; category: ExpenseCategory }) => {
    triggerHaptic('light');
    setReason(item.label);
    setCategory(item.category);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submission
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      triggerHaptic('warning');
      setError('Please enter an amount greater than ₹0');
      return;
    }

    if (!reason.trim()) {
      triggerHaptic('warning');
      setError('What did you spend this money on? (Reason is required)');
      return;
    }

    if (!date) {
      triggerHaptic('warning');
      setError('Please select a valid date');
      return;
    }

    try {
      setIsSubmitting(true);

      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, {
          amount: parsedAmount,
          category,
          reason: reason.trim(),
          paymentMethod,
          date,
          time,
          notes: notes.trim(),
        });
        triggerHaptic('success');
      } else {
        await addExpense({
          amount: parsedAmount,
          category,
          reason: reason.trim(),
          paymentMethod,
          date,
          time,
          notes: notes.trim(),
        });
        triggerHaptic('success');
        try {
          confetti({
            particleCount: 35,
            spread: 55,
            origin: { y: 0.8 },
            colors: ['#10B981', '#059669', '#34D399', '#F59E0B'],
            disableForReducedMotion: true,
          });
        } catch (_) {}
      }

      onClose();
    } catch (err) {
      triggerHaptic('warning');
      setError(err instanceof Error ? err.message : 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop with iOS-style blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet on Mobile / Centered Card on Desktop */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab handle for mobile touch ergonomics */}
            <div className="sm:hidden pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    {expenseToEdit ? 'Edit Expense' : 'Record New Expense'}
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    Every rupee tracked with purpose
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Smart Quick Fill Bar (Deterministic local parse) */}
              {!expenseToEdit && (
                <div className="p-3 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>Smart Quick Fill</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">e.g. "50 lunch", "20 auto"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type e.g. 50 coffee or 20 auto..."
                      value={quickInput}
                      onChange={(e) => handleQuickInputChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyQuickParsed();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-hidden focus:border-emerald-500"
                    />
                    {parsedPreview && (
                      <button
                        type="button"
                        onClick={applyQuickParsed}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs active:scale-95 transition-all shrink-0 cursor-pointer shadow-2xs"
                      >
                        Fill
                      </button>
                    )}
                  </div>
                  {parsedPreview && (
                    <div className="mt-1.5 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 truncate">
                      <span>Detected:</span>
                      <strong className="font-mono">{parsedPreview.amount ? `₹${parsedPreview.amount}` : ''}</strong>
                      <span>·</span>
                      <span className="truncate">{parsedPreview.reason}</span>
                      <span>·</span>
                      <span className="font-semibold">{parsedPreview.category}</span>
                    </div>
                  )}
                </div>
              )}

              {/* 1. Large Focus Amount Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Amount Spent <span className="text-emerald-500">*</span>
                </label>
                <div className="relative rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border-2 border-zinc-200 dark:border-zinc-700 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 select-none mr-2 font-mono">
                        ₹
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        required
                        autoFocus={!expenseToEdit}
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full text-3xl sm:text-4xl font-extrabold bg-transparent text-zinc-900 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-600 focus:outline-hidden font-mono tabular-nums tracking-tight"
                      />
                    </div>
                    {amount && (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setAmount('');
                        }}
                        className="text-xs font-semibold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-2 py-1 rounded-lg"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Quick amount increment chips */}
                  <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-zinc-200/60 dark:border-zinc-700/60 overflow-x-auto no-scrollbar">
                    <span className="text-[10px] text-zinc-400 uppercase font-bold mr-1 shrink-0">
                      Add:
                    </span>
                    {QUICK_AMOUNTS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleAddPreset(q)}
                        className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-600 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0 shadow-2xs active:scale-95"
                      >
                        +₹{q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Reason Input (Required) + Quick Suggestions */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  What did you spend this money on? <span className="text-emerald-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bought biscuits, Metro card, Lunch with friends"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                />

                {/* Quick 1-tap suggestion buttons */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto no-scrollbar pb-1">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold shrink-0 mr-0.5">
                    Ideas:
                  </span>
                  {QUICK_REASONS.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleQuickReasonClick(item)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors shrink-0 active:scale-95"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Category Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Category
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat];
                    const isSelected = category === cat;
                    const catColor = CATEGORY_COLORS[cat];

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setCategory(cat);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: `${catColor}20`,
                            color: catColor,
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Payment Method */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const Icon = PAYMENT_ICONS[pm];
                    const isSelected = paymentMethod === pm;

                    return (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setPaymentMethod(pm);
                        }}
                        className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xs'
                            : 'border-zinc-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{pm}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Date & Time with Instant "Today" / "Yesterday" / "Custom" Toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Date & Time (Asia/Kolkata)
                  </label>
                  {/* Quick date segment */}
                  <div className="inline-flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => handleDateModeChange('today')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        dateMode === 'today'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-bold'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDateModeChange('yesterday')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        dateMode === 'yesterday'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-bold'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Yesterday
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDateModeChange('custom')}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        dateMode === 'custom'
                          ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-2xs font-bold'
                          : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setDateMode('custom');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Optional Notes */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Optional Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Store location, invoice number, or extra context..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none font-medium"
                />
              </div>

              {/* Sticky bottom CTA with safe area */}
              <div className="pt-2 pb-safe border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="min-h-[44px] px-5 py-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] flex-1 sm:flex-initial px-7 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{expenseToEdit ? 'Save Changes' : 'Record Expense'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { PlusCircle, MessageSquareText, TrendingDown, PieChart, Check, ArrowRight } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddExpense: () => void;
}

export function OnboardingModal({
  isOpen,
  onClose,
  onOpenAddExpense,
}: OnboardingModalProps) {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      icon: PlusCircle,
      color: '#10B981',
      title: '1. Add an expense in seconds',
      description: 'Quickly record every rupee you spend with our rapid single-tap entry and quick ₹ amount presets.',
    },
    {
      icon: MessageSquareText,
      color: '#3B82F6',
      title: '2. Write why you spent it',
      description: 'Beyond just numbers, recording the true reason behind an expense brings deep mindfulness to your spending.',
    },
    {
      icon: TrendingDown,
      color: '#F59E0B',
      title: '3. Track your daily spending',
      description: 'See live calculated daily, weekly, monthly, and lifetime metrics anchored in Indian Standard Time.',
    },
    {
      icon: PieChart,
      color: '#EC4899',
      title: '4. Understand where your money goes',
      description: 'Interactive category donuts, payment method distribution, and calendar breakdowns keep you in total control.',
    },
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleStart = () => {
    onClose();
    onOpenAddExpense();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between text-xs text-zinc-400 font-medium mb-4">
          <span>Step {step + 1} of {steps.length}</span>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            Skip guide
          </button>
        </div>

        <div className="text-center py-4">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-transform duration-300"
            style={{
              backgroundColor: `${current.color}18`,
              color: current.color,
            }}
          >
            <Icon className="w-8 h-8" />
          </div>

          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            {current.title}
          </h3>

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed px-2">
            {current.description}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 my-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 bg-emerald-500'
                  : 'w-1.5 bg-zinc-200 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="mt-6 flex items-center gap-3">
          {step === steps.length - 1 ? (
            <button
              onClick={handleStart}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Record First Expense</span>
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex-1 py-2.5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold text-xs flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

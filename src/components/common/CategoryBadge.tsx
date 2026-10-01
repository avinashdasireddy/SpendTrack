import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Bus,
  ShoppingCart,
  GraduationCap,
  Receipt,
  HeartPulse,
  Film,
  Smartphone,
  Repeat,
  User,
  MoreHorizontal,
  LucideIcon,
  QrCode,
  Banknote,
  CreditCard,
  Building2,
} from 'lucide-react';
import { ExpenseCategory, PaymentMethod, CATEGORY_COLORS } from '../../types';

export const CATEGORY_ICONS: Record<ExpenseCategory, LucideIcon> = {
  Food: Utensils,
  Groceries: ShoppingBag,
  Travel: Bus,
  Shopping: ShoppingCart,
  Education: GraduationCap,
  Bills: Receipt,
  Health: HeartPulse,
  Entertainment: Film,
  Recharge: Smartphone,
  Subscriptions: Repeat,
  Personal: User,
  Other: MoreHorizontal,
};

export const PAYMENT_ICONS: Record<PaymentMethod, LucideIcon> = {
  UPI: QrCode,
  Cash: Banknote,
  'Debit Card': CreditCard,
  'Credit Card': CreditCard,
  'Bank Transfer': Building2,
  Other: MoreHorizontal,
};

export function CategoryIcon({
  category,
  className = 'w-4 h-4',
  color,
}: {
  category: ExpenseCategory;
  className?: string;
  color?: string;
}) {
  const Icon = CATEGORY_ICONS[category] || MoreHorizontal;
  return <Icon className={className} style={color ? { color } : undefined} />;
}

/**
 * Clean unboxed metadata representation following Zero-Pill design constitution
 */
export function CategoryBadge({
  category,
  size = 'md',
  showIcon = true,
}: {
  category: ExpenseCategory;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}) {
  const color = CATEGORY_COLORS[category] || '#64748B';
  const Icon = CATEGORY_ICONS[category] || MoreHorizontal;

  const textSizes = {
    sm: 'text-xs gap-1',
    md: 'text-xs gap-1.5 font-medium',
    lg: 'text-sm gap-2 font-medium',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span className={`inline-flex items-center font-medium ${textSizes[size]}`}>
      {showIcon && <Icon className={iconSizes[size]} style={{ color }} />}
      <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{category}</span>
    </span>
  );
}

/**
 * Clean unboxed payment method metadata
 */
export function PaymentMethodBadge({
  method,
  size = 'md',
}: {
  method: PaymentMethod;
  size?: 'sm' | 'md';
}) {
  const Icon = PAYMENT_ICONS[method] || MoreHorizontal;

  return (
    <span
      className={`inline-flex items-center font-mono text-zinc-600 dark:text-zinc-400 ${
        size === 'sm' ? 'text-[11px] gap-1' : 'text-xs gap-1.5'
      }`}
    >
      <Icon className="w-3 h-3 text-zinc-400" />
      <span>{method}</span>
    </span>
  );
}

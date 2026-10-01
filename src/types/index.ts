export type ExpenseCategory =
  | 'Food'
  | 'Groceries'
  | 'Travel'
  | 'Shopping'
  | 'Education'
  | 'Bills'
  | 'Health'
  | 'Entertainment'
  | 'Recharge'
  | 'Subscriptions'
  | 'Personal'
  | 'Other';

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Bank Transfer'
  | 'Other';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  reason: string;
  paymentMethod: PaymentMethod;
  date: string; // YYYY-MM-DD (Asia/Kolkata)
  time: string; // HH:mm (24-hour format)
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  emailVerified: boolean;
}

export interface CategoryInfo {
  name: ExpenseCategory;
  color: string;
  bgLight: string;
  bgDark: string;
  iconName: string;
}

export interface PaymentMethodInfo {
  name: PaymentMethod;
  iconName: string;
  badgeColor: string;
}

export const CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Groceries',
  'Travel',
  'Shopping',
  'Education',
  'Bills',
  'Health',
  'Entertainment',
  'Recharge',
  'Subscriptions',
  'Personal',
  'Other',
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#F97316', // Orange
  Groceries: '#10B981', // Emerald
  Travel: '#06B6D4', // Cyan
  Shopping: '#EC4899', // Pink
  Education: '#8B5CF6', // Purple
  Bills: '#EF4444', // Red
  Health: '#14B8A6', // Teal
  Entertainment: '#F59E0B', // Amber
  Recharge: '#3B82F6', // Blue
  Subscriptions: '#6366F1', // Indigo
  Personal: '#84CC16', // Lime
  Other: '#64748B', // Slate
};

export type ActiveTab = 'dashboard' | 'expenses' | 'reports' | 'calendar' | 'settings';

export interface MonthlyBudget {
  overallAmount: number | null;
  categoryBudgets: Partial<Record<ExpenseCategory, number>>;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  action?: ToastAction;
}

import { ExpenseCategory, PaymentMethod, CATEGORIES } from '../types';

export interface ParsedQuickExpense {
  amount: number | null;
  reason: string;
  category: ExpenseCategory;
  paymentMethod: PaymentMethod;
  confidence: 'high' | 'medium' | 'low';
}

const KEYWORD_MAP: { keywords: string[]; category: ExpenseCategory }[] = [
  {
    keywords: [
      'chai', 'tea', 'coffee', 'lunch', 'dinner', 'breakfast', 'snack', 'snacks',
      'pizza', 'burger', 'biryani', 'zomato', 'swiggy', 'restaurant', 'cafe',
      'bakery', 'samosa', 'dosa', 'roti', 'subway', 'mcdonalds', 'kfc', 'food',
      'biscuits', 'cookies', 'coke', 'pepsi', 'juice', 'shake', 'ice cream', 'icecream'
    ],
    category: 'Food',
  },
  {
    keywords: [
      'groceries', 'grocery', 'milk', 'vegetable', 'vegetables', 'veggies',
      'fruit', 'fruits', 'dmart', 'blinkit', 'zepto', 'instamart', 'ration',
      'rice', 'atta', 'dal', 'oil', 'sugar', 'salt', 'egg', 'eggs', 'supermarket'
    ],
    category: 'Groceries',
  },
  {
    keywords: [
      'auto', 'cab', 'uber', 'ola', 'bus', 'train', 'metro', 'petrol',
      'diesel', 'fuel', 'ticket', 'flight', 'rapido', 'travel', 'taxi',
      'toll', 'parking', 'rickshaw', 'fare'
    ],
    category: 'Travel',
  },
  {
    keywords: [
      'shop', 'shopping', 'clothes', 'amazon', 'flipkart', 'myntra', 'shoes',
      'mall', 'dress', 'shirt', 'pants', 'tshirt', 'jeans', 'zara', 'h&m'
    ],
    category: 'Shopping',
  },
  {
    keywords: [
      'fee', 'fees', 'course', 'books', 'tuition', 'exam', 'college', 'school',
      'classes', 'pen', 'notebook', 'stationery', 'udemy', 'coursera'
    ],
    category: 'Education',
  },
  {
    keywords: [
      'bill', 'bills', 'electricity', 'current', 'water', 'gas', 'cylinder',
      'wifi', 'broadband', 'maintenance', 'rent', 'power', 'utility'
    ],
    category: 'Bills',
  },
  {
    keywords: [
      'doc', 'doctor', 'hospital', 'medicine', 'medicines', 'pharmacy', 'tablet',
      'tablets', 'medical', 'health', 'lab', 'clinic', 'dentist', 'apollo'
    ],
    category: 'Health',
  },
  {
    keywords: [
      'movie', 'movies', 'cinema', 'popcorn', 'game', 'gaming', 'concert',
      'show', 'bookmyshow', 'theatre', 'fun', 'amusement'
    ],
    category: 'Entertainment',
  },
  {
    keywords: [
      'recharge', 'jio', 'airtel', 'vi', 'vodafone', 'prepaid', 'postpaid',
      'mobile recharge', 'dth', 'tata sky'
    ],
    category: 'Recharge',
  },
  {
    keywords: [
      'subscription', 'subscriptions', 'netflix', 'spotify', 'prime',
      'hotstar', 'youtube', 'apple music', 'icloud', 'drive storage', 'chatgpt'
    ],
    category: 'Subscriptions',
  },
  {
    keywords: [
      'salon', 'haircut', 'gym', 'fitness', 'spa', 'massage', 'grooming',
      'barber', 'shave', 'personal care', 'perfume'
    ],
    category: 'Personal',
  },
];

/**
 * Deterministically parses natural input like:
 * "₹50 lunch" -> amount: 50, reason: "Lunch", category: "Food"
 * "20 auto" -> amount: 20, reason: "Auto", category: "Travel"
 * "120 medicine cash" -> amount: 120, reason: "Medicine", category: "Health", payment: "Cash"
 */
export function parseQuickExpense(input: string): ParsedQuickExpense | null {
  const clean = input.trim();
  if (!clean) return null;

  // 1. Detect Payment Method if specified
  let paymentMethod: PaymentMethod = 'UPI';
  let withoutPayment = clean;
  if (/\b(?:cash)\b/i.test(withoutPayment)) {
    paymentMethod = 'Cash';
    withoutPayment = withoutPayment.replace(/\b(?:cash)\b/gi, ' ');
  } else if (/\b(?:card|debit|credit)\b/i.test(withoutPayment)) {
    paymentMethod = 'Debit Card';
    withoutPayment = withoutPayment.replace(/\b(?:card|debit|credit)\b/gi, ' ');
  }

  // 2. Extract Amount using regex: handles ₹50, 50/-, rs 50, 50
  const amountRegex = /(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)\s*(?:\/[-=]|rs\.?|inr)?/i;
  const match = withoutPayment.match(amountRegex);

  let amount: number | null = null;
  let remainingText = withoutPayment;

  if (match) {
    const parsed = parseFloat(match[1]);
    if (!isNaN(parsed) && parsed > 0) {
      amount = parsed;
      // Remove matched amount from remaining text
      remainingText = withoutPayment.replace(match[0], ' ').trim();
    }
  }

  // Clean remaining text as reason
  let reason = remainingText.replace(/\s+/g, ' ').trim();

  // If no reason remaining, use generic
  if (!reason && amount !== null) {
    reason = 'Expense';
  }

  // Capitalize first letter of reason
  if (reason) {
    reason = reason.charAt(0).toUpperCase() + reason.slice(1);
  }

  // 3. Match Category
  const lowerText = clean.toLowerCase();
  let category: ExpenseCategory = 'Other';
  let confidence: 'high' | 'medium' | 'low' = 'low';

  for (const group of KEYWORD_MAP) {
    const hasMatch = group.keywords.some((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(lowerText);
    });

    if (hasMatch) {
      category = group.category;
      confidence = amount ? 'high' : 'medium';
      break;
    }
  }

  if (category === 'Other') {
    // If reason exists but category was not detected, default to 'Food' if common word or keep Other
    if (amount) {
      confidence = 'medium';
      category = 'Food'; // Most common daily expense in India
    }
  }

  return {
    amount,
    reason: reason || 'Expense',
    category,
    paymentMethod,
    confidence,
  };
}

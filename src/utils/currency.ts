/**
 * Formats a number according to the Indian numbering system with Rupee symbol (₹)
 * Examples:
 * 10 -> ₹10
 * 1250 -> ₹1,250
 * 12500 -> ₹12,500
 * 125000 -> ₹1,25,000
 * 124580 -> ₹1,24,580
 */
export function formatINR(amount: number | null | undefined, showDecimals: boolean = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  // If decimals are present or explicitly requested
  const hasFraction = absAmount % 1 !== 0;
  const formattedFraction = (showDecimals || hasFraction) ? absAmount.toFixed(2) : Math.floor(absAmount).toString();

  const parts = formattedFraction.split('.');
  const intPart = parts[0];
  const decPart = parts[1];

  // Indian numbering: last 3 digits, then pairs of 2 digits
  let lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);

  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const result = decPart ? `${formattedInteger}.${decPart}` : formattedInteger;

  return `${isNegative ? '-' : ''}₹${result}`;
}

/**
 * Format without currency symbol for raw numeric input displays
 */
export function formatINRNumber(amount: number): string {
  const formatted = formatINR(amount);
  return formatted.replace(/^₹/, '');
}

/**
 * Parse input string to positive float
 */
export function parseAmount(value: string): number | null {
  const cleaned = value.replace(/[^0-9.]/g, '');
  if (!cleaned) return null;
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? null : num;
}

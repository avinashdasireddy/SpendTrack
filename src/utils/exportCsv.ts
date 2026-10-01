import { Expense } from '../types';

/**
 * Escapes a cell value for CSV (RFC 4180 standard)
 */
function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // If the cell contains commas, quotes, or newlines, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Exports authenticated user's expenses to CSV file
 */
export function exportExpensesToCSV(expenses: Expense[], userDisplayName?: string): void {
  const headers = ['Date', 'Time', 'Amount (INR)', 'Category', 'Reason', 'Payment Method', 'Notes'];

  // Sort by date descending, then time descending
  const sorted = [...expenses].sort((a, b) => {
    const dComp = b.date.localeCompare(a.date);
    if (dComp !== 0) return dComp;
    return (b.time || '').localeCompare(a.time || '');
  });

  const rows = sorted.map((e) => [
    escapeCsvCell(e.date),
    escapeCsvCell(e.time),
    escapeCsvCell(e.amount),
    escapeCsvCell(e.category),
    escapeCsvCell(e.reason),
    escapeCsvCell(e.paymentMethod),
    escapeCsvCell(e.notes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  // Prepend UTF-8 BOM so Excel and other spreadsheet viewers render correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const todayStr = new Date().toISOString().slice(0, 10);
  const sanitizedName = (userDisplayName || 'user').toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `spendtrack_${sanitizedName}_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

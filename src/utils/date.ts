/**
 * Date and time utilities anchored strictly to Asia/Kolkata (IST = UTC+05:30)
 */

export const TIMEZONE = 'Asia/Kolkata';

/**
 * Returns current Date adjusted to Asia/Kolkata timezone
 */
export function getNowKolkata(): Date {
  const now = new Date();
  const kolkataStr = now.toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(kolkataStr);
}

/**
 * Returns current date string formatted as YYYY-MM-DD in Asia/Kolkata
 */
export function getKolkataDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
  return parts; // 'YYYY-MM-DD'
}

/**
 * Convenience alias for getting today's date in Asia/Kolkata
 */
export function getKolkataTodayString(): string {
  return getKolkataDateString();
}

/**
 * Returns yesterday date string formatted as YYYY-MM-DD in Asia/Kolkata
 */
export function getKolkataYesterdayString(): string {
  const today = getNowKolkata();
  today.setDate(today.getDate() - 1);
  return getKolkataDateString(today);
}

/**
 * Returns current 24h time formatted as HH:mm in Asia/Kolkata
 */
export function getKolkataTimeString(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

/**
 * Returns current year-month formatted as YYYY-MM in Asia/Kolkata
 */
export function getKolkataCurrentMonthString(): string {
  return getKolkataDateString().slice(0, 7);
}

/**
 * Returns current year formatted as YYYY in Asia/Kolkata
 */
export function getKolkataCurrentYearString(): string {
  return getKolkataDateString().slice(0, 4);
}

/**
 * Calculates start (Monday) and end (Sunday) of the current week in Asia/Kolkata
 * Returns { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
 */
export function getKolkataCurrentWeekRange(): { start: string; end: string } {
  const now = getNowKolkata();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday ...
  // In India, week typically starts on Monday
  const distanceToMonday = (dayOfWeek + 6) % 7;
  
  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: getKolkataDateString(monday),
    end: getKolkataDateString(sunday),
  };
}

/**
 * Format date for display in UI
 * e.g., 'Today', 'Yesterday', 'Wed, 30 Sep', or '30 Sep 2026'
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getKolkataDateString();
  const yesterdayStr = getKolkataYesterdayString();

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;

  const date = new Date(y, m - 1, d);
  const currentYear = getKolkataCurrentYearString();

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: String(y) === currentYear ? undefined : 'numeric',
  });
}

/**
 * Full readable date: "Wednesday, 30 September 2026"
 */
export function formatFullDate(dateStr?: string): string {
  const now = dateStr ? new Date(dateStr) : getNowKolkata();
  return now.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format time (HH:mm) to 12-hour format e.g. "5:42 PM"
 */
export function formatDisplayTime(timeStr?: string): string {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Greeting based on current time in Asia/Kolkata
 */
export function getKolkataGreeting(name?: string): string {
  const now = getNowKolkata();
  const hour = now.getHours();
  let salutation = 'Good morning';

  if (hour >= 12 && hour < 17) {
    salutation = 'Good afternoon';
  } else if (hour >= 17 && hour < 22) {
    salutation = 'Good evening';
  } else if (hour >= 22 || hour < 4) {
    salutation = 'Good night';
  }

  const firstName = name ? name.trim().split(' ')[0] : 'there';
  return `${salutation}, ${firstName}`;
}

/**
 * Get days in a specific month
 */
export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed + 1, 0).getDate();
}

/**
 * Month name from YYYY-MM
 */
export function formatMonthName(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month) return yearMonth;
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

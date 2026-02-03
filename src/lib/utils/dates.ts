import { format, formatDistanceToNow, parseISO, isValid, isBefore, isAfter, addDays } from 'date-fns';

export function formatDate(date: string | Date, formatStr = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return format(dateObj, formatStr);
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

export function formatRelative(date: string | Date): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Invalid date';
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatExpiryDate(month: number, year: number): string {
  const monthStr = month.toString().padStart(2, '0');
  const yearStr = year.toString().slice(-2);
  return `${monthStr}/${yearStr}`;
}

export function isExpired(month: number, year: number): boolean {
  const now = new Date();
  const expiryDate = new Date(year, month, 0); // Last day of expiry month
  return isBefore(expiryDate, now);
}

export function isExpiringSoon(month: number, year: number, days = 30): boolean {
  const now = new Date();
  const expiryDate = new Date(year, month, 0);
  const warningDate = addDays(now, days);
  return isBefore(expiryDate, warningDate) && isAfter(expiryDate, now);
}

export function getRefundReminderStatus(
  reminderDate?: string
): 'upcoming' | 'today' | 'overdue' | 'none' {
  if (!reminderDate) return 'none';

  const date = parseISO(reminderDate);
  if (!isValid(date)) return 'none';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const reminder = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (reminder.getTime() === today.getTime()) return 'today';
  if (isBefore(reminder, today)) return 'overdue';
  return 'upcoming';
}

export function toISOString(date: Date | string): string {
  if (typeof date === 'string') {
    const parsed = parseISO(date);
    return isValid(parsed) ? parsed.toISOString() : new Date().toISOString();
  }
  return date.toISOString();
}

export function getDateRange(
  range: 'today' | 'week' | 'month' | 'year'
): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  let start: Date;

  switch (range) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start = new Date(now);
      start.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
      break;
  }

  return { start, end };
}

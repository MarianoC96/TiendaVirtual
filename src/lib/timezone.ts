/**
 * Peru timezone utilities (GMT-5)
 * All dates in the application should use this timezone
 */

export const PERU_TIMEZONE = 'America/Lima';

/**
 * Get current date/time in Peru timezone
 */
export function getPeruDate(): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: PERU_TIMEZONE }));
}

/**
 * Get current year in Peru timezone
 */
export function getPeruYear(): number {
    return getPeruDate().getFullYear();
}

/**
 * Get current month (1-12) in Peru timezone
 */
export function getPeruMonth(): number {
    return getPeruDate().getMonth() + 1;
}

/**
 * Get current ISO date string in Peru timezone (YYYY-MM-DD)
 */
export function getPeruDateISO(): string {
    const d = getPeruDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Get current ISO datetime string in Peru timezone
 */
export function getPeruDateTimeISO(): string {
    return new Date().toLocaleString('sv-SE', { timeZone: PERU_TIMEZONE }).replace(' ', 'T') + '-05:00';
}

/**
 * Format a date to Peru locale string
 */
export function formatPeruDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-PE', { timeZone: PERU_TIMEZONE, ...options });
}

/**
 * Format a date to Peru locale datetime string
 */
export function formatPeruDateTime(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('es-PE', { timeZone: PERU_TIMEZONE, ...options });
}

/**
 * Format date for display (e.g., "14 ene. 2026")
 */
export function formatPeruDateShort(date: Date | string): string {
    return formatPeruDate(date, { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Get YYYY-MM format for current month in Peru timezone
 */
export function getPeruMonthYearISO(): string {
    const d = getPeruDate();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Check if a date is in the past (Peru timezone)
 */
export function isExpiredPeru(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d < getPeruDate();
}

/**
 * Check if an order is delayed (more than 24 hours old, Peru timezone)
 */
export function isOrderDelayedPeru(orderDate: Date | string): boolean {
    const d = typeof orderDate === 'string' ? new Date(orderDate) : orderDate;
    const now = getPeruDate();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return d < oneDayAgo;
}

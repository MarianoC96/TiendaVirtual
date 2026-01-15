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
    let d = typeof date === 'string' ? new Date(date) : date;

    // Fix: If input is a plain date string "YYYY-MM-DD", new Date() treats it as UTC Midnight.
    // When converted to Peru (-5), it becomes the previous day (19:00).
    // We detect this case and force it to be interpreted as Peru Midnight.
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        d = new Date(`${date}T00:00:00-05:00`);
    }

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
/**
 * Check if an order is delayed (more than 24 hours old, Peru timezone)
 */
export function isOrderDelayedPeru(orderDate: Date | string): boolean {
    const d = typeof orderDate === 'string' ? new Date(orderDate) : orderDate;
    const now = getPeruDate();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return d < oneDayAgo;
}

/**
 * Check if a discount is active based on start/end dates in Peru Timezone
 * start_date: 'YYYY-MM-DD' (assumed 00:00:00)
 * end_date: 'YYYY-MM-DD' (assumed 23:59:59)
 */
export function checkDiscountActivePeru(startDateStr: string | null, endDateStr: string | null): boolean {
    // Get current time in Peru as a Date object (approximate, but close enough for comparison if we shift everything)
    // Actually, safest is to use ISO strings with strict offset -05:00

    // We get current time, convert to Peru ISO string, then parse back to get a timestamp "as if" it was UTC 
    // but representing Peru time, OR we just construct everything with -05:00.

    // Simplest approach: Use server 'now' but shift comparators to server's relative time or force strictly defined strings.
    // Let's rely on the method used in the Offers fix: Explicitly constructing ISO strings with -05:00.

    const now = new Date(); // Server current absolute time.

    // Check Start
    if (startDateStr) {
        // Ensure we catch "2026-01-12T00:00:00" -> "2026-01-12"
        const cleanStart = startDateStr.substring(0, 10);
        // If "2026-01-14", start is 2026-01-14T00:00:00-05:00
        const start = new Date(`${cleanStart}T00:00:00-05:00`);
        if (now < start) return false;
    }

    // Check End
    if (endDateStr) {
        const cleanEnd = endDateStr.substring(0, 10);
        // If "2026-01-14", end is 2026-01-14T23:59:59-05:00
        const end = new Date(`${cleanEnd}T23:59:59-05:00`);
        if (now > end) return false;
    }

    return true;
}

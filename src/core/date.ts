/**
 * Parse YYYY-MM-DD string to local midnight Date
 * @param ymd - Date string in YYYY-MM-DD format
 * @returns Date at local midnight or null if invalid
 */
export function parseYmdToLocalMidnight(ymd: string): Date | null {
  const parts = ymd.split('-');
  if (parts.length !== 3) {
    return null;
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day, 0, 0, 0, 0);
  
  // Validate the date is valid (handles invalid dates like Feb 30)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

/**
 * Format local Date to YYYY-MM-DD string
 * @param d - Date to format
 * @returns YYYY-MM-DD string
 */
export function formatLocalDateToYmd(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add years to a local Date
 * @param d - Base date
 * @param years - Number of years to add
 * @returns New Date with years added
 */
export function addYearsLocal(d: Date, years: number): Date {
  const result = new Date(d);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Get start of today at local midnight
 * @returns Date at local midnight for today
 */
export function startOfTodayLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Calculate difference in days between two dates (floor)
 * @param a - Later date
 * @param b - Earlier date
 * @returns Number of days (floor of (a-b)/dayMs)
 */
export function diffDaysLocal(a: Date, b: Date): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const diffMs = a.getTime() - b.getTime();
  return Math.floor(diffMs / dayMs);
}

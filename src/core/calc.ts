import { Prayer, PrayerMap, QadaState } from './types';
import {
  parseYmdToLocalMidnight,
  addYearsLocal,
  startOfTodayLocal,
  diffDaysLocal,
  formatLocalDateToYmd,
} from './date';

export interface InitialStateInput {
  birthDate: string; // YYYY-MM-DD
  startAge: number;
  percentMissed: PrayerMap; // 0..100
}

/**
 * Compute eligible days since (birthDate + startAge years)
 * @param birthDateYmd - Birth date in YYYY-MM-DD format
 * @param startAge - Age at which prayers became obligatory
 * @param today - Optional date to use as "today" (defaults to actual today)
 * @returns Number of eligible days, or 0 if invalid
 */
export function computeEligibleDays(
  birthDateYmd: string,
  startAge: number,
  today?: Date
): number {
  const birthDate = parseYmdToLocalMidnight(birthDateYmd);
  if (!birthDate) {
    return 0;
  }

  const startDate = addYearsLocal(birthDate, startAge);
  const todayMid = today || startOfTodayLocal();
  
  const days = diffDaysLocal(todayMid, startDate);
  return Math.max(0, days);
}

/**
 * Compute totals per prayer from eligible days and percent missed
 * @param eligibleDays - Number of eligible days
 * @param percentMissed - Percentage missed per prayer (0..100)
 * @returns PrayerMap with totals (ceil of eligibleDays * percent/100)
 */
export function computeTotals(
  eligibleDays: number,
  percentMissed: PrayerMap
): PrayerMap {
  const totals: PrayerMap = {} as PrayerMap;
  
  for (const prayer of ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA', 'WITR'] as Prayer[]) {
    const percent = Math.max(0, Math.min(100, percentMissed[prayer] || 0));
    totals[prayer] = Math.ceil(eligibleDays * (percent / 100));
  }
  
  return totals;
}

/**
 * Create initial QadaState from user input
 * @param input - User input data
 * @returns Valid QadaState or throws error if invalid
 */
export function createInitialState(input: InitialStateInput): QadaState {
  // Validate birthDate
  const birthDate = parseYmdToLocalMidnight(input.birthDate);
  if (!birthDate) {
    throw new Error('Invalid birth date');
  }

  // Clamp startAge >= 0
  const startAge = Math.max(0, Math.floor(input.startAge));

  // Clamp percent between 0..100
  const percentMissed: PrayerMap = {} as PrayerMap;
  for (const prayer of ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA', 'WITR'] as Prayer[]) {
    const percent = input.percentMissed[prayer] || 0;
    percentMissed[prayer] = Math.max(0, Math.min(100, percent));
  }

  // Compute eligible days
  const eligibleDays = computeEligibleDays(input.birthDate, startAge);
  if (eligibleDays === 0) {
    throw new Error('No eligible days (start date is in the future)');
  }

  // Compute totals
  const totals = computeTotals(eligibleDays, percentMissed);

  // Initialize remaining to totals
  const remaining: PrayerMap = { ...totals };

  // Set timestamps
  const now = new Date().toISOString();

  return {
    version: '0.2-mobile',
    birthDate: input.birthDate,
    startAge,
    percentMissed,
    eligibleDays,
    totals,
    remaining,
    createdAt: now,
    updatedAt: now,
  };
}

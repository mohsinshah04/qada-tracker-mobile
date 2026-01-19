export type Prayer = 'FAJR' | 'DHUHR' | 'ASR' | 'MAGHRIB' | 'ISHA' | 'WITR';

export const PRAYERS: Prayer[] = ['FAJR', 'DHUHR', 'ASR', 'MAGHRIB', 'ISHA', 'WITR'];

export type PrayerMap = Record<Prayer, number>;

export interface QadaState {
  version: '0.2-mobile';
  birthDate: string; // YYYY-MM-DD
  startAge: number; // default 12
  percentMissed: PrayerMap; // 0..100
  eligibleDays: number;
  totals: PrayerMap; // ceil(eligibleDays * percent/100)
  remaining: PrayerMap; // initialized to totals
  goalDate?: string; // YYYY-MM-DD optional (later used in Plan)
  milestonesSeen?: Partial<Record<'75' | '50' | '25' | '0', boolean>>;
  createdAt: string;
  updatedAt: string;
}

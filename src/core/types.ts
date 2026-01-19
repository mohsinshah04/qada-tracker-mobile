export type Prayer = 'FAJR' | 'DHUHR' | 'ASR' | 'MAGHRIB' | 'ISHA' | 'WITR';

export interface QadaState {
  version: '0.1-mobile';
  birthDate: string;
  startAge: number;
  remaining: Record<Prayer, number>;
  createdAt: string;
  updatedAt: string;
}

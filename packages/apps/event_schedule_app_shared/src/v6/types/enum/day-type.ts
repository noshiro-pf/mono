export type DayType = 'holiday' | 'normal' | 'Saturday' | 'Sunday';

export const isDayType = (a: unknown): a is DayType =>
  a === 'holiday' || a === 'normal' || a === 'Saturday' || a === 'Sunday';

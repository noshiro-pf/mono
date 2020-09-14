import { toTimestamp } from './to-timestamp';

export const toMidnight = (date: Date): Date => {
  const midnight = new Date(date);
  midnight.setHours(0, 0, 0, 0);
  return midnight;
};

export const toMidnightTimestamp = (date: Date): number =>
  toTimestamp(toMidnight(date));

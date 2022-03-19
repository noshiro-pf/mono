import { toTimestamp } from './to-timestamp';

export const toMidnight = (date: ReadonlyDate): Date => {
  const midnight = new Date(date as Date);

  midnight.setHours(0, 0, 0, 0);

  return midnight;
};

export const toMidnightTimestamp = (date: ReadonlyDate): number =>
  toTimestamp(toMidnight(date));

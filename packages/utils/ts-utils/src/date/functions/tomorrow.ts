import { DateEnum } from '../types';
import { getDate, setDate } from './date-wrapper';
import { toTimestamp } from './to-timestamp';

export const getTomorrow = (date: Date): Date =>
  new Date(setDate(date, (getDate(date) + 1) as DateEnum));

export const getTomorrowTimestamp = (date: Date): number =>
  toTimestamp(getTomorrow(date));

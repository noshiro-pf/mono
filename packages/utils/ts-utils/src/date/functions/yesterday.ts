import { DateEnum } from '../types';
import { getDate, setDate } from './date-wrapper';
import { toTimestamp } from './to-timestamp';

export const getYestereday = (date: Date): Date =>
  new Date(setDate(date, (getDate(date) - 1) as DateEnum));

export const getYesteredayTimestamp = (date: Date): number =>
  toTimestamp(getYestereday(date));

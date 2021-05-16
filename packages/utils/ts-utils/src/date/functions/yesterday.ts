import type { ReadonlyDate } from '../../types';
import type { DateEnum } from '../types';
import { getDate, setDate } from './date-wrapper';
import { toTimestamp } from './to-timestamp';

export const getYestereday = (date: ReadonlyDate): Date =>
  new Date(setDate(date, (getDate(date) - 1) as DateEnum));

export const getYesteredayTimestamp = (date: ReadonlyDate): number =>
  toTimestamp(getYestereday(date));

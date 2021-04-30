import { ReadonlyDate } from '../../types';
import { DateEnum } from '../types';
import { getDate, setDate } from './date-wrapper';
import { toTimestamp } from './to-timestamp';

export const getTomorrow = (date: ReadonlyDate): Date =>
  new Date(setDate(date, (getDate(date) + 1) as DateEnum));

export const getTomorrowTimestamp = (date: ReadonlyDate): number =>
  toTimestamp(getTomorrow(date));

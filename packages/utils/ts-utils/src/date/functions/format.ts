import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from './date-wrapper';
import { getSeconds } from './date-wrapper/seconds';

export const toYMD = (date: Date, delimiter: string = '/'): string =>
  [
    getYear(date),
    getMonth(date).toString().padStart(2, '0'),
    getDate(date).toString().padStart(2, '0'),
  ].join(delimiter);

export const toHM = (date: Date, delimiter: string = ':'): string =>
  [
    getHours(date).toString().padStart(2, '0'),
    getMinutes(date).toString().padStart(2, '0'),
  ].join(delimiter);

export const toHMS = (date: Date, delimiter: string = ':'): string =>
  [
    getHours(date).toString().padStart(2, '0'),
    getMinutes(date).toString().padStart(2, '0'),
    getSeconds(date).toString().padStart(2, '0'),
  ].join(delimiter);

export const toYMDHMS = (
  date: Date,
  delimiterForYMD: string = '/',
  delimiterForHMS: string = ':'
): string =>
  [toYMD(date, delimiterForYMD), toHMS(date, delimiterForHMS)].join(' ');

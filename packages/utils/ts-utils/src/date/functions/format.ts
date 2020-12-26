import {
  getDate,
  getHours,
  getMinutes,
  getMonth,
  getYear,
} from './date-wrapper';
import { getSeconds } from './date-wrapper/seconds';

const pad2 = (str: number): string => str.toString().padStart(2, '0');

export const toYMD = (date: Date, delimiter: string = '/'): string =>
  [getYear(date), pad2(getMonth(date)), pad2(getDate(date))].join(delimiter);

export const toHM = (date: Date, delimiter: string = ':'): string =>
  [pad2(getHours(date)), pad2(getMinutes(date))].join(delimiter);

export const toHMS = (date: Date, delimiter: string = ':'): string =>
  [pad2(getHours(date)), pad2(getMinutes(date)), pad2(getSeconds(date))].join(
    delimiter
  );

export const toYMDHMS = (
  date: Date,
  delimiterForYMD: string = '/',
  delimiterForHMS: string = ':'
): string =>
  [toYMD(date, delimiterForYMD), toHMS(date, delimiterForHMS)].join(' ');

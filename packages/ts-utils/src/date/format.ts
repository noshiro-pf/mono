import { DateLikeType } from './date-like-type';
import { toDate } from './to-date-object';

export const toYMD = (
  dateLikeValue: DateLikeType,
  delimiter: string = '/'
): string => {
  const dt = toDate(dateLikeValue);
  return [
    dt.getFullYear(),
    (dt.getMonth() + 1).toString().padStart(2, '0'),
    dt.getDate().toString().padStart(2, '0'),
  ].join(delimiter);
};

export const toHM = (
  dateLikeValue: DateLikeType,
  delimiter: string = ':'
): string => {
  const dt = toDate(dateLikeValue);
  return [
    dt.getHours().toString().padStart(2, '0'),
    dt.getMinutes().toString().padStart(2, '0'),
  ].join(delimiter);
};

const toHMS = (
  dateLikeValue: DateLikeType,
  delimiter: string = ':'
): string => {
  const dt = toDate(dateLikeValue);
  return [
    dt.getHours().toString().padStart(2, '0'),
    dt.getMinutes().toString().padStart(2, '0'),
    dt.getSeconds().toString().padStart(2, '0'),
  ].join(delimiter);
};

export const toYMDHMS = (
  dateLikeValue: DateLikeType,
  delimiterForYMD: string = '/',
  delimiterForHMS: string = ':'
): string =>
  [
    toYMD(dateLikeValue, delimiterForYMD),
    toHMS(dateLikeValue, delimiterForHMS),
  ].join(' ');

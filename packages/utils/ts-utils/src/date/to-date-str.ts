import { DateLikeType } from './date-like-type';

export const toStr = (d: DateLikeType): string =>
  typeof d === 'string'
    ? d
    : typeof d === 'number'
    ? new Date(d).toString()
    : d.toString();

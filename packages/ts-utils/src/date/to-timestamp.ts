import { DateLikeType } from './date-like-type';

export const toTimestamp = (d: DateLikeType): number =>
  typeof d === 'number'
    ? d
    : typeof d === 'string'
    ? new Date(d).getTime()
    : d.getTime();

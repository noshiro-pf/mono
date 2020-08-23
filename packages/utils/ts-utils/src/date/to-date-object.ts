import { DateLikeType } from './date-like-type';

export const toDate = (d: DateLikeType): Date =>
  typeof d === 'number' || typeof d === 'string' ? new Date(d) : d;

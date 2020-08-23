import { DateLikeType } from './date-like-type';
import { toDate } from './to-date-object';

export const daysJp = ['日', '月', '火', '水', '木', '金', '土'];
export const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat'];

export const getDay = (dateLikeValue: DateLikeType): number =>
  toDate(dateLikeValue).getDay();

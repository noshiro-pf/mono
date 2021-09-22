import { dateCmp } from './cmp';
import { today } from './today';

export const isToday = (date: ReadonlyDate): boolean =>
  dateCmp(date, today()) === 0;

import { dateCmp } from './cmp';
import { today } from './today';

export const isToday = (date: Date): boolean => dateCmp(date, today()) === 0;

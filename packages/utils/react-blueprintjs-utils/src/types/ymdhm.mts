import { type HoursMinutes } from './hours-minutes.mjs';
import { type YearMonthDate } from './year-month-date.mjs';

// eslint-disable-next-line @typescript-eslint/sort-type-constituents
export type Ymdhm = YearMonthDate & HoursMinutes;

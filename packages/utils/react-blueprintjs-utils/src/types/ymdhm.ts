import type { HoursMinutes } from './hours-minutes';
import type { YearMonthDate } from './year-month-date';

// eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
export type Ymdhm = YearMonthDate & HoursMinutes;

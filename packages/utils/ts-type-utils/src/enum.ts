import { type PositiveInteger } from './branded-types';
import { type Index } from './index-type';
import { type StrictExclude } from './utils';

export type YearEnum = PositiveInteger;

export type MonthEnum = StrictExclude<Index<13>, 0>;

export type DateEnum = StrictExclude<Index<32>, 0>;

export type DayOfWeekIndex = Index<7>;

export type DayOfWeekName =
  // eslint-disable-next-line @typescript-eslint/sort-type-constituents
  'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thr' | 'Fri' | 'Sat';

export type HoursEnum = Index<24>;

export type MinutesEnum = Index<60>;

export type SecondsEnum = Index<60>;

export type MillisecondsEnum = Index<1000>;

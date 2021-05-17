import type {
  DateEnum,
  HoursEnum,
  MinutesEnum,
  MonthEnum,
  SecondsEnum,
  YearEnum,
} from '../types';

export const newDate = (
  year: YearEnum,
  month: MonthEnum,
  date: DateEnum = 1,
  hours: HoursEnum = 0,
  minutes: MinutesEnum = 0,
  seconds: SecondsEnum = 0,
  ms: number = 0
): Date => new Date(year, month - 1, date, hours, minutes, seconds, ms);

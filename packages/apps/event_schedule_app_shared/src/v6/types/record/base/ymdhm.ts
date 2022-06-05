import { IDate, IRecord, isRecord, Num } from '@noshiro/ts-utils';
import {
  hoursMinutesDefaultValue,
  isHoursEnum,
  isMinutesEnum,
} from './hours-minutes';
import {
  isDateEnum,
  isMonthEnum,
  isYearEnum,
  yearMonthDateDefaultValue,
} from './year-month-date';

export type Ymdhm = Readonly<{
  year: YearEnum;
  month: MonthEnum;
  date: DateEnum;
  hours: HoursEnum;
  minutes: MinutesEnum;
}>;

export const ymdhmDefaultValue: Ymdhm = {
  year: yearMonthDateDefaultValue.year,
  month: yearMonthDateDefaultValue.month,
  date: yearMonthDateDefaultValue.date,
  hours: hoursMinutesDefaultValue.hours,
  minutes: hoursMinutesDefaultValue.minutes,
};

export const isYmdhm = (a: unknown): a is Ymdhm =>
  isRecord(a) &&
  IRecord.hasKeyValue(a, 'year', isYearEnum) &&
  IRecord.hasKeyValue(a, 'month', isMonthEnum) &&
  IRecord.hasKeyValue(a, 'date', isDateEnum) &&
  IRecord.hasKeyValue(a, 'hours', isHoursEnum) &&
  IRecord.hasKeyValue(a, 'minutes', isMinutesEnum);

const d = ymdhmDefaultValue;

export const fillYmdhm = (a?: unknown): Ymdhm =>
  a === undefined || !isRecord(a)
    ? d
    : {
        year: IRecord.hasKeyValue(a, 'year', isYearEnum) ? a.year : d.year,
        month: IRecord.hasKeyValue(a, 'month', isMonthEnum) ? a.month : d.month,
        date: IRecord.hasKeyValue(a, 'date', isDateEnum) ? a.date : d.date,
        hours: IRecord.hasKeyValue(a, 'hours', isHoursEnum) ? a.hours : d.hours,
        minutes: IRecord.hasKeyValue(a, 'minutes', isMinutesEnum)
          ? a.minutes
          : d.minutes,
      };

export const ymdhmFromDate = (date: RawDateType): Ymdhm => ({
  year: IDate.getLocaleYear(date),
  month: IDate.getLocaleMonth(date),
  date: IDate.getLocaleDate(date),
  hours: IDate.getLocaleHours(date),
  minutes: IDate.getLocaleMinutes(date),
});

export const ymdhm2Date = (ymdhm: Ymdhm): IDate =>
  IDate.create(ymdhm.year, ymdhm.month, ymdhm.date, ymdhm.hours, ymdhm.minutes);

export const compareYmdhm = (a: Ymdhm, b: Ymdhm): -1 | 0 | 1 => {
  if (a.year !== b.year) return Num.sign(a.year - b.year);
  if (a.month !== b.month) return Num.sign(a.month - b.month);
  if (a.date !== b.date) return Num.sign(a.date - b.date);
  if (a.hours !== b.hours) return Num.sign(a.hours - b.hours);
  if (a.minutes !== b.minutes) return Num.sign(a.minutes - b.minutes);
  return 0;
};

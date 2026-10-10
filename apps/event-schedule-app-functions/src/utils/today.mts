import { pipe } from 'ts-data-forge';
import { DateUtils, type YearMonthDate, type Ymdhm } from 'ts-fortress-types';

const todayDate = (): Date => {
  const japanLocaleString = DateUtils.today().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  });

  return DateUtils.from(japanLocaleString);
};

export const today = (): YearMonthDate =>
  ({
    year: pipe(todayDate()).map(DateUtils.getLocaleYear).value,
    month: pipe(todayDate()).map(DateUtils.getLocaleMonth).value,
    date: pipe(todayDate()).map(DateUtils.getLocaleDate).value,
  }) as const;

export const now = (): Ymdhm =>
  ({
    year: pipe(todayDate()).map(DateUtils.getLocaleYear).value,
    month: pipe(todayDate()).map(DateUtils.getLocaleMonth).value,
    date: pipe(todayDate()).map(DateUtils.getLocaleDate).value,
    hours: pipe(todayDate()).map(DateUtils.getLocaleHours).value,
    minutes: pipe(todayDate()).map(DateUtils.getLocaleMinutes).value,
  }) as const;

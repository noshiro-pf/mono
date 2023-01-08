import type { YearMonthDate, Ymdhm } from '@noshiro/event-schedule-app-shared';
import { DateUtils, pipe } from '@noshiro/ts-utils';

const todayDate = (): DateUtils => {
  const japanLocaleString = DateUtils.today().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  });
  return DateUtils.from(japanLocaleString);
};

export const today = (): YearMonthDate => ({
  year: pipe(todayDate()).chain(DateUtils.getLocaleYear).value,
  month: pipe(todayDate()).chain(DateUtils.getLocaleMonth).value,
  date: pipe(todayDate()).chain(DateUtils.getLocaleDate).value,
});

export const now = (): Ymdhm => ({
  year: pipe(todayDate()).chain(DateUtils.getLocaleYear).value,
  month: pipe(todayDate()).chain(DateUtils.getLocaleMonth).value,
  date: pipe(todayDate()).chain(DateUtils.getLocaleDate).value,
  hours: pipe(todayDate()).chain(DateUtils.getLocaleHours).value,
  minutes: pipe(todayDate()).chain(DateUtils.getLocaleMinutes).value,
});

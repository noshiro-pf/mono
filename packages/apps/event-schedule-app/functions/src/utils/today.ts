import type { YearMonthDate, Ymdhm } from '@noshiro/event-schedule-app-shared';
import { IDate, pipe } from '@noshiro/ts-utils';

const todayDate = (): IDate => {
  const japanLocaleString = IDate.today().toLocaleString('ja-JP', {
    timeZone: 'Asia/Tokyo',
  });
  return IDate.from(japanLocaleString);
};

export const today = (): YearMonthDate => ({
  year: pipe(todayDate()).chain(IDate.getLocaleYear).value,
  month: pipe(todayDate()).chain(IDate.getLocaleMonth).value,
  date: pipe(todayDate()).chain(IDate.getLocaleDate).value,
});

export const now = (): Ymdhm => ({
  year: pipe(todayDate()).chain(IDate.getLocaleYear).value,
  month: pipe(todayDate()).chain(IDate.getLocaleMonth).value,
  date: pipe(todayDate()).chain(IDate.getLocaleDate).value,
  hours: pipe(todayDate()).chain(IDate.getLocaleHours).value,
  minutes: pipe(todayDate()).chain(IDate.getLocaleMinutes).value,
});

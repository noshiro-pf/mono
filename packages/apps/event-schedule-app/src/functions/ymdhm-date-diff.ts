import { ymdhm2Date } from '@noshiro/event-schedule-app-shared';

export const ymdhmDateDiff = (a: Ymdhm, b: Ymdhm): number => {
  const diff =
    pipe(a).chain(ymdhm2Date).chain(IDate.toMidnight).chain(IDate.toTimestamp)
      .value -
    pipe(b).chain(ymdhm2Date).chain(IDate.toMidnight).chain(IDate.toTimestamp)
      .value;
  return Math.round(diff / (24 * 60 * 60 * 1000));
};

import { ymdhm2Date } from '@noshiro/event-schedule-app-shared';

export const ymdhmDateDiff = (a: Ymdhm, b: Ymdhm): number => {
  const diff =
    pipe(a)
      .chain(ymdhm2Date)
      .chain(DateUtils.toMidnight)
      .chain(DateUtils.toTimestamp).value -
    pipe(b)
      .chain(ymdhm2Date)
      .chain(DateUtils.toMidnight)
      .chain(DateUtils.toTimestamp).value;
  return Math.round(Num.div(diff, toPositiveSafeInt(24 * 60 * 60 * 1000)));
};

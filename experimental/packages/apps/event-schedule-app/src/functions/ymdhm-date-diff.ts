import { Ymdhm2Date } from '@noshiro/io-ts-types';

export const ymdhmDateDiff = (a: Ymdhm, b: Ymdhm): number => {
  const diff =
    pipe(a)
      .chain(Ymdhm2Date)
      .chain(DateUtils.toMidnight)
      .chain(DateUtils.toTimestamp).value -
    pipe(b)
      .chain(Ymdhm2Date)
      .chain(DateUtils.toMidnight)
      .chain(DateUtils.toTimestamp).value;
  return Math.round(Num.div(diff, toPositiveSafeInt(24 * 60 * 60 * 1000)));
};

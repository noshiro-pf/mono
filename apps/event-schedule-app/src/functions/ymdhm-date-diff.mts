import { Num, asPositiveSafeInt, pipe } from 'ts-data-forge';
import { DateUtils, Ymdhm2Date } from 'ts-fortress-types';

export const ymdhmDateDiff = (a: Ymdhm, b: Ymdhm): number => {
  const diff =
    pipe(a).map(Ymdhm2Date).map(DateUtils.toMidnight).map(DateUtils.toTimestamp)
      .value -
    pipe(b).map(Ymdhm2Date).map(DateUtils.toMidnight).map(DateUtils.toTimestamp)
      .value;

  return Math.round(Num.div(diff, asPositiveSafeInt(24 * 60 * 60 * 1000)));
};

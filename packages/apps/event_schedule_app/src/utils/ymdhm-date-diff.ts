import { toMidnightTimestamp } from '@noshiro/ts-utils';
import type { IYmdHm } from '../types/record/ymd-hm';
import { ymdhm2Date } from './ymdhm2date';

export const ymdhmDateDiff = (a: IYmdHm, b: IYmdHm): number => {
  const diff =
    toMidnightTimestamp(ymdhm2Date(a)) - toMidnightTimestamp(ymdhm2Date(b));
  return Math.round(diff / (24 * 60 * 60 * 1000));
};

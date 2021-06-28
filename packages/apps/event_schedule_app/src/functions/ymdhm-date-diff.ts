import type { Ymdhm } from '@noshiro/event-schedule-app-shared';
import { ymdhm2Date } from '@noshiro/event-schedule-app-shared';
import { toMidnightTimestamp } from '@noshiro/ts-utils';

export const ymdhmDateDiff = (a: Ymdhm, b: Ymdhm): number => {
  const diff =
    toMidnightTimestamp(ymdhm2Date(a)) - toMidnightTimestamp(ymdhm2Date(b));
  return Math.round(diff / (24 * 60 * 60 * 1000));
};

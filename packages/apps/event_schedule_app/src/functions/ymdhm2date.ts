import { newDate } from '@noshiro/ts-utils';
import type { IYmdHm } from '../types';

export const ymdhm2Date = (ymdhm: IYmdHm): Date =>
  newDate(
    ymdhm.ymd.year,
    ymdhm.ymd.month,
    ymdhm.ymd.date,
    ymdhm.hm.hours,
    ymdhm.hm.minutes
  );

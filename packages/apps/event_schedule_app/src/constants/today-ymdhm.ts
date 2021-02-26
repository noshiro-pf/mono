import { today } from '@noshiro/ts-utils';
import { ymdhmFromDate } from '../utils/ymdhm-from-date';

export const todayYmdhm = ymdhmFromDate(today());

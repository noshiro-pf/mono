import { IYearMonthDate } from '../types/record/base/year-month-date';
import { IYmdHm } from '../types/record/ymd-hm';
import { ymd2str, ymdhm2str } from './ymdhm2str';

export const ymd2Date = (ymd: IYearMonthDate): Date => new Date(ymd2str(ymd));

export const ymdhm2Date = (ymdhm: IYmdHm): Date => new Date(ymdhm2str(ymdhm));

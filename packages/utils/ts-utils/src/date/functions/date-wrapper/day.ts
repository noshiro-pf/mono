import type { WeekDayEnum } from '../../types';

export const getDay = (dateLikeValue: ReadonlyDate): WeekDayEnum =>
  dateLikeValue.getDay() as WeekDayEnum;

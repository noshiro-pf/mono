import { WeekDayEnum } from '../../types';

export const getDay = (dateLikeValue: Date): WeekDayEnum =>
  dateLikeValue.getDay() as WeekDayEnum;

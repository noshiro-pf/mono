import { pipe } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import type { DateEnum } from 'ts-type-forge';

/** 23:59 on the day of `date`. */
export const endOfDay = (date: Date): Date =>
  pipe(date)
    .map(DateUtils.setLocaleHours(23))
    .map(DateUtils.setLocaleMinutes(59)).value;

/** The same time `days` days later. */
export const addDays =
  (days: number) =>
  (date: Date): Date =>
    DateUtils.updateLocaleDate(
      (v) =>
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (v + days) as DateEnum,
    )(date);

/** 23:59 on the day `days` after `today`. */
export const endOfDaysLater = (today: Date, days: number): Date =>
  endOfDay(addDays(days)(today));

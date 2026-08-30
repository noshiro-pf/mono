import { pipe } from 'ts-data-forge';
import { DateUtils } from 'ts-fortress-types';
import { type DateEnum, type MonthEnum } from 'ts-type-forge';
import { idfn } from '../utils-ported/index.mjs';

const createDate = (modifier: (d: Date) => Date): Date =>
  pipe(DateUtils.today())
    .map(modifier)
    .map(DateUtils.setLocaleHours(23))
    .map(DateUtils.setLocaleMinutes(59))
    .map(DateUtils.toDate).value;

export const answerDeadlineShortcuts: readonly DatePickerShortcut[] = [
  { date: createDate(idfn), label: 'Today', includeTime: true },
  {
    date: createDate(
      DateUtils.updateLocaleDate(
        (v) =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          (v + 1) as DateEnum,
      ),
    ),
    label: 'Tomorrow',
    includeTime: true,
  },
  {
    date: createDate(
      DateUtils.updateLocaleDate(
        (v) =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          (v + 7) as DateEnum,
      ),
    ),
    label: '1 week later',
    includeTime: true,
  },
  {
    date: createDate(
      DateUtils.updateLocaleDate(
        (v) =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          (v + 14) as DateEnum,
      ),
    ),
    label: '2 week later',
    includeTime: true,
  },
  {
    date: createDate(
      DateUtils.updateLocaleMonth(
        (v) =>
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          (v + 1) as MonthEnum,
      ),
    ),
    label: '1 month later',
    includeTime: true,
  },
] as const;

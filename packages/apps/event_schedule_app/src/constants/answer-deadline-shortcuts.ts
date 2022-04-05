import type { DatePickerShortcut } from '@blueprintjs/datetime';
import { IDate, pipe } from '@noshiro/ts-utils';

// eslint-disable-next-line @typescript-eslint/ban-types
const createDate = (modifier: (d: IDate) => IDate): Date =>
  pipe(IDate.today())
    .chain(modifier)
    .chain(IDate.setLocaleHours(23))
    .chain(IDate.setLocaleMinutes(59))
    .chain(IDate.toDate).value;

export const answerDeadlineShortcuts: readonly DatePickerShortcut[] = [
  {
    date: createDate(IDate.updateLocaleDate((v) => v)),
    label: 'Today',
    includeTime: true,
  },
  {
    date: createDate(IDate.updateLocaleDate((v) => (v + 1) as DateEnum)),
    label: 'Tomorrow',
    includeTime: true,
  },
  {
    date: createDate(IDate.updateLocaleDate((v) => (v + 7) as DateEnum)),
    label: '1 week later',
    includeTime: true,
  },
  {
    date: createDate(IDate.updateLocaleDate((v) => (v + 14) as DateEnum)),
    label: '2 week later',
    includeTime: true,
  },
  {
    date: createDate(IDate.updateLocaleMonth((v) => (v + 1) as MonthEnum)),
    label: '1 month later',
    includeTime: true,
  },
];

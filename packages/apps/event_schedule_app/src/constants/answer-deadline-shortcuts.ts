import type { DatePickerShortcut } from '@blueprintjs/datetime';
import type { DateEnum, MonthEnum, ReadonlyDate } from '@noshiro/ts-utils';
import {
  pipe,
  setHours,
  setMinutes,
  updateDate,
  updateMonth,
} from '@noshiro/ts-utils';

const today = new Date();

const createDate = (modifier: (d: ReadonlyDate) => Date): Date =>
  pipe(today)
    .chain(modifier)
    .chain((d) => setHours(d, 23))
    .chain((d) => setMinutes(d, 59)).value;

export const answerDeadlineShortcuts: DatePickerShortcut[] = [
  {
    date: createDate((d) => updateDate(d, (v) => v)),
    label: 'Today',
    includeTime: true,
  },
  {
    date: createDate((d) => updateDate(d, (v) => (v + 1) as DateEnum)),
    label: 'Tomorrow',
    includeTime: true,
  },
  {
    date: createDate((d) => updateDate(d, (v) => (v + 7) as DateEnum)),
    label: '1 week later',
    includeTime: true,
  },
  {
    date: createDate((d) => updateDate(d, (v) => (v + 14) as DateEnum)),
    label: '2 week later',
    includeTime: true,
  },
  {
    date: createDate((d) => updateMonth(d, (v) => (v + 1) as MonthEnum)),
    label: '1 month later',
    includeTime: true,
  },
];

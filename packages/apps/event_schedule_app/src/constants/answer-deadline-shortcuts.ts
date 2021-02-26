import { IDatePickerShortcut } from '@blueprintjs/datetime';
import {
  DateEnum,
  MonthEnum,
  pipe,
  setHours,
  setMinutes,
  updateDate,
  updateMonth,
} from '@noshiro/ts-utils';

const today = new Date();

const createDate = (modifier: (d: Date) => Date): Date =>
  pipe(
    today,
    modifier,
    (d) => setHours(d, 23),
    (d) => setMinutes(d, 59)
  );

export const answerDeadlineShortcuts: IDatePickerShortcut[] = [
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

import type { DatePickerShortcut } from '@blueprintjs/datetime';
import { DateUtils } from 'ts-fortress-types';
import type { MonthEnum } from 'ts-type-forge';
import { addDays, endOfDay } from '../utils/index.mjs';

/**
 * The answer-deadline picker's shortcuts, counted from `today` and ending at
 * 23:59. Built where the picker opens, so that a tab left open past midnight
 * counts from the day the user is working, not the day the page loaded.
 */
export const createAnswerDeadlineShortcuts = (
  today: Date,
): readonly DatePickerShortcut[] =>
  shortcuts.map(({ label, shift }) => ({
    date: endOfDay(shift(today)),
    label,
    includeTime: true,
  }));

const shortcuts = [
  { label: 'Today', shift: addDays(0) },
  { label: 'Tomorrow', shift: addDays(1) },
  { label: '1 week later', shift: addDays(7) },
  { label: '2 week later', shift: addDays(14) },
  {
    label: '1 month later',
    shift: DateUtils.updateLocaleMonth(
      (v) =>
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        (v + 1) as MonthEnum,
    ),
  },
] as const satisfies readonly Readonly<{
  label: string;
  shift: (date: Date) => Date;
}>[];

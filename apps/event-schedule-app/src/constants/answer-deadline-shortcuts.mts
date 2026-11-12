import {
  addDays,
  addMonths,
  toDateTimeValue,
  wallClockOf,
  type DatePickerShortcut,
  type WallClock,
} from 'blueprint-synstate';
import { endOfDay } from '../utils/index.mjs';

/**
 * The answer-deadline picker's shortcuts, counted from `today` and ending at
 * 23:59. Built where the picker opens, so that a tab left open past midnight
 * counts from the day the user is working, not the day the page loaded.
 */
export const createAnswerDeadlineShortcuts = (
  today: Date,
): readonly DatePickerShortcut[] => {
  const clock = wallClockOf(today);

  return shortcuts.map(({ label, shift }) => ({
    value: toDateTimeValue(endOfDay(shift(clock))),
    label,
    includeTime: true,
  }));
};

const shortcuts = [
  { label: 'Today', shift: (clock) => clock },
  { label: 'Tomorrow', shift: (clock) => addDays(clock, 1) },
  { label: '1 week later', shift: (clock) => addDays(clock, 7) },
  { label: '2 week later', shift: (clock) => addDays(clock, 14) },
  { label: '1 month later', shift: (clock) => addMonths(clock, 1) },
] as const satisfies readonly Readonly<{
  label: string;
  shift: (clock: WallClock) => WallClock;
}>[];

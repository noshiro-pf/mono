import {
  addDays,
  addMonths,
  dayOfWeek,
  type WallClock,
} from './wall-clock.mjs';

/**
 * The day a key moves a calendar's focus to from `from`, as react-day-picker
 * moves it, or `undefined` for a key that does not: the arrows by a day and a
 * week, PageUp and PageDown by a month (a year with Shift), Home and End to the
 * ends of the week that begins on `weekStartsOn` (0 for Sunday).
 */
export const dayAfterKey = (
  from: WallClock,
  event: Readonly<{ key: string; shiftKey: boolean }>,
  weekStartsOn: number,
): WallClock | undefined => {
  const fromWeekStart = (dayOfWeek(from) - weekStartsOn + 7) % 7;

  switch (event.key) {
    case 'ArrowLeft':
      return addDays(from, -1);

    case 'ArrowRight':
      return addDays(from, 1);

    case 'ArrowUp':
      return addDays(from, -7);

    case 'ArrowDown':
      return addDays(from, 7);

    case 'PageUp':
      return addMonths(from, event.shiftKey ? -12 : -1);

    case 'PageDown':
      return addMonths(from, event.shiftKey ? 12 : 1);

    case 'Home':
      return addDays(from, -fromWeekStart);

    case 'End':
      return addDays(from, 6 - fromWeekStart);

    default:
      return undefined;
  }
};

if (import.meta.vitest !== undefined) {
  describe(dayAfterKey, () => {
    // A Friday.
    const friday = {
      year: 2026,
      month: 10,
      day: 23,
      hour: 0,
      minute: 0,
    } as const;

    test.each([
      ['ArrowLeft', false, 22],
      ['ArrowRight', false, 24],
      ['ArrowUp', false, 16],
      ['ArrowDown', false, 30],
      ['Home', false, 18],
      ['End', false, 24],
    ] as const)('%s moves to the %ist', (key, shiftKey, day) => {
      assert.deepStrictEqual(dayAfterKey(friday, { key, shiftKey }, 0), {
        ...friday,
        day,
      });
    });

    test('PageDown moves by a month, and by a year with Shift', () => {
      assert.deepStrictEqual(
        dayAfterKey(friday, { key: 'PageDown', shiftKey: false }, 0),
        { ...friday, month: 11 },
      );

      assert.deepStrictEqual(
        dayAfterKey(friday, { key: 'PageDown', shiftKey: true }, 0),
        { ...friday, year: 2027 },
      );
    });

    test('Home goes to the first day of the week asked for', () => {
      assert.deepStrictEqual(
        dayAfterKey(friday, { key: 'Home', shiftKey: false }, 1),
        { ...friday, day: 19 },
      );
    });

    test('other keys do not move', () => {
      assert.isUndefined(dayAfterKey(friday, { key: 'a', shiftKey: false }, 0));
    });
  });
}

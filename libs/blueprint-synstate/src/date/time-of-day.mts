import { parseInteger } from '../internal/index.mjs';

/** An hour (0 to 23) and a minute (0 to 59). */
export type TimeOfDay = Readonly<{ hour: number; minute: number }>;

/** The largest value of each unit of a {@link TimeOfDay}. */
export const TIME_UNIT_MAX = { hour: 23, minute: 59 } as const;

/** The {@link TimeOfDay} of a `HH:mm`, and 0:00 for anything else. */
export const parseTime = (value: string): TimeOfDay => {
  const matched = /^(\d{2}):(\d{2})/u.exec(value);

  const hour = parseInteger(matched?.[1] ?? '0');

  const minute = parseInteger(matched?.[2] ?? '0');

  return hour <= TIME_UNIT_MAX.hour && minute <= TIME_UNIT_MAX.minute
    ? { hour, minute }
    : MIDNIGHT;
};

/** `HH:mm`, the value of `<input type="time">`. */
export const formatTime = ({ hour, minute }: TimeOfDay): string =>
  `${pad2(hour)}:${pad2(minute)}` as const;

/** Whether `text` is a base-10 integer that `unit` can be. */
export const isTimeUnitText = (
  unit: keyof typeof TIME_UNIT_MAX,
  text: string,
): boolean => {
  const parsed = parseInteger(text);

  return !Number.isNaN(parsed) && 0 <= parsed && parsed <= TIME_UNIT_MAX[unit];
};

/** `value` in two digits at least. */
export const pad2 = (value: number): string =>
  value.toString().padStart(2, '0');

const MIDNIGHT: TimeOfDay = { hour: 0, minute: 0 } as const;

if (import.meta.vitest !== undefined) {
  describe(parseTime, () => {
    test('reads the hour and the minute', () => {
      assert.deepStrictEqual(parseTime('09:05'), { hour: 9, minute: 5 });
    });

    test.each(['', '9:05', '24:00', 'noon'])('reads %j as 0:00', (value) => {
      assert.deepStrictEqual(parseTime(value), MIDNIGHT);
    });
  });

  describe(isTimeUnitText, () => {
    test.each([
      ['hour', '0', true],
      ['hour', '23', true],
      ['hour', '24', false],
      ['minute', '59', true],
      ['minute', '60', false],
      ['minute', '', false],
      ['minute', '-1', false],
      ['minute', '5x', false],
    ] as const)('%s %j is %s', (unit, text, expected) => {
      assert.strictEqual(isTimeUnitText(unit, text), expected);
    });
  });
}

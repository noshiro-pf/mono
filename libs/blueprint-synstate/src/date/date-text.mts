import { Optional } from 'ts-data-forge';
import { parseInteger } from '../internal/index.mjs';
import { wallClockFromParts, type WallClock } from './wall-clock.mjs';

/**
 * How finely a picker sets the time: `'minute'` for hours and minutes, and
 * `undefined` for a date alone, the value then `YYYY-MM-DD`. Blueprint's
 * `TimePrecision`, to the minute only.
 */
export type TimePrecision = 'minute' | undefined;

/**
 * What a `DateInput` shows for `clock` when none is given:
 * `yyyy/MM/dd HH:mm`, or `yyyy/MM/dd` without the time.
 */
export const formatDateText = (
  clock: WallClock,
  timePrecision: TimePrecision,
): string => {
  const date =
    `${pad(clock.year, 4)}/${pad(clock.month, 2)}/${pad(clock.day, 2)}` as const;

  return timePrecision === 'minute'
    ? `${date} ${pad(clock.hour, 2)}:${pad(clock.minute, 2)}`
    : date;
};

/**
 * What a `DateInput` reads from its text when nothing else is given: a date
 * with `/` or `-` between year, month and day, one or two digits for the
 * month and the day, then, after a space or `T`, the time as `H:mm` if at
 * all; spaces around it are ignored. A date alone is at
 * 00:00, and the time is dropped where `timePrecision` sets none.
 */
export const parseDateText = (
  text: string,
  timePrecision: TimePrecision,
): Optional<WallClock> => {
  const normalized = text.trim().replaceAll(/\s+/gu, ' ');

  const matched =
    DATE_TIME_PATTERN.exec(normalized) ?? DATE_PATTERN.exec(normalized);

  if (matched === null) {
    return Optional.none;
  }

  const [, year = '', month = '', day = '', hour = '0', minute = '0'] = matched;

  const withTime = timePrecision === 'minute';

  return wallClockFromParts({
    year: parseInteger(year),
    month: parseInteger(month),
    day: parseInteger(day),
    hour: withTime ? parseInteger(hour) : 0,
    minute: withTime ? parseInteger(minute) : 0,
  });
};

/** Read once the spaces are trimmed and each run of them made one. */
const DATE_PATTERN = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/u;

const DATE_TIME_PATTERN =
  /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})[ T](\d{1,2}):(\d{2})$/u;

const pad = (value: number, width: number): string =>
  value.toString().padStart(width, '0');

if (import.meta.vitest !== undefined) {
  const clock = { year: 2026, month: 10, day: 9, hour: 8, minute: 5 } as const;

  describe(formatDateText, () => {
    test('writes the date and the time', () => {
      assert.strictEqual(formatDateText(clock, 'minute'), '2026/10/09 08:05');
    });

    test('writes the date alone without a precision', () => {
      assert.strictEqual(formatDateText(clock, undefined), '2026/10/09');
    });
  });

  describe(parseDateText, () => {
    test('reads what it writes', () => {
      assert.deepStrictEqual(
        parseDateText(formatDateText(clock, 'minute'), 'minute'),
        Optional.some(clock),
      );
    });

    test.each(['2026-10-9 8:05', ' 2026/10/09T08:05 '])('reads %j', (text) => {
      assert.deepStrictEqual(
        parseDateText(text, 'minute'),
        Optional.some(clock),
      );
    });

    test('reads a date alone as 00:00', () => {
      assert.deepStrictEqual(
        parseDateText('2026/10/09', 'minute'),
        Optional.some({ ...clock, hour: 0, minute: 0 }),
      );
    });

    test('drops the time without a precision', () => {
      assert.deepStrictEqual(
        parseDateText('2026/10/09 08:05', undefined),
        Optional.some({ ...clock, hour: 0, minute: 0 }),
      );
    });

    test.each(['', '2026/10', '2026/02/30', '2026/10/09 25:00', 'tomorrow'])(
      'rejects %j',
      (text) => {
        assert.isTrue(Optional.isNone(parseDateText(text, 'minute')));
      },
    );
  });
}

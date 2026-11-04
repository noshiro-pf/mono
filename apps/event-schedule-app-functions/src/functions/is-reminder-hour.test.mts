import { Arr } from 'ts-data-forge';
import { isReminderHour } from './is-reminder-hour.mjs';

/** The 24 hourly runs of the day starting at `from`. */
const hourly = (from: string): readonly number[] =>
  Arr.seq(24).map((i) => Date.parse(from) + i * 3_600_000);

describe(isReminderHour, () => {
  test.each([
    ['Tokyo', -540, '2026-11-01T03:00:00Z'],
    ['New York', 300, '2026-11-01T17:00:00Z'],
    // A zone half an hour off UTC is reminded at 12:30.
    ['India', -330, '2026-11-01T07:00:00Z'],
  ] as const)(
    'is true in one hourly run a day, at noon in %s',
    (_, offset, noonRun) => {
      const runs = hourly('2026-11-01T00:00:00Z').filter((run) =>
        isReminderHour(run, offset),
      );

      assert.deepStrictEqual(runs, [Date.parse(noonRun)]);
    },
  );
});

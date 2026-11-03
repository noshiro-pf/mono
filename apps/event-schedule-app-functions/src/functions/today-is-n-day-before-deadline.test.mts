// cspell:ignore unstub
import { asSafeUint } from 'ts-data-forge';
import { todayIsNDaysBeforeDeadline } from './today-is-n-day-before-deadline.mjs';

describe(todayIsNDaysBeforeDeadline, () => {
  const deadline = {
    year: asSafeUint(2026),
    month: 11,
    date: 1,
    hours: 18,
    minutes: 0,
  } as const;

  const newYork = 300;

  test("counts the days in the event's own zone", () => {
    vi.stubEnv('TZ', 'Asia/Tokyo');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    // 12:00 in Tokyo on 1 November is 22:00 on 31 October in New York: the
    // day before the deadline there, although Tokyo's date is the day itself.
    const tokyoNoon = Date.parse('2026-11-01T03:00:00Z');

    assert.isTrue(todayIsNDaysBeforeDeadline(1, deadline, newYork, tokyoNoon));

    assert.isFalse(todayIsNDaysBeforeDeadline(0, deadline, newYork, tokyoNoon));

    assert.isTrue(todayIsNDaysBeforeDeadline(0, deadline, -540, tokyoNoon));
  });

  test('is 0 at noon on the day of the deadline, the hour it is reminded', () => {
    // Noon in New York, 17:00 UTC: before the deadline of 18:00 there.
    assert.isTrue(
      todayIsNDaysBeforeDeadline(
        0,
        deadline,
        newYork,
        Date.parse('2026-11-01T17:00:00Z'),
      ),
    );
  });
});

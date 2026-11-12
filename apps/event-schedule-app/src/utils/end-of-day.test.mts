import { endOfDaysLater } from './end-of-day.mjs';

describe(endOfDaysLater, () => {
  test('carries the day across the end of the month and the year', () => {
    assert.deepStrictEqual(
      endOfDaysLater(new Date(2026, 11, 30, 9, 0), 3),
      new Date(2027, 0, 2, 23, 59),
    );
  });

  test('0 days later is 23:59 of the same day', () => {
    assert.deepStrictEqual(
      endOfDaysLater(new Date(2026, 11, 30, 9, 0), 0),
      new Date(2026, 11, 30, 23, 59),
    );
  });
});

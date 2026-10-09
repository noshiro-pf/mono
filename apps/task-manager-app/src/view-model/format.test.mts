import {
  DAY_MS,
  formatDateTime,
  formatEstimate,
  formatLag,
  HOUR_MS,
  MINUTE_MS,
} from './format.mjs';

describe(formatLag, () => {
  test('is empty for no lag', () => {
    assert.strictEqual(formatLag(0), '');
  });

  test('names whole days in days', () => {
    assert.strictEqual(formatLag(3 * DAY_MS), '+3日');
  });

  test('adds the hours and minutes left over', () => {
    assert.strictEqual(formatLag(DAY_MS + 2 * HOUR_MS), '+1日2時間');

    assert.strictEqual(formatLag(5 * HOUR_MS), '+5時間');

    assert.strictEqual(formatLag(30 * MINUTE_MS), '+30分');

    assert.strictEqual(formatLag(HOUR_MS + 15 * MINUTE_MS), '+1時間15分');
  });

  test('writes a lead (a negative lag) with a minus sign', () => {
    assert.strictEqual(formatLag(-2 * DAY_MS), '-2日');

    assert.strictEqual(formatLag(-(DAY_MS + HOUR_MS)), '-1日1時間');
  });

  test('rounds what is under a minute away', () => {
    assert.strictEqual(formatLag(HOUR_MS + 1000), '+1時間');

    assert.strictEqual(formatLag(1000), '');
  });
});

describe(formatDateTime, () => {
  test('writes the date and time in the given time zone', () => {
    assert.strictEqual(
      formatDateTime(
        1_791_515_100_000 /* 2026-10-09T03:05:00Z */,
        'Asia/Tokyo',
      ),
      '2026/10/09 12:05',
    );

    assert.strictEqual(
      formatDateTime(1_791_515_100_000 /* 2026-10-09T03:05:00Z */, 'UTC'),
      '2026/10/09 03:05',
    );
  });
});

describe(formatEstimate, () => {
  test('is empty without an estimate', () => {
    assert.strictEqual(formatEstimate(undefined), '');
  });

  test('is hours, with a fraction when there is one', () => {
    assert.strictEqual(formatEstimate(3), '3時間');

    assert.strictEqual(formatEstimate(1.5), '1.5時間');
  });
});

import {
  DAY_MS,
  formatDate,
  formatDateTime,
  formatEstimate,
  formatLag,
  formatShortDate,
  formatShortDateTime,
  formatShortWhen,
  formatWhen,
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

describe(formatDate, () => {
  test('writes the date alone, in the given time zone', () => {
    // 2026-10-09T23:59:59.999 in Tokyo, the end of an all-day due date.
    const endOfDay = 1_791_557_999_999;

    assert.strictEqual(formatDate(endOfDay, 'Asia/Tokyo'), '2026/10/09');

    assert.strictEqual(formatDate(endOfDay, 'UTC'), '2026/10/09');
  });
});

describe(formatShortDate, () => {
  const at = 1_791_515_100_000; /* 2026-10-09T03:05:00Z */

  test('leaves the year out within the year of now', () => {
    assert.strictEqual(
      formatShortDate(at, at + 30 * DAY_MS, 'Asia/Tokyo'),
      '10/09',
    );
  });

  test('writes the year in another year', () => {
    assert.strictEqual(
      formatShortDate(at, at + 365 * DAY_MS, 'Asia/Tokyo'),
      '2026/10/09',
    );
  });
});

describe(formatWhen, () => {
  test('writes an all-day date without its time', () => {
    const at = 1_791_515_100_000; /* 2026-10-09T03:05:00Z */

    assert.strictEqual(formatWhen(at, true, 'Asia/Tokyo'), '2026/10/09');

    assert.strictEqual(formatWhen(at, false, 'Asia/Tokyo'), '2026/10/09 12:05');

    assert.strictEqual(formatShortWhen(at, true, at, 'Asia/Tokyo'), '10/09');

    assert.strictEqual(
      formatShortWhen(at, false, at, 'Asia/Tokyo'),
      '10/09 12:05',
    );
  });
});

describe(formatShortDateTime, () => {
  const at = 1_791_515_100_000; /* 2026-10-09T03:05:00Z */

  test('leaves the year out within the year of now', () => {
    assert.strictEqual(
      formatShortDateTime(at, at + 30 * DAY_MS, 'Asia/Tokyo'),
      '10/09 12:05',
    );
  });

  test('writes the year, and leaves the time out, in another year', () => {
    assert.strictEqual(
      formatShortDateTime(at, at + 365 * DAY_MS, 'Asia/Tokyo'),
      '2026/10/09',
    );
  });

  test('reads the year in the given time zone', () => {
    // 2026-12-31T16:00:00Z, 2027-01-01 01:00 in Tokyo.
    const newYearInTokyo = 1_798_732_800_000;

    assert.strictEqual(
      formatShortDateTime(newYearInTokyo, newYearInTokyo, 'Asia/Tokyo'),
      '01/01 01:00',
    );

    assert.strictEqual(
      formatShortDateTime(
        newYearInTokyo,
        1_798_804_800_000 /* 2027-01-01T12:00:00Z */,
        'UTC',
      ),
      '2026/12/31',
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

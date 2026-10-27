import { fromDateTimeLocal, toDateTimeLocal } from './datetime-local.mjs';

describe(toDateTimeLocal, () => {
  test('writes the instant as the wall clock of the time zone', () => {
    assert.strictEqual(
      toDateTimeLocal(
        1_791_515_142_000 /* 2026-10-09T03:05:42Z */,
        'Asia/Tokyo',
      ),
      '2026-10-09T12:05',
    );

    assert.strictEqual(
      toDateTimeLocal(
        1_791_515_100_000 /* 2026-10-09T03:05:00Z */,
        'America/New_York',
      ),
      '2026-10-08T23:05',
    );
  });

  test('writes midnight as 00, not 24', () => {
    assert.strictEqual(
      toDateTimeLocal(
        1_767_279_600_000 /* 2026-01-01T15:00:00Z */,
        'Asia/Tokyo',
      ),
      '2026-01-02T00:00',
    );
  });
});

describe(fromDateTimeLocal, () => {
  test('reads the wall clock of the time zone as an instant', () => {
    assert.strictEqual(
      fromDateTimeLocal('2026-10-09T12:05', 'Asia/Tokyo'),
      1_791_515_100_000 /* 2026-10-09T03:05:00Z */,
    );

    assert.strictEqual(
      fromDateTimeLocal('2026-10-08T23:05', 'America/New_York'),
      1_791_515_100_000 /* 2026-10-09T03:05:00Z */,
    );

    assert.strictEqual(
      fromDateTimeLocal('2026-01-15T09:00', 'America/New_York'),
      1_768_485_600_000 /* 2026-01-15T14:00:00Z */,
    );
  });

  test('accepts seconds, which some browsers add', () => {
    assert.strictEqual(
      fromDateTimeLocal('2026-10-09T12:05:30', 'Asia/Tokyo'),
      1_791_515_130_000 /* 2026-10-09T03:05:30Z */,
    );
  });

  test('is undefined for an empty or malformed value', () => {
    assert.isUndefined(fromDateTimeLocal('', 'Asia/Tokyo'));

    assert.isUndefined(fromDateTimeLocal('2026-10-09', 'Asia/Tokyo'));

    assert.isUndefined(fromDateTimeLocal('2026-13-09T12:00', 'Asia/Tokyo'));

    assert.isUndefined(fromDateTimeLocal('2026-02-30T12:00', 'Asia/Tokyo'));
  });

  test('round-trips with toDateTimeLocal across years and zones', () => {
    for (const timeZone of ['Asia/Tokyo', 'America/New_York', 'UTC']) {
      for (const epochMs of [
        946_684_740_000, // 1999-12-31T23:59:00Z
        1_709_208_000_000, // 2024-02-29T12:00:00Z
        1_782_865_800_000, // 2026-07-01T00:30:00Z
      ]) {
        assert.strictEqual(
          fromDateTimeLocal(toDateTimeLocal(epochMs, timeZone), timeZone),
          epochMs,
        );
      }
    }
  });
});

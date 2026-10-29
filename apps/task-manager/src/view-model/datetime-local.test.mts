import {
  fromDateLocal,
  fromDateTimeLocal,
  switchAllDay,
  toDateLocal,
  toDateTimeLocal,
} from './datetime-local.mjs';

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

describe(toDateLocal, () => {
  test('is the day of the wall clock of the given zone', () => {
    // 2026-10-09T23:59:59.999 in Tokyo.
    assert.strictEqual(
      toDateLocal(1_791_557_999_999, 'Asia/Tokyo'),
      '2026-10-09',
    );

    assert.strictEqual(
      toDateLocal(1_791_558_000_000, 'Asia/Tokyo'),
      '2026-10-10',
    );
  });
});

describe(fromDateLocal, () => {
  test('is the start or the end of the day on the wall clock of the given zone', () => {
    assert.strictEqual(
      fromDateLocal('2026-10-10', 'start', 'Asia/Tokyo'),
      1_791_558_000_000 /* 2026-10-09T15:00:00Z */,
    );

    assert.strictEqual(
      fromDateLocal('2026-10-10', 'end', 'Asia/Tokyo'),
      1_791_644_399_999 /* 2026-10-10T14:59:59.999Z */,
    );
  });

  test('is the day as the clocks run where a change of time is at midnight', () => {
    // Santiago goes from 00:00 to 01:00 on 2026-09-06, and from 00:00 back
    // to 23:00 on 2026-04-05.
    assert.strictEqual(
      fromDateLocal('2026-09-06', 'start', 'America/Santiago'),
      1_788_667_200_000 /* 2026-09-06T01:00-03:00 */,
    );

    assert.strictEqual(
      fromDateLocal('2026-04-04', 'end', 'America/Santiago'),
      1_775_361_599_999 /* 2026-04-04T23:59:59.999-04:00 */,
    );
  });

  test('is undefined for what is not a day alone', () => {
    assert.isUndefined(fromDateLocal('2026-10-10T09:30', 'start', 'UTC'));

    assert.isUndefined(fromDateLocal('2026-02-30', 'end', 'UTC'));

    assert.isUndefined(fromDateLocal('', 'end', 'UTC'));

    // Its next day is not one.
    assert.isUndefined(fromDateLocal('9999-12-31', 'end', 'UTC'));
  });
});

describe(switchAllDay, () => {
  test('keeps the day alone when made all day', () => {
    assert.strictEqual(
      switchAllDay('2026-10-10T09:30', true, 'end'),
      '2026-10-10',
    );
  });

  test('gives the day the time of its edge when made timed', () => {
    assert.strictEqual(
      switchAllDay('2026-10-10', false, 'end'),
      '2026-10-10T23:59',
    );

    assert.strictEqual(
      switchAllDay('2026-10-10', false, 'start'),
      '2026-10-10T00:00',
    );
  });

  test('leaves an empty field empty', () => {
    assert.strictEqual(switchAllDay('', true, 'end'), '');

    assert.strictEqual(switchAllDay('', false, 'start'), '');
  });
});

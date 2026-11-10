import {
  isoWithOffset,
  nextMidnightMs,
  offsetMinutesAt,
  todayOf,
  weekBefore,
} from './activity-days.mjs';

describe(weekBefore, () => {
  test('counts the seven ended days at the reader’s midnight', () => {
    // 2026-11-10 08:30 in Tokyo.
    const week = weekBefore(Date.parse('2026-11-09T23:30:00Z'), 'Asia/Tokyo');

    assert.deepStrictEqual(
      week.map(({ key }) => key),
      [
        '2026-11-03',
        '2026-11-04',
        '2026-11-05',
        '2026-11-06',
        '2026-11-07',
        '2026-11-08',
        '2026-11-09',
      ],
    );

    assert.deepStrictEqual(week.at(-1), {
      key: '2026-11-09',
      label: '11/9(月)',
      startMs: Date.parse('2026-11-08T15:00:00Z'),
      endMs: Date.parse('2026-11-09T15:00:00Z'),
      range: '2026-11-09T00:00:00+09:00..2026-11-09T23:59:59+09:00',
    });
  });

  test('keeps a day daylight saving shortens one day long', () => {
    // 2026-03-08 is 23 hours long in New York.
    const week = weekBefore(
      Date.parse('2026-03-09T17:00:00Z'),
      'America/New_York',
    );

    const short = week.at(-1);

    assert.isDefined(short);

    assert.strictEqual(short.key, '2026-03-08');

    assert.strictEqual(
      short.range,
      '2026-03-08T00:00:00-05:00..2026-03-08T23:59:59-04:00',
    );

    assert.strictEqual(short.endMs - short.startMs, 23 * 3_600_000);
  });
});

describe(todayOf, () => {
  test('is the whole day now is in', () => {
    assert.strictEqual(
      todayOf(Date.parse('2026-11-09T23:30:00Z'), 'Asia/Tokyo').range,
      '2026-11-10T00:00:00+09:00..2026-11-10T23:59:59+09:00',
    );
  });
});

describe(nextMidnightMs, () => {
  test('is the next local midnight', () => {
    assert.strictEqual(
      nextMidnightMs(Date.parse('2026-11-09T23:30:00Z'), 'Asia/Tokyo'),
      Date.parse('2026-11-10T15:00:00Z'),
    );
  });

  test('is still ahead where daylight saving skips midnight', () => {
    // Santiago, 2026-09-06: 00:00 does not happen; the day begins at 01:00 -03.
    const nowMs = Date.parse('2026-09-06T03:30:00Z');

    const next = nextMidnightMs(nowMs, 'America/Santiago');

    assert.strictEqual(next, Date.parse('2026-09-06T04:00:00Z'));

    assert.isAbove(next, nowMs);
  });
});

describe(isoWithOffset, () => {
  test('writes a negative offset with its minutes', () => {
    assert.strictEqual(
      isoWithOffset(Date.parse('2026-01-01T00:00:00Z'), -210),
      '2025-12-31T20:30:00-03:30',
    );
  });
});

describe(offsetMinutesAt, () => {
  test('reads UTC as zero', () => {
    assert.strictEqual(offsetMinutesAt(0, 'UTC'), 0);
  });
});

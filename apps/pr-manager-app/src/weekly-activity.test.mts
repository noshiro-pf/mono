import { Arr, Result } from 'ts-data-forge';
import { DEFAULT_REPORT_SOURCE } from './constants.mjs';
import type { Fetch, FetchInit } from './graphql.mjs';
import {
  activitySearch,
  activitySearchUrl,
  dayKeyOf,
  isoWithOffset,
  loadWeeklyActivity,
  nextMidnightMs,
  todayOf,
  WEEK_LENGTH,
  weekBefore,
  weeklyActivityQuery,
} from './weekly-activity.mjs';

const TOKYO = 'Asia/Tokyo';

const NEW_YORK = 'America/New_York';

// 2026-10-18 22:00 in Tokyo.
const NOW_MS = /* 2026-10-18T13:00:00Z */ 1_792_328_400_000;

describe(weekBefore, () => {
  test('is the seven days before today, oldest first, each from the zone’s midnight', () => {
    const days = weekBefore(NOW_MS, TOKYO);

    assert.deepStrictEqual(
      days.map(({ key }) => key),
      [
        '2026-10-11',
        '2026-10-12',
        '2026-10-13',
        '2026-10-14',
        '2026-10-15',
        '2026-10-16',
        '2026-10-17',
      ],
    );

    assert.strictEqual(
      days[0]?.startMs,
      /* 2026-10-10T15:00:00Z */ 1_791_644_400_000,
    );

    assert.strictEqual(
      days[6]?.endMs,
      /* 2026-10-17T15:00:00Z */ 1_792_249_200_000,
    );

    assert.strictEqual(
      days[0]?.range,
      '2026-10-11T00:00:00+09:00..2026-10-11T23:59:59+09:00',
    );
  });

  test('moves on at the zone’s midnight, not at UTC’s', () => {
    const midnight = /* 2026-10-17T15:00:00Z */ 1_792_249_200_000;

    assert.strictEqual(
      weekBefore(midnight - 1, TOKYO).at(-1)?.key,
      '2026-10-16',
    );

    assert.strictEqual(weekBefore(midnight, TOKYO).at(-1)?.key, '2026-10-17');
  });

  test('a day that daylight saving lengthens is still one day, at the offsets on either side', () => {
    // The clocks in New York go back an hour on 2026-11-01.
    const days = weekBefore(
      /* 2026-11-03T12:00:00Z */ 1_793_707_200_000,
      NEW_YORK,
    );

    const fallBack = days.find(({ key }) => key === '2026-11-01');

    assert.isDefined(fallBack);

    assert.strictEqual(
      fallBack.startMs,
      /* 2026-11-01T04:00:00Z */ 1_793_505_600_000,
    );

    assert.strictEqual(
      fallBack.endMs,
      /* 2026-11-02T05:00:00Z */ 1_793_595_600_000,
    );

    assert.strictEqual(
      fallBack.range,
      '2026-11-01T00:00:00-04:00..2026-11-01T23:59:59-05:00',
    );

    assert.strictEqual(days.length, WEEK_LENGTH);
  });
});

describe(dayKeyOf, () => {
  test('is the date in the zone', () => {
    assert.strictEqual(dayKeyOf(NOW_MS, TOKYO), '2026-10-18');

    assert.strictEqual(dayKeyOf(NOW_MS, NEW_YORK), '2026-10-18');

    assert.strictEqual(
      dayKeyOf(/* 2026-10-18T02:00:00Z */ 1_792_288_800_000, NEW_YORK),
      '2026-10-17',
    );
  });
});

describe(nextMidnightMs, () => {
  test('is the start of tomorrow in the zone', () => {
    assert.strictEqual(
      nextMidnightMs(NOW_MS, TOKYO),
      /* 2026-10-18T15:00:00Z */ 1_792_335_600_000,
    );

    assert.strictEqual(
      nextMidnightMs(/* 2026-10-18T15:00:00Z */ 1_792_335_600_000, TOKYO),
      /* 2026-10-19T15:00:00Z */ 1_792_422_000_000,
    );
  });
});

describe(isoWithOffset, () => {
  test('writes the wall-clock time at the offset, and the offset', () => {
    const instant = /* 2026-01-02T03:04:05Z */ 1_767_323_045_000;

    assert.strictEqual(isoWithOffset(instant, 0), '2026-01-02T03:04:05+00:00');

    assert.strictEqual(
      isoWithOffset(instant, 330),
      '2026-01-02T08:34:05+05:30',
    );

    assert.strictEqual(
      isoWithOffset(instant, -300),
      '2026-01-01T22:04:05-05:00',
    );
  });
});

describe(activitySearch, () => {
  test('counts merged pull requests and closed issues of the repository on that day', () => {
    const days = weekBefore(NOW_MS, TOKYO);

    assert.isTrue(Arr.isNonEmpty(days));

    if (!Arr.isNonEmpty(days)) {
      return;
    }

    const [day] = days;

    assert.strictEqual(
      activitySearch(DEFAULT_REPORT_SOURCE, 'merged', day),
      'repo:noshiro-pf/mono is:pr is:merged merged:2026-10-11T00:00:00+09:00..2026-10-11T23:59:59+09:00',
    );

    assert.strictEqual(
      activitySearch(DEFAULT_REPORT_SOURCE, 'closed', day),
      'repo:noshiro-pf/mono is:issue is:closed closed:2026-10-11T00:00:00+09:00..2026-10-11T23:59:59+09:00',
    );
  });

  test('links to the same search on the repository’s own list', () => {
    const days = weekBefore(NOW_MS, TOKYO);

    assert.isTrue(Arr.isNonEmpty(days));

    if (!Arr.isNonEmpty(days)) {
      return;
    }

    const [day] = days;

    const url = new URL(
      activitySearchUrl(DEFAULT_REPORT_SOURCE, 'merged', day),
    );

    assert.strictEqual(
      `${url.origin}${url.pathname}`,
      'https://github.com/noshiro-pf/mono/pulls',
    );

    assert.strictEqual(
      url.searchParams.get('q'),
      'is:pr is:merged merged:2026-10-11T00:00:00+09:00..2026-10-11T23:59:59+09:00',
    );
  });
});

describe(todayOf, () => {
  test('is the day `nowMs` is in, the whole of it, apart from the week before', () => {
    const today = todayOf(NOW_MS, TOKYO);

    assert.strictEqual(today.key, '2026-10-18');

    assert.strictEqual(today.startMs, weekBefore(NOW_MS, TOKYO).at(-1)?.endMs);

    assert.strictEqual(today.endMs, nextMidnightMs(NOW_MS, TOKYO));

    assert.strictEqual(
      today.range,
      '2026-10-18T00:00:00+09:00..2026-10-18T23:59:59+09:00',
    );
  });
});

describe(weeklyActivityQuery, () => {
  test('asks for one count per day and kind, each search a variable', () => {
    const days = weekBefore(NOW_MS, TOKYO);

    const { query, variables } = weeklyActivityQuery(
      DEFAULT_REPORT_SOURCE,
      days,
      todayOf(NOW_MS, TOKYO),
    );

    // The week's days and today, each merged and closed.
    assert.strictEqual(Object.keys(variables).length, (WEEK_LENGTH + 1) * 2);

    assert.include(
      query,
      'merged_0: search(query: $merged_0, type: ISSUE, first: 1) { issueCount }',
    );

    assert.include(query, '$closed_6: String!');

    assert.strictEqual(
      variables['closed_6'],
      'repo:noshiro-pf/mono is:issue is:closed closed:2026-10-17T00:00:00+09:00..2026-10-17T23:59:59+09:00',
    );

    assert.strictEqual(
      variables['merged_today'],
      'repo:noshiro-pf/mono is:pr is:merged merged:2026-10-18T00:00:00+09:00..2026-10-18T23:59:59+09:00',
    );
  });
});

describe(loadWeeklyActivity, () => {
  test('reads each day’s counts, with the token', async () => {
    const { fetchImpl, sent } = answering({
      data: {
        ...Object.fromEntries(
          Arr.seq(WEEK_LENGTH).flatMap((index) => [
            [`merged_${index}`, { issueCount: index + 10 }] as const,
            [`closed_${index}`, { issueCount: index }] as const,
          ]),
        ),
        merged_today: { issueCount: 2 },
        closed_today: { issueCount: 1 },
      },
    });

    const loaded = await loadWeeklyActivity(DEFAULT_REPORT_SOURCE, {
      token: 'secret',
      nowMs: NOW_MS,
      timeZone: TOKYO,
      fetchImpl,
    });

    assert.isTrue(Result.isOk(loaded.result));

    if (Result.isErr(loaded.result)) {
      return;
    }

    assert.strictEqual(sent[0]?.headers['Authorization'], 'Bearer secret');

    assert.strictEqual(loaded.result.value.countedOn, '2026-10-18');

    assert.deepStrictEqual(
      loaded.result.value.days.map(({ key, merged, closed: closedCount }) => [
        key,
        merged,
        closedCount,
      ]),
      [
        ['2026-10-11', 10, 0],
        ['2026-10-12', 11, 1],
        ['2026-10-13', 12, 2],
        ['2026-10-14', 13, 3],
        ['2026-10-15', 14, 4],
        ['2026-10-16', 15, 5],
        ['2026-10-17', 16, 6],
      ],
    );

    // Today is apart from the week, and as far as the moment it was read.
    assert.deepStrictEqual(
      [
        loaded.result.value.today.key,
        loaded.result.value.today.merged,
        loaded.result.value.today.closed,
      ],
      ['2026-10-18', 2, 1],
    );

    assert.strictEqual(loaded.result.value.countedAtMs, NOW_MS);
  });

  test('an answer missing today’s count fails the whole read', async () => {
    const { fetchImpl } = answering({
      data: Object.fromEntries(
        Arr.seq(WEEK_LENGTH).flatMap((index) => [
          [`merged_${index}`, { issueCount: 1 }] as const,
          [`closed_${index}`, { issueCount: 1 }] as const,
        ]),
      ),
    });

    const loaded = await loadWeeklyActivity(DEFAULT_REPORT_SOURCE, {
      token: 'secret',
      nowMs: NOW_MS,
      timeZone: TOKYO,
      fetchImpl,
    });

    assert.isTrue(Result.isErr(loaded.result));
  });

  test('a count GitHub could not give fails the week rather than reading as 0', async () => {
    const { fetchImpl } = answering({
      data: { merged_0: { issueCount: 3 } },
      errors: [{ message: 'Something went wrong.', path: ['closed_0'] }],
    });

    const loaded = await loadWeeklyActivity(DEFAULT_REPORT_SOURCE, {
      token: 'secret',
      nowMs: NOW_MS,
      timeZone: TOKYO,
      fetchImpl,
    });

    assert.isTrue(Result.isErr(loaded.result));

    if (Result.isOk(loaded.result)) {
      return;
    }

    assert.include(loaded.result.value, 'Something went wrong.');
  });

  test('an answer missing a count fails the week', async () => {
    const { fetchImpl } = answering({ data: { merged_0: { issueCount: 3 } } });

    const loaded = await loadWeeklyActivity(DEFAULT_REPORT_SOURCE, {
      token: 'secret',
      nowMs: NOW_MS,
      timeZone: TOKYO,
      fetchImpl,
    });

    assert.isTrue(Result.isErr(loaded.result));
  });
});

const answering = (
  body: unknown,
): Readonly<{ fetchImpl: Fetch; sent: readonly FetchInit[] }> => {
  const mut_sent: FetchInit[] = [];

  const fetchImpl: Fetch = (_route, init) => {
    mut_sent.push(init);

    return Promise.resolve(Response.json(body, { status: 200 }));
  };

  return { fetchImpl, sent: mut_sent };
};

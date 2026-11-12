import { todayOf, weekBefore } from './activity-days.mjs';
import {
  activityQuery,
  activitySearchUrl,
  weeklyActivityOf,
  weekTotals,
} from './activity.mjs';

const REPO = { owner: 'noshiro-pf', name: 'mono' } as const;

const NOW = Date.parse('2026-11-09T23:30:00Z');

const DAYS = weekBefore(NOW, 'Asia/Tokyo');

const TODAY = todayOf(NOW, 'Asia/Tokyo');

describe(activityQuery, () => {
  test('asks one count per day and kind, each search a variable', () => {
    const { query, variables } = activityQuery(REPO, DAYS, TODAY);

    assert.strictEqual(Object.keys(variables).length, 16);

    assert.strictEqual(
      variables['merged_6'],
      'repo:noshiro-pf/mono is:pr is:merged merged:2026-11-09T00:00:00+09:00..2026-11-09T23:59:59+09:00',
    );

    assert.include(
      query,
      'closed_today: search(query: $closed_today, type: ISSUE, first: 1) { issueCount }',
    );

    assert.include(query, '$owner: String!, $name: String!');
  });
});

describe(weeklyActivityOf, () => {
  const counts = Object.fromEntries(
    Object.keys(activityQuery(REPO, DAYS, TODAY).variables).map(
      (alias, index) => [alias, index] as const,
    ),
  );

  test('reads every count and totals the week, today apart', () => {
    const activity = weeklyActivityOf(counts, DAYS, TODAY, NOW);

    assert.isDefined(activity);

    assert.deepStrictEqual(
      activity.days.map(({ merged, closed }) => [merged, closed]),
      [
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
        [8, 9],
        [10, 11],
        [12, 13],
      ],
    );

    assert.deepStrictEqual(
      [activity.today.merged, activity.today.closed],
      [14, 15],
    );

    assert.deepStrictEqual(weekTotals(activity), { merged: 42, closed: 49 });
  });

  test('refuses an answer missing a count', () => {
    const { merged_3: _, ...missing } = counts;

    assert.isUndefined(weeklyActivityOf(missing, DAYS, TODAY, NOW));
  });
});

describe(activitySearchUrl, () => {
  test('lists the closed issues of the day', () => {
    const [first] = DAYS;

    assert.isDefined(first);

    const url = new URL(activitySearchUrl(REPO, 'closed', first));

    assert.strictEqual(
      url.searchParams.get('q'),
      'is:issue is:closed closed:2026-11-03T00:00:00+09:00..2026-11-03T23:59:59+09:00',
    );
  });
});

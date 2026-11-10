import { Arr } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { githubSearchUrl } from '../github-search.mjs';
import type { Repo } from '../repo.mjs';
import type { ActivityDay } from './activity-days.mjs';

/**
 * What the Activity dialog counts (spec §5): pull requests merged and issues
 * closed on each of the reader's last seven ended days, and today so far.
 *
 * **Counted by GitHub's search**, one `issueCount` per day and kind in one
 * query, so the cost is the same however busy the week was; the merged block's
 * list stops at its own limit and could not stand in for it.
 */
export type ActivityKind = 'merged' | 'closed';

export type DayActivity = ActivityDay &
  Readonly<{ merged: number; closed: number }>;

export type WeeklyActivity = Readonly<{
  /** Oldest first, ending with yesterday. */
  days: readonly DayActivity[];
  /** Today, as of {@link WeeklyActivity.countedAtMs}. */
  today: DayActivity;
  countedAtMs: number;
}>;

export const ACTIVITY_KINDS = [
  'merged',
  'closed',
] as const satisfies readonly ActivityKind[];

/** The search's qualifiers for one kind on one day, without the repository. */
export const activityQualifiers = (
  kind: ActivityKind,
  day: ActivityDay,
): string =>
  kind === 'merged'
    ? (`is:pr is:merged merged:${day.range}` as const)
    : (`is:issue is:closed closed:${day.range}` as const);

/** The same search on GitHub, behind a count. */
export const activitySearchUrl = (
  repo: Repo,
  kind: ActivityKind,
  day: ActivityDay,
): string =>
  githubSearchUrl(
    repo,
    kind === 'merged' ? 'pulls' : 'issues',
    activityQualifiers(kind, day),
  );

/**
 * One query for the week and today: `merged_N` / `closed_N` for the `N`th day
 * and `merged_today` / `closed_today`, each a search asked only for its count.
 * The search strings are variables; `$owner` and `$name` name the repository,
 * as every query of the reader is sent with them.
 */
export const activityQuery = (
  repo: Repo,
  days: readonly ActivityDay[],
  today: ActivityDay,
): Readonly<{
  query: string;
  variables: ReadonlyRecord<string, string>;
}> => {
  const fields = Arr.toPushed(
    days.map((day, index) => ({ day, suffix: index.toString() })),
    { day: today, suffix: TODAY },
  ).flatMap(({ day, suffix }) =>
    ACTIVITY_KINDS.map((kind) => ({
      alias: aliasOf(kind, suffix),
      search: `repo:${repo.owner}/${repo.name} ${activityQualifiers(kind, day)}`,
    })),
  );

  return {
    query: [
      `query Activity($owner: String!, $name: String!, ${fields.map(({ alias }) => `$${alias}: String!`).join(', ')}) {`,
      // Names the repository the searches are of, and checks it is readable.
      '  repository(owner: $owner, name: $name) { id }',
      // A connection needs a size of 1 to 100 though no node is asked for.
      ...fields.map(
        ({ alias }) =>
          `  ${alias}: search(query: $${alias}, type: ISSUE, first: 1) { issueCount }`,
      ),
      '}',
    ].join('\n'),
    variables: Object.fromEntries(
      fields.map(({ alias, search }) => [alias, search] as const),
    ),
  };
};

/**
 * The counts an answer gives, or `undefined` when one is missing: a day drawn
 * as `0` that was never answered would read as a quiet day.
 */
export const weeklyActivityOf = (
  counts: ReadonlyRecord<string, number>,
  days: readonly ActivityDay[],
  today: ActivityDay,
  countedAtMs: number,
): WeeklyActivity | undefined => {
  const counted = (
    day: ActivityDay,
    suffix: string,
  ): DayActivity | undefined => {
    const merged = counts[aliasOf('merged', suffix)];

    const closed = counts[aliasOf('closed', suffix)];

    return merged === undefined || closed === undefined
      ? undefined
      : { ...day, merged, closed };
  };

  const week = days.map((day, index) => counted(day, index.toString()));

  const now = counted(today, TODAY);

  return now === undefined || week.includes(undefined)
    ? undefined
    : {
        days: week.filter((day) => day !== undefined),
        today: now,
        countedAtMs,
      };
};

/** The week's totals, today apart. */
export const weekTotals = (
  activity: WeeklyActivity,
): Readonly<{ merged: number; closed: number }> =>
  ({
    merged: Arr.sum(activity.days.map(({ merged }) => merged)),
    closed: Arr.sum(activity.days.map(({ closed }) => closed)),
  }) as const;

const TODAY = 'today';

const aliasOf = (kind: ActivityKind, suffix: string): string =>
  `${kind}_${suffix}` as const;

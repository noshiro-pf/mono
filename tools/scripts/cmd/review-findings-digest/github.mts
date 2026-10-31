import { rest, type ApiContext } from 'pr-merge-queue';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { MergedPull } from './digest.mjs';
import { extractReviewSection } from './parse.mjs';

/**
 * The merged pull requests in `range`, newest merge first, through the REST
 * API only (a Claude Code session's proxy refuses GraphQL).
 *
 * The list endpoint cannot filter by merge date, so this pages through the
 * closed pull requests by `updated_at`, newest first, and stops once
 * {@link needsNextPage} says no later page can hold one in range. The size of
 * the diff is not in the list, so it is fetched one pull request at a time —
 * only for those with a `## Review` section, which are the ones the digest
 * shows it for.
 */
export const listMergedPulls = async (
  context: ApiContext,
  range: PullRange,
  log: (message: string) => void,
): Promise<Result<readonly MergedPull[], string>> => {
  const mut_seen: PullListItem[] = [];

  for (let mut_page = 1; mut_page <= MAX_PAGES; mut_page += 1) {
    const answer = await rest(context, 'GET', '/pulls', PullListSchema, {
      query: {
        state: 'closed',
        sort: 'updated',
        direction: 'desc',
        per_page: PAGE_SIZE.toString(),
        page: mut_page.toString(),
      },
    });

    if (Result.isErr(answer)) {
      return answer;
    }

    mut_seen.push(...answer.value);

    log(`read ${mut_seen.length} closed pull requests`);

    if (
      !needsNextPage(
        range,
        mut_seen,
        Arr.isFixedLengthArray(PAGE_SIZE, answer.value),
      )
    ) {
      break;
    }

    if (mut_page === MAX_PAGES) {
      return Result.err(
        `stopped after ${mut_seen.length} closed pull requests with the range not yet covered; narrow --since or --last`,
      );
    }
  }

  const selected = selectMerged(range, mut_seen);

  const mut_pulls: MergedPull[] = [];

  for (const chunk of Arr.chunk(selected, CONCURRENCY)) {
    const sized = await Promise.all(
      chunk.map(async (pull) => {
        const body = pull.body ?? '';

        if (extractReviewSection(body) === undefined) {
          return Result.ok(toMergedPull(pull, body, undefined));
        }

        const detail = await rest(
          context,
          'GET',
          `/pulls/${pull.number}`,
          PullDetailSchema,
        );

        return Result.map(detail, (size) => toMergedPull(pull, body, size));
      }),
    );

    for (const result of sized) {
      if (Result.isErr(result)) {
        return result;
      }

      mut_pulls.push(result.value);
    }

    log(`sized ${mut_pulls.length} of ${selected.length} merged pull requests`);
  }

  return Result.ok(mut_pulls);
};

/**
 * The merged pull requests among `seen` that `range` selects, newest merge
 * first.
 */
export const selectMerged = (
  range: PullRange,
  seen: readonly PullListItem[],
): readonly MergedListItem[] => {
  // A pull request updated while the pages are read moves to the top of the
  // list. That can push one already read onto the next page, read twice (kept
  // once here), or take one not yet read onto a page already read, missed: for
  // a run of a few seconds, an accepted gap.
  const merged = Arr.uniqBy(seen, (pull) => pull.number)
    .filter((pull): pull is MergedListItem => pull.merged_at !== null)
    .toSorted((a, b) => b.merged_at.localeCompare(a.merged_at));

  return range.kind === 'since'
    ? merged.filter((pull) => pull.merged_at >= startOf(range.date))
    : merged.slice(0, range.count);
};

/**
 * Whether a page after the ones in `seen` could still hold a pull request
 * `range` selects. The pages are sorted by `updated_at`, newest first, and a
 * pull request is updated when it merges, so every one on a later page merged
 * no later than the oldest update seen so far.
 */
export const needsNextPage = (
  range: PullRange,
  seen: readonly PullListItem[],
  lastPageWasFull: boolean,
): boolean => {
  const oldest = seen.at(-1)?.updated_at;

  if (!lastPageWasFull || oldest === undefined) {
    return false;
  }

  if (range.kind === 'since') {
    return oldest >= startOf(range.date);
  }

  const nth = selectMerged(range, seen).at(range.count - 1);

  return nth === undefined || oldest > nth.merged_at;
};

/** Which merged pull requests to read: merged on or after a date, or the last `n`. */
export type PullRange = Readonly<
  { kind: 'since'; date: string } | { kind: 'last'; count: number }
>;

/** The fields of the list endpoint's items this reads. */
export type PullListItem = t.TypeOf<typeof PullListItemSchema>;

type MergedListItem = PullListItem & Readonly<{ merged_at: string }>;

const PAGE_SIZE = 100;

/** 5,000 closed pull requests: far past any range this is meant for. */
const MAX_PAGES = 50;

const CONCURRENCY = 8;

const PullListItemSchema = t.record({
  number: t.number(),
  title: t.string(),
  html_url: t.string(),
  body: t.union([t.nullType, t.string()]),
  merged_at: t.union([t.nullType, t.string()]),
  updated_at: t.string(),
});

const PullListSchema = t.array(PullListItemSchema);

const PullDetailSchema = t.record({
  additions: t.number(),
  deletions: t.number(),
});

/** The first instant of a `YYYY-MM-DD` date, as GitHub writes timestamps. */
const startOf = (date: string): string => `${date}T00:00:00Z` as const;

const toMergedPull = (
  pull: MergedListItem,
  body: string,
  size: Readonly<{ additions: number; deletions: number }> | undefined,
): MergedPull =>
  ({
    number: pull.number,
    title: pull.title,
    url: pull.html_url,
    mergedAt: pull.merged_at,
    body,
    additions: size?.additions,
    deletions: size?.deletions,
  }) as const;

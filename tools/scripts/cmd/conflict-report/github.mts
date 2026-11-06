/**
 * What `conflict-report` reads from GitHub, through the REST API only (a
 * Claude Code session's proxy refuses GraphQL): the pull requests merged in the
 * window, every head each one had, and the set-aside comments `unblock-prs`
 * wrote on them.
 */

import { rest, restAllPages, type ApiContext } from 'pr-merge-queue';
import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { readSetAside, type SetAsideSeen } from './report.mjs';

/**
 * The pull requests merged into `base` since `since` (an ISO instant), but the
 * version pull requests, which `release.yml` rebuilds rather than rebases. The
 * list cannot filter by merge time, so it pages by `updated_at` until a page
 * ends before `since`.
 */
export const listMerged = async (
  context: ApiContext,
  base: string,
  since: string,
): Promise<Result<readonly MergedPull[], string>> => {
  const mut_seen: t.TypeOf<typeof PullSchema>[] = [];

  for (let mut_page = 1; mut_page <= MAX_PAGES; mut_page += 1) {
    const page = await rest(context, 'GET', '/pulls', t.array(PullSchema), {
      query: {
        state: 'closed',
        base,
        sort: 'updated',
        direction: 'desc',
        per_page: '100',
        page: mut_page.toString(),
      },
    });

    if (Result.isErr(page)) {
      return page;
    }

    mut_seen.push(...page.value);

    const last = page.value.at(-1);

    if (last === undefined || last.updated_at < since) {
      break;
    }

    if (mut_page === MAX_PAGES) {
      return Result.err(
        `stopped after ${mut_seen.length} closed pull requests with the window not yet covered; give fewer --days`,
      );
    }
  }

  return Result.ok(
    mut_seen
      .filter(
        (pull) =>
          pull.merged_at !== null &&
          pull.merged_at >= since &&
          pull.merge_commit_sha !== null &&
          !pull.head.ref.startsWith('changeset-release/'),
      )
      .map((pull) => ({
        number: pull.number,
        branch: pull.head.ref,
        createdAt: pull.created_at,
        mergedAt: pull.merged_at ?? '',
        mergeSha: pull.merge_commit_sha ?? '',
        head: pull.head.sha,
      })),
  );
};

/**
 * Every head `pull` had: the ones its timeline records (each force-push, each
 * commit), and the ones its `pull_request` runs were for, which include the
 * head it was opened at. Unordered; the replay orders them by commit time.
 */
export const headsOf = async (
  context: ApiContext,
  pull: MergedPull,
): Promise<Result<readonly string[], string>> => {
  const timeline = await restAllPages(
    context,
    `/issues/${pull.number}/timeline`,
    t.array(TimelineEventSchema),
  );

  if (Result.isErr(timeline)) {
    return timeline;
  }

  const fromRuns = await runHeads(context, pull);

  return Result.ok(
    Arr.uniq([
      ...timeline.value.flatMap((event) =>
        event.event === 'head_ref_force_pushed' &&
        typeof event.commit_id === 'string'
          ? [event.commit_id]
          : event.event === 'committed' && typeof event.sha === 'string'
            ? [event.sha]
            : [],
      ),
      ...fromRuns,
      pull.head,
    ]).filter((sha) => SHA.test(sha)),
  );
};

/**
 * The set-asides `unblock-prs` wrote on `number`, standing or resolved. Only
 * `viewer`'s comments count: the repository is public, and anyone can write a
 * comment that looks like one.
 */
export const setAsidesOn = async (
  context: ApiContext,
  number: number,
  viewer: string,
): Promise<Result<readonly SetAsideSeen[], string>> =>
  Result.map(
    await restAllPages(
      context,
      `/issues/${number}/comments`,
      t.array(CommentSchema),
    ),
    (comments) =>
      Arr.generate<SetAsideSeen>(function* () {
        for (const { user, body } of comments) {
          const seen =
            user?.login === viewer ? readSetAside(body ?? '') : undefined;

          if (seen !== undefined) {
            yield seen;
          }
        }
      }),
  );

export type MergedPull = Readonly<{
  number: number;
  branch: string;
  createdAt: string;
  mergedAt: string;
  /** The squash commit on the base. */
  mergeSha: string;
  /** The head it merged at. */
  head: string;
}>;

/** Enough pages for a few weeks of this repository's pull requests. */
const MAX_PAGES = 20;

/**
 * Only a full SHA is passed on: the replay puts them in `git` commands, and
 * checking costs nothing.
 */
const SHA = /^[0-9a-f]{40}$/u;

/**
 * The heads `pull`'s `pull_request` runs were for, within its life: filtered by
 * date on the server and read page by page, since a branch name can be reused
 * by many pull requests, and its first page of runs belong to the newest. None
 * when they cannot be read: the timeline still gives the rest.
 */
const runHeads = async (
  context: ApiContext,
  pull: MergedPull,
): Promise<readonly string[]> => {
  const mut_heads: string[] = [];

  for (let mut_page = 1; mut_page <= MAX_PAGES; mut_page += 1) {
    const runs = await rest(context, 'GET', '/actions/runs', RunsSchema, {
      query: {
        branch: pull.branch,
        event: 'pull_request',
        created: `${pull.createdAt}..${pull.mergedAt}`,
        per_page: '100',
        page: mut_page.toString(),
      },
    });

    if (Result.isErr(runs)) {
      break;
    }

    mut_heads.push(...runs.value.workflow_runs.map(({ head_sha }) => head_sha));

    if (runs.value.workflow_runs.length < 100) {
      break;
    }
  }

  return mut_heads;
};

const PullSchema = t.record({
  number: t.number(),
  created_at: t.string(),
  updated_at: t.string(),
  merged_at: t.union([t.string(), t.nullType]),
  merge_commit_sha: t.union([t.string(), t.nullType]),
  head: t.record({ ref: t.string(), sha: t.string() }),
});

const TimelineEventSchema = t.record({
  event: t.optional(t.string()),
  commit_id: t.optional(t.union([t.string(), t.nullType])),
  sha: t.optional(t.string()),
});

const RunsSchema = t.record({
  workflow_runs: t.array(
    t.record({ head_sha: t.string(), created_at: t.string() }),
  ),
});

const CommentSchema = t.record({
  body: t.optional(t.union([t.string(), t.nullType])),
  user: t.union([t.record({ login: t.string() }), t.nullType]),
});

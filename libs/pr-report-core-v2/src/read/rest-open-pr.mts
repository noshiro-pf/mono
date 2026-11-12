/**
 * What `open-pr` reads and writes over REST (`spec/commands.md`, `open-pr`): the
 * open pull requests of a branch, one pull request's state, a new pull request,
 * the body of one named by `--merge-before`, and what the issues one closes
 * start after.
 */

import { Arr, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { closingKeywordIssuesInHtml, lfOnly } from '../conventions/index.mjs';
import { waitsFor } from '../decide/index.mjs';
import type { Read } from '../snapshot/index.mjs';
import { allRead } from './all-read.mjs';
import { DependenciesSummarySchema, readBlockedBy } from './rest-issues.mjs';
import { OPEN_PULLS_PATH } from './rest-pull-requests.mjs';
import {
  answersAsContext,
  headedPullsPath,
  RenderedBodySchema,
  restAllPages,
  restGet,
  restWrite,
} from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * The open pull requests whose head is `branch` of this repository, at most
 * two: enough to tell none, one and more than one apart. Qualified by the
 * owner, so that a fork's branch of the same name is not taken for it.
 */
export const readOpenPullRequestsHeaded = async (
  context: ReadContext,
  branch: string,
): Promise<Read<readonly PullRequestTarget[]>> =>
  Result.map(
    await restGet(
      context,
      `the open pull requests of ${branch}`,
      headedPullsPath(context, branch, 2),
      t.array(PullStateSchema),
    ),
    (pulls) => pulls.map(stateOf),
  );

/**
 * Opens a pull request from `head` onto `base`, ready for review: never a
 * draft, which `unblock-prs` passes over. Answers its number.
 */
export const createPullRequest = async (
  context: ReadContext,
  pull: Readonly<{ head: string; base: string; title: string; body: string }>,
): Promise<Read<number>> =>
  Result.map(
    await restWrite(
      context,
      `a pull request from ${pull.head}`,
      'POST',
      '/pulls',
      { ...pull, draft: false },
      t.record({ number: t.number() }),
    ),
    ({ number }) => number,
  );

/**
 * Pull request `number` as `--merge-before` reads it: its state, its body, and
 * its branch, which says whether it is the version pull request.
 */
export const readSuccessor = async (
  context: ReadContext,
  number: number,
): Promise<Read<Successor>> =>
  Result.map(
    await restGet(
      context,
      `#${number}`,
      `/pulls/${number}`,
      t.record({
        state: t.string(),
        body: t.union([t.string(), t.nullType]),
        head: t.record({ ref: t.string() }),
      }),
    ),
    ({ state, body, head }) => ({
      state: state.toLowerCase(),
      body: lfOnly(body ?? ''),
      head: head.ref,
    }),
  );

/**
 * Pull request `number`'s body, and what the issues it closes start after
 * (`waitsFor`), with the open pull requests and the issues each closes when any
 * of them waits for something: what `missingInheritedOrder` decides from.
 * Closing issues are read from the keywords GitHub marked in the body, which it
 * marks whatever the base; one linked by hand in the sidebar is not seen. An
 * issue closed, transferred away, or a pull request, waits for nothing.
 * **Changed in v2**: every open pull request is read, where v1 read the first
 * hundred and took them for all.
 */
export const readClosingOrder = async (
  context: ReadContext,
  number: number,
): Promise<Read<ClosingOrder>> => {
  const pull = await restGet(
    context,
    `#${number}`,
    `/pulls/${number}`,
    t.record({
      body: t.union([t.string(), t.nullType]),
      body_html: RenderedBodySchema,
    }),
    'full',
  );

  if (Result.isErr(pull)) {
    return pull;
  }

  const body = lfOnly(pull.value.body ?? '');

  const waits = allRead(
    await Promise.all(
      closingKeywordIssuesInHtml(context, pull.value.body_html).map(
        async (issue) => waitsOfIssue(context, issue),
      ),
    ),
  );

  if (Result.isErr(waits)) {
    return waits;
  }

  const startAfterOf = new Map(
    waits.value.filter((each) => each !== undefined),
  );

  if (!startAfterOf.values().some(Arr.isNonEmpty)) {
    return Result.ok({ body, startAfterOf, others: [] });
  }

  const open = await restAllPages(
    context,
    'the open pull requests',
    // Oldest first, as every reader of them all: a list newest first shifts
    // under a pull request opened while it is paged, and one is read twice or
    // not at all.
    OPEN_PULLS_PATH,
    t.array(t.record({ number: t.number(), body_html: RenderedBodySchema })),
    'full',
  );

  return Result.map(open, (pulls) => ({
    body,
    startAfterOf,
    others: pulls
      .filter((other) => other.number !== number)
      .map((other) => ({
        number: other.number,
        closes: closingKeywordIssuesInHtml(context, other.body_html),
      })),
  }));
};

/** A pull request as `open-pr` decides on it. */
export type PullRequestTarget = Readonly<{
  number: number;
  /** What GraphQL addresses it by, to take it out of draft. */
  nodeId: string;
  isDraft: boolean;
  /** The branch it targets. */
  base: string;
}>;

/** A pull request named by `--merge-before`. */
export type Successor = Readonly<{
  /** Lower case: `open` or `closed`. */
  state: string;
  body: string;
  /** Its branch. */
  head: string;
}>;

export type ClosingOrder = Readonly<{
  body: string;
  /** Each open issue the body closes, and what it waits for. */
  startAfterOf: ReadonlyMap<number, readonly number[]>;
  /**
   * Every other open pull request and the issues it closes; empty when no issue
   * it closes waits for anything, and nothing needs them.
   */
  others: readonly Readonly<{ number: number; closes: readonly number[] }>[];
}>;

const PullStateSchema = t.record({
  number: t.number(),
  node_id: t.string(),
  draft: t.boolean(),
  base: t.record({ ref: t.string() }),
});

const stateOf = (pull: t.TypeOf<typeof PullStateSchema>): PullRequestTarget =>
  ({
    number: pull.number,
    nodeId: pull.node_id,
    isDraft: pull.draft,
    base: pull.base.ref,
  }) as const;

/** What open issue `issue` waits for, or `undefined` for one that cannot. */
const waitsOfIssue = async (
  context: ReadContext,
  issue: number,
): Promise<Read<readonly [number, readonly number[]] | undefined>> => {
  const read = await restGet(
    context,
    `issue #${issue}`,
    `/issues/${issue}`,
    t.record({
      state: t.string(),
      body: t.union([t.string(), t.nullType]),
      repository_url: t.string(),
      pull_request: t.optional(t.unknown()),
      issue_dependencies_summary: DependenciesSummarySchema,
    }),
  );

  if (Result.isErr(read)) {
    return read;
  }

  const { state, body, repository_url: url, pull_request: pull } = read.value;

  if (
    pull !== undefined ||
    state.toLowerCase() !== 'open' ||
    !answersAsContext(url, context)
  ) {
    return Result.ok(undefined);
  }

  const blockedBy = await readBlockedBy(
    context,
    issue,
    read.value.issue_dependencies_summary,
  );

  return Result.map(
    blockedBy,
    (blocking) => [issue, waitsFor(body ?? '', blocking)] as const,
  );
};

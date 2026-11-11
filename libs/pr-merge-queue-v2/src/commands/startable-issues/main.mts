/**
 * `startable-issues`: the issues to start next, in the order to take them;
 * writes nothing (`spec/commands.md`, `startable-issues`). Over REST alone, as a
 * Claude Code session's proxy allows.
 */

import {
  branchTipsNotRead,
  decideQueue,
  heldThemes,
  orderByTheme,
  readContextOf,
  readSnapshotRest,
  surveyIssues,
  type IssueDecision,
  type Read,
  type ReadContext,
  type RepoRef,
  type Transport,
} from 'pr-report-core-v2';
import { Arr, Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import { messageOf, resolveRepo, resolveToken } from '../../github/index.mjs';
import { parseAttempted } from '../../state/index.mjs';
import type { StartableIssuesOptions } from './options.mjs';
import { renderStartable } from './render.mjs';

/** What the command reads the world through; a test passes recorded ones. */
export type StartableIssuesWorld = Readonly<{
  transport: Transport;
  env: ReadonlyRecord<string, string | undefined>;
  nowEpochMs: number;
  originUrl: () => Promise<string | undefined>;
  manifestUrl: () => Promise<string | undefined>;
  /** `gh auth token`, asked only when the environment holds no token. */
  ghAuthToken: () => Promise<Result<string, string>>;
  /** Where the `run-issue-resolver` record of `repo` is. */
  attemptedFile: (repo: RepoRef) => string;
  /** A state file's text; `undefined` when there is none. */
  readTextFile: (file: string) => Promise<Result<string | undefined, string>>;
}>;

/** The listing, or why there is none. */
export const startableIssues = async (
  options: StartableIssuesOptions,
  world: StartableIssuesWorld,
): Promise<Result<string, string>> => {
  const repo = await resolveRepo(options.repo, world);

  if (Result.isErr(repo)) {
    return repo;
  }

  // Without a token the comments a claim is in are another account's, and the
  // default author is nobody.
  const token = await resolveToken(world.env, world.ghAuthToken);

  if (Result.isErr(token)) {
    return token;
  }

  // By the name the repository was resolved by, as `run-issue-resolver` writes
  // it; local and cheap, so a record that does not parse fails before any
  // request.
  const file = world.attemptedFile(repo.value);

  const recordText = await world.readTextFile(file);

  const attempted = Result.isErr(recordText)
    ? recordText
    : parseAttempted(recordText.value, file);

  if (Result.isErr(attempted)) {
    return attempted;
  }

  const read = await readIssueDecisions(
    readContextOf({
      transport: world.transport,
      owner: repo.value.owner,
      name: repo.value.name,
      token: token.value,
    }),
    world.nowEpochMs,
  );

  if (Result.isErr(read)) {
    return read;
  }

  const { issues, viewer, cutShort } = read.value;

  const authors = Arr.isNonEmpty(options.authors)
    ? Result.ok(options.authors)
    : Result.map(viewer, (login) => [login]);

  if (Result.isErr(authors)) {
    return Result.err(
      `${messageOf(authors.value)}; it is whose issues are listed unless --author names them`,
    );
  }

  const survey = surveyIssues(issues, {
    authors: authors.value,
    attempted: attempted.value,
  });

  const held = heldThemes(issues, options.by);

  return Result.ok(
    renderStartable({
      survey,
      order: orderByTheme(survey.fresh, {
        held: held.held,
        theme: options.theme,
      }),
      held,
      authors: authors.value,
      limit: options.limit,
      theme: options.theme,
      cutShort,
      // A fresh issue read with part of it missing may be claimed after all;
      // `start-issue` refuses one that is.
      unsure: issues
        .filter(({ unread }) => unread !== undefined)
        .map(({ facts }) => facts.number)
        .filter((number) =>
          survey.fresh.some((issue) => issue.number === number),
        ),
    }),
  );
};

/**
 * The open issues as `decideQueue` decides them, over REST alone; the token's
 * account, unread or not; and how many were read when the list was cut short.
 * `run-issue-resolver` surveys the same.
 */
export const readIssueDecisions = async (
  context: ReadContext,
  nowEpochMs: number,
): Promise<
  Result<
    Readonly<{
      issues: readonly IssueDecision[];
      viewer: Read<string>;
      cutShort: number | undefined;
    }>,
    string
  >
> => {
  const snapshot = await readSnapshotRest(context, {
    nowEpochMs,
    issuesLimit: ISSUES_LIMIT,
    // The merged pull requests are not read from; one is the least asked.
    mergedLimit: 1,
    mergedDays: 1,
    follow: [],
    readBranchTips: branchTipsNotRead,
  });

  if (Result.isErr(snapshot)) {
    return Result.err(messageOf(snapshot.value));
  }

  const { openIssues } = snapshot.value;

  if (Result.isErr(openIssues)) {
    return Result.err(messageOf(openIssues.value));
  }

  const decision = decideQueue(snapshot.value, {
    nowEpochMs,
    demoted: new Set<number>(),
  });

  if (Result.isErr(decision)) {
    return Result.err(messageOf(decision.value));
  }

  const { issues } = decision.value;

  // Err exactly when `openIssues` is, which returned above: narrowed again only
  // for the types. The decision keeps issues a `Read` for the readers that go
  // on without them (`pr-report`, the PR Manager).
  return Result.isErr(issues)
    ? Result.err(messageOf(issues.value))
    : Result.ok({
        issues: issues.value,
        viewer: snapshot.value.repository.viewer,
        cutShort: openIssues.value.complete
          ? undefined
          : openIssues.value.issues.length,
      });
};

/**
 * How many open issues it reads: up to a thousand, rather than the report's
 * thirty, since the oldest are as startable as the newest.
 */
export const ISSUES_LIMIT = 1000;

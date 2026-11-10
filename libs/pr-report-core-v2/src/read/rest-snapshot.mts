/**
 * A whole {@link Snapshot} over REST, which the session commands read: every
 * part GraphQL alone serves is `skipped` (`rest-pull-requests.mts`).
 */

import { Arr, Result } from 'ts-data-forge';
import {
  instantOf,
  parseMergeAfter,
  parseStartAfter,
} from '../conventions/index.mjs';
import type {
  IssueFacts,
  OpenIssues,
  PullRequestFacts,
  Read,
  ReferenceFacts,
  Snapshot,
} from '../snapshot/index.mjs';
import { skipped } from './classify.mjs';
import { readHeadChecks } from './rest-checks.mjs';
import {
  readFollowed,
  readMerged,
  readNumbers,
  readOpenIssues,
} from './rest-issues.mjs';
import { readQueueLayers } from './rest-layers.mjs';
import { readPullRequests } from './rest-pull-requests.mjs';
import { readRepositoryFacts, readRequirements } from './rest-repository.mjs';
import type { ReadContext } from './transport.mjs';

export type SnapshotOptions = Readonly<{
  /** When the read begins, in milliseconds since the epoch. */
  nowEpochMs: number;
  /** How many open issues to read (`--issues-limit`). */
  issuesLimit: number;
  /** How many merged pull requests to read, and from how many days back. */
  mergedLimit: number;
  mergedDays: number;
  /** Pull requests to say the fate of once they are no longer open. */
  follow: readonly number[];
  /**
   * Where each branch's tip is, which only `git ls-remote --heads` says: the
   * worker passes its own, everyone else {@link branchTipsNotRead}.
   */
  readBranchTips: () => Promise<Read<ReadonlyMap<string, string>>>;
}>;

/** For a reader with no `git` at hand: the branch tips are `skipped`. */
export const branchTipsNotRead = (): Promise<
  Read<ReadonlyMap<string, string>>
> =>
  Promise.resolve(
    Result.err(skipped('the branch tips', 'read without git ls-remote')),
  );

/**
 * Every part of a snapshot, read in parallel where nothing orders them. No
 * snapshot at all where the repository's facts are unread: every head is judged
 * against the default branch's tip.
 */
export const readSnapshotRest = async (
  context: ReadContext,
  options: SnapshotOptions,
): Promise<Read<Snapshot>> => {
  const repository = await readRepositoryFacts(context);

  if (Result.isErr(repository)) {
    return repository;
  }

  const { repo, defaultBranch, defaultBranchTip, viewer } = repository.value;

  // Every later read names the repository as GitHub does now, which is what its
  // answers name it by.
  const current: ReadContext = {
    ...context,
    owner: repo.owner,
    name: repo.name,
  } as const;

  const pullRequestsRead = readPullRequests(current, { viewer, defaultBranch });

  const openIssuesRead = readOpenIssues(current, {
    limit: options.issuesLimit,
    viewer,
  });

  const [
    requirements,
    defaultBranchChecks,
    [pullRequests, openIssues, named],
    merged,
    queueLayers,
    branchTips,
    followed,
  ] = await Promise.all([
    readRequirements(current, defaultBranch),
    readHeadChecks(current, defaultBranchTip),
    // What the open pull requests and issues name is read as soon as they are,
    // beside the rest.
    Promise.all([pullRequestsRead, openIssuesRead]).then(
      async ([pulls, issues]) =>
        [pulls, issues, await namedOf(current, viewer, pulls, issues)] as const,
    ),
    readMerged(current, {
      limit: options.mergedLimit,
      days: options.mergedDays,
      nowEpochMs: options.nowEpochMs,
    }),
    readQueueLayers(current),
    options.readBranchTips(),
    readFollowed(current, options.follow),
  ]);

  return Result.ok({
    readAt: instantOf(options.nowEpochMs),
    authenticated: context.token !== undefined,
    repository: repository.value,
    requirements,
    defaultBranchChecks,
    pullRequests,
    openIssues,
    // Unread, the open issues would leave an open issue named by a pull request
    // to be taken for one that is not open.
    otherIssues: Result.isErr(openIssues)
      ? openIssues
      : Result.map(named, ({ issues }) => issues),
    references: Result.map(named, ({ references }) => references),
    merged,
    queueLayers,
    branchTips,
    followed,
  });
};

/** Numbers named, read as issues or as references. */
type Named = Readonly<{
  issues: ReadonlyMap<number, IssueFacts>;
  references: ReadonlyMap<number, ReferenceFacts>;
}>;

const namedByPullRequest = (pr: PullRequestFacts): readonly number[] =>
  [
    ...(Result.isOk(pr.closingIssues)
      ? pr.closingIssues.value.map(({ number }) => number)
      : ([] as const)),
    ...parseStartAfter(pr.body),
    ...parseMergeAfter(pr.body),
  ] as const;

const namedFrom = async (
  context: ReadContext,
  viewer: Read<string>,
  numbers: readonly number[],
  seen: ReadonlySet<number>,
  found: Named,
): Promise<Read<Named>> => {
  const fresh = Arr.uniq(numbers.filter((number) => !seen.has(number)));

  if (!Arr.isNonEmpty(fresh)) {
    return Result.ok(found);
  }

  const read = await readNumbers(context, fresh, viewer);

  if (Result.isErr(read)) {
    return read;
  }

  return namedFrom(
    context,
    viewer,
    Array.from(read.value.issues.values()).flatMap(({ body }) =>
      parseStartAfter(body),
    ),
    new Set<number>([...seen, ...fresh]),
    {
      issues: new Map<number, IssueFacts>([
        ...found.issues,
        ...read.value.issues,
      ]),
      references: new Map<number, ReferenceFacts>([
        ...found.references,
        ...read.value.references,
      ]),
    },
  );
};

/**
 * Every number the open pull requests close or declare, and every number an
 * open issue declares, that is neither open pull request nor open issue read:
 * as issues where they are, as references where not. The issues read declare
 * further numbers in turn, until none is new, since an inherited `Start-After:`
 * is followed to its end.
 */
const readNamed = async (
  context: ReadContext,
  viewer: Read<string>,
  read: Readonly<{
    pullRequests: readonly PullRequestFacts[];
    openIssues: readonly IssueFacts[];
  }>,
): Promise<Read<Named>> =>
  namedFrom(
    context,
    viewer,
    [
      ...read.pullRequests.flatMap(namedByPullRequest),
      ...read.openIssues.flatMap(({ body }) => parseStartAfter(body)),
    ],
    new Set<number>([
      ...read.pullRequests.map(({ number }) => number),
      ...read.openIssues.map(({ number }) => number),
    ]),
    {
      issues: new Map<number, IssueFacts>(),
      references: new Map<number, ReferenceFacts>(),
    },
  );

/**
 * What the open pull requests and issues name. Unread, the pull requests would
 * read as naming nothing: the numbers they name are unread with them. Open
 * issues unread name nothing here, and the issues found are unread with them
 * (`readSnapshotRest`); the references stand, an issue never being one.
 */
const namedOf = async (
  context: ReadContext,
  viewer: Read<string>,
  pullRequests: Read<readonly PullRequestFacts[]>,
  openIssues: Read<OpenIssues>,
): Promise<Read<Named>> =>
  Result.isErr(pullRequests)
    ? pullRequests
    : readNamed(context, viewer, {
        pullRequests: pullRequests.value,
        openIssues: Result.isOk(openIssues) ? openIssues.value.issues : [],
      });

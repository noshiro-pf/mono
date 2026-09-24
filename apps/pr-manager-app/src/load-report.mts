/**
 * Reading the report out of GitHub, straight from the page.
 *
 * There is no report file any more: every read asks GitHub about the open
 * pull requests as they are now, so pressing **Refresh** shows what GitHub
 * shows. What is decided about them — the verdict over the required
 * contexts, the merge order the `Merge-After:` trailers declare, the counts —
 * is `pr-report-core`, the same code `pnpm run pr-report` decides it with.
 * What is added here is what only this page reports: whether a pull request
 * conflicts with its base, and whether it waits for a code owner.
 */

import {
  buildEntries,
  closingIssuesIn,
  MAIN_RULESET_PATH,
  parseRuleset,
  reportedContexts,
  summarize,
  type CheckRunReport,
  type Comparison,
  type Label,
  type MergedPullRequest,
  type PrReport,
  type PullRequestFacts,
  type RepoRef,
  type ReportEntry,
  type RulesetRequirements,
  type Summary,
} from 'pr-report-core';
import { Arr, isRecord, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  codeOwnerReview,
  parseCodeOwners,
  type CodeOwnerReview,
  type CodeOwnersRule,
} from './code-owners.mjs';
import { type ReportSource } from './constants.mjs';
import {
  askGraphql,
  type Answered,
  type Fetch,
  type GraphqlAnswer,
  type GraphqlError,
} from './graphql.mjs';
import { type RateLimit } from './rate-limit.mjs';
import {
  CompareFieldSchema,
  ContextsFieldSchema,
  FilesFieldSchema,
  followUpAlias,
  followUpQuery,
  OPEN_LIMIT,
  REPORT_QUERY,
  ReportDataSchema,
  type ContextNode,
  type FollowUp,
  type MergedPullRequestNode,
  type OpenPullRequest,
} from './report-query.mjs';
import { epochMsOf } from './timestamp.mjs';

/** Whether GitHub can merge the head into its base without a conflict. */
export type Mergeability = 'conflicting' | 'mergeable' | 'unknown';

/** One open pull request, as the page shows it. */
export type Entry = ReportEntry &
  Readonly<{
    /**
     * `conflicting` is the state `unblock-prs` cannot get past: its rebase
     * stops on the conflict and it sets the pull request aside, which it
     * used to be the only one to know.
     */
    mergeability: Mergeability;
    codeOwnerReview: CodeOwnerReview;
  }>;

export type Merged = MergedPullRequest & Readonly<{ mergedAtEpochMs: number }>;

export type PageSummary = Summary &
  Readonly<{
    conflicting: number;
    /** Waiting for a code owner to approve. */
    awaitingReview: number;
  }>;

export type LoadedReport = Readonly<{
  repo: RepoRef;
  /** When the answer this was built from arrived. */
  readAtEpochMs: number;
  required: readonly string[];
  summary: PageSummary;
  entries: readonly Entry[];
  roots: PrReport['roots'];
  cycles: PrReport['cycles'];
  /** Merged within {@link MERGED_WITHIN_DAYS}, newest first. */
  merged: readonly Merged[];
}>;

/**
 * A week, so that a Monday still covers the Friday — the same window
 * `pnpm run pr-report` defaults to.
 */
export const MERGED_WITHIN_DAYS = 7;

/** And at most this many of them, so the section stays a list. */
const MERGED_LIMIT = 20;

export type LoadRequest = Readonly<{
  token: string;
  /** The instant "merged in the last week" is measured back from. */
  nowMs: number;
  fetchImpl?: Fetch;
}>;

/**
 * The report, or a sentence a reader can act on.
 *
 * One report query, then follow-ups until nothing is left to follow up. The
 * first follow-up always runs, because how far each head is from its base
 * can only be asked once the heads are known; any more are a list that did
 * not fit in one page, which is rare and bounded by
 * {@link MAX_FOLLOW_UP_ROUNDS}.
 */
export const loadReport = async (
  source: ReportSource,
  request: LoadRequest,
): Promise<Answered<LoadedReport>> => {
  const { token, nowMs, fetchImpl } = request;

  const repo: RepoRef = { owner: source.owner, name: source.repo } as const;

  const variables = { owner: repo.owner, name: repo.name } as const;

  const first = await askGraphql({
    query: REPORT_QUERY,
    variables,
    token,
    ...(fetchImpl === undefined ? {} : { fetchImpl }),
  });

  if (Result.isErr(first.result)) {
    return { rateLimit: first.rateLimit, result: first.result };
  }

  const read = readReportData(first.result.value.data);

  if (Result.isErr(read)) {
    return { rateLimit: first.rateLimit, result: read };
  }

  const { requirements, codeOwners, openPulls, merged } = read.value;

  const followedUp = await followUpRounds({
    pulls: openPulls.map((pr) =>
      initialState(pr, requirements.requireCodeOwnerReview),
    ),
    rounds: MAX_FOLLOW_UP_ROUNDS,
    rateLimit: first.rateLimit,
    ask: async (pending) => {
      const { query, variables: bound } = followUpQuery(pending);

      return askGraphql({
        query,
        variables: { ...variables, ...bound },
        token,
        ...(fetchImpl === undefined ? {} : { fetchImpl }),
      });
    },
  });

  const { rateLimit } = followedUp;

  if (Result.isErr(followedUp.result)) {
    return { rateLimit, result: followedUp.result };
  }

  const pulls = followedUp.result.value;

  const unfinished = pulls.find((pull) => pull.contextsAfter !== undefined);

  if (unfinished !== undefined) {
    return {
      rateLimit,
      result: Result.err(
        `#${unfinished.pr.number} has more check results than this page reads, so its verdict would be a guess.`,
      ),
    };
  }

  return {
    rateLimit,
    result: Result.ok(
      assemble({
        repo,
        nowMs,
        required: requirements.requiredContexts,
        requireCodeOwnerReview: requirements.requireCodeOwnerReview,
        codeOwners,
        pulls,
        merged,
      }),
    ),
  };
};

/**
 * Asks for whatever is left to follow up, folds the answer in, and goes
 * round again until nothing is left or the rounds run out. One round at a
 * time, because each round's questions are the previous round's cursors.
 */
const followUpRounds = async ({
  pulls,
  rounds,
  rateLimit,
  ask,
}: Readonly<{
  pulls: readonly PullState[];
  rounds: number;
  rateLimit: RateLimit | undefined;
  ask: (pending: readonly FollowUp[]) => Promise<Answered<GraphqlAnswer>>;
}>): Promise<Answered<readonly PullState[]>> => {
  const followUps = pulls.flatMap(followUpsOf);

  if (rounds <= 0 || !Arr.isNonEmpty(followUps)) {
    return { rateLimit, result: Result.ok(pulls) };
  }

  const answered = await ask(followUps);

  const latestLimit = answered.rateLimit ?? rateLimit;

  if (Result.isErr(answered.result)) {
    return { rateLimit: latestLimit, result: answered.result };
  }

  const applied = applyFollowUps(
    pulls,
    followUps,
    answered.result.value.data,
    answered.result.value.errors,
  );

  if (Result.isErr(applied)) {
    return { rateLimit: latestLimit, result: applied };
  }

  return followUpRounds({
    pulls: applied.value,
    rounds: rounds - 1,
    rateLimit: latestLimit,
    ask,
  });
};

/**
 * How many follow-ups one read may make. Each is one request of about a
 * point; ten is a thousand check results or changed files for the pull
 * request with the most, which is past anything this repository produces.
 */
const MAX_FOLLOW_UP_ROUNDS = 10;

/** What is known about one open pull request partway through a read. */
type PullState = Readonly<{
  pr: OpenPullRequest;
  contexts: readonly ContextNode[];
  /** Where the next page of check results starts, if there is one. */
  contextsAfter: string | undefined;
  files: readonly string[];
  /** Where the next page of changed files starts, if it is wanted. */
  filesAfter: string | undefined;
  /** Whether the files were read to the end. */
  filesComplete: boolean;
  /** `pending` until the follow-up that reads it has run. */
  comparison: Comparison | 'pending' | undefined;
}>;

const readReportData = (
  data: unknown,
): Result<
  Readonly<{
    requirements: RulesetRequirements;
    codeOwners: readonly CodeOwnersRule[];
    openPulls: readonly OpenPullRequest[];
    merged: readonly MergedPullRequestNode[];
  }>,
  string
> => {
  const validated = ReportDataSchema.validate(data);

  if (Result.isErr(validated)) {
    return Result.err(
      `GitHub's answer is not the shape this page expects:\n${t.validationErrorsToMessages(validated.value).join('\n')}`,
    );
  }

  const { ruleset, codeOwners, merged } = validated.value.repository;

  const openPulls = validated.value.repository.open;

  if (openPulls.totalCount > OPEN_LIMIT) {
    return Result.err(
      `There are ${openPulls.totalCount} open pull requests; this page reads ${OPEN_LIMIT} and would report a part of them as the whole.`,
    );
  }

  if (ruleset === null) {
    return Result.err(
      `${MAIN_RULESET_PATH} is not on the default branch, so there is nothing to say which checks are required.`,
    );
  }

  const requirements = parseRuleset(
    ruleset.text,
    `${MAIN_RULESET_PATH} on the default branch`,
  );

  if (Result.isErr(requirements)) {
    return requirements;
  }

  return Result.ok({
    requirements: requirements.value,
    codeOwners: codeOwners === null ? [] : parseCodeOwners(codeOwners.text),
    openPulls: openPulls.nodes,
    merged: merged.nodes,
  });
};

const initialState = (pr: OpenPullRequest, wantFiles: boolean): PullState => {
  const rollup = pr.commits.nodes[0]?.commit.statusCheckRollup ?? null;

  const { files } = pr;

  return {
    pr,
    contexts: rollup?.contexts.nodes ?? [],
    contextsAfter: nextCursor(rollup?.contexts.pageInfo),
    files: files.nodes.map(({ path }) => path),
    // Changed files are only read to decide code-owner review, so there is
    // no reason to page through them when the ruleset does not ask for it.
    filesAfter: wantFiles ? nextCursor(files.pageInfo) : undefined,
    filesComplete: !files.pageInfo.hasNextPage,
    comparison: 'pending',
  };
};

const nextCursor = (
  pageInfo:
    Readonly<{ hasNextPage: boolean; endCursor: string | null }> | undefined,
): string | undefined =>
  pageInfo?.hasNextPage === true && pageInfo.endCursor !== null
    ? pageInfo.endCursor
    : undefined;

const followUpsOf = (pull: PullState): readonly FollowUp[] => {
  const { number, headRefOid, baseRefName } = pull.pr;

  return [
    ...(pull.comparison === 'pending'
      ? [
          {
            kind: 'compare',
            number,
            baseQualifiedName: `refs/heads/${baseRefName}`,
            headSha: headRefOid,
          } as const,
        ]
      : []),
    ...(pull.contextsAfter === undefined
      ? []
      : [
          {
            kind: 'contexts',
            number,
            headSha: headRefOid,
            after: pull.contextsAfter,
          } as const,
        ]),
    ...(pull.filesAfter === undefined
      ? []
      : [{ kind: 'files', number, after: pull.filesAfter } as const]),
  ];
};

/**
 * What one follow-up answered, folded into what was known.
 *
 * A comparison GitHub could not make is a gap the page can show — "ahead /
 * behind unread" — so its error is not a failure. A page of check results or
 * changed files that did not arrive is: a verdict over half the checks, or a
 * review state over half the files, would be a guess presented as a fact.
 */
const applyFollowUps = (
  pulls: readonly PullState[],
  followUps: readonly FollowUp[],
  data: unknown,
  errors: readonly GraphqlError[],
): Result<readonly PullState[], string> => {
  const repository: unknown = isRecord(data) ? data['repository'] : undefined;

  const field = (alias: string): unknown =>
    isRecord(repository) ? repository[alias] : undefined;

  const failed = errors.find(
    (error) =>
      typeof error.path[1] === 'string' &&
      !error.path[1].startsWith('compare_'),
  );

  if (failed !== undefined) {
    return Result.err(`GitHub could not finish the read: ${failed.message}`);
  }

  const mut_byNumber = new Map(pulls.map((pull) => [pull.pr.number, pull]));

  for (const followUp of followUps) {
    const pull = mut_byNumber.get(followUp.number);

    if (pull === undefined) {
      continue;
    }

    const next = applyOne(pull, followUp, field(followUpAlias(followUp)));

    if (Result.isErr(next)) {
      return next;
    }

    mut_byNumber.set(followUp.number, next.value);
  }

  return Result.ok(
    pulls.map((pull) => mut_byNumber.get(pull.pr.number) ?? pull),
  );
};

const applyOne = (
  pull: PullState,
  followUp: FollowUp,
  value: unknown,
): Result<PullState, string> => {
  switch (followUp.kind) {
    case 'compare': {
      const validated = CompareFieldSchema.validate(value ?? null);

      return Result.ok({
        ...pull,
        comparison:
          Result.isOk(validated) && validated.value?.compare != null
            ? validated.value.compare
            : undefined,
      });
    }

    case 'contexts': {
      const validated = ContextsFieldSchema.validate(value);

      if (Result.isErr(validated)) {
        return Result.err(
          `GitHub did not send the rest of #${pull.pr.number}'s check results.`,
        );
      }

      const page = validated.value.statusCheckRollup?.contexts;

      return Result.ok({
        ...pull,
        contexts: [...pull.contexts, ...(page?.nodes ?? [])],
        contextsAfter: nextCursor(page?.pageInfo),
      });
    }

    case 'files': {
      const validated = FilesFieldSchema.validate(value);

      if (Result.isErr(validated)) {
        return Result.err(
          `GitHub did not send the rest of #${pull.pr.number}'s changed files.`,
        );
      }

      const { files } = validated.value;

      const filesAfter = nextCursor(files.pageInfo);

      return Result.ok({
        ...pull,
        files: [...pull.files, ...files.nodes.map(({ path }) => path)],
        filesAfter,
        filesComplete: filesAfter === undefined,
      });
    }
  }
};

/** Everything read, arranged into what the page shows. */
const assemble = ({
  repo,
  nowMs,
  required,
  requireCodeOwnerReview,
  codeOwners,
  pulls,
  merged,
}: Readonly<{
  repo: RepoRef;
  nowMs: number;
  required: readonly string[];
  requireCodeOwnerReview: boolean;
  codeOwners: readonly CodeOwnersRule[];
  pulls: readonly PullState[];
  merged: readonly MergedPullRequestNode[];
}>): LoadedReport => {
  const report = buildEntries({
    required,
    pulls: pulls.map((pull) => factsOf(repo, pull)),
  });

  const byNumber = new Map(pulls.map((pull) => [pull.pr.number, pull]));

  const entries: readonly Entry[] = report.entries.map((entry) => {
    const pull = byNumber.get(entry.number);

    return {
      ...entry,
      mergeability: mergeabilityOf(pull?.pr.mergeable),
      codeOwnerReview:
        pull === undefined
          ? { state: 'unknown' }
          : codeOwnerReview({
              required: requireCodeOwnerReview,
              rules: codeOwners,
              files: pull.files,
              filesComplete: pull.filesComplete,
              approvers: approversOf(pull.pr),
              author: entry.author,
            }),
    };
  });

  const cutoff = nowMs - MERGED_WITHIN_DAYS * MS_PER_DAY;

  return {
    repo,
    readAtEpochMs: nowMs,
    required,
    summary: {
      ...summarize(entries),
      conflicting: entries.filter(
        ({ mergeability }) => mergeability === 'conflicting',
      ).length,
      awaitingReview: entries.filter(
        (entry) => entry.codeOwnerReview.state === 'required',
      ).length,
    },
    entries,
    roots: report.roots,
    cycles: report.cycles,
    merged: merged
      .flatMap((pr) => {
        const mergedAtEpochMs = epochMsOf(pr.mergedAt);

        return mergedAtEpochMs === undefined
          ? []
          : [mergedOf(repo, pr, mergedAtEpochMs)];
      })
      .filter(({ mergedAtEpochMs }) => mergedAtEpochMs >= cutoff)
      .toSorted((a, b) => b.mergedAtEpochMs - a.mergedAtEpochMs)
      .slice(0, MERGED_LIMIT),
  };
};

const MS_PER_DAY = 86_400_000;

const factsOf = (repo: RepoRef, pull: PullState): PullRequestFacts => {
  const { pr } = pull;

  const runs: readonly CheckRunReport[] = pull.contexts.flatMap((node) =>
    node.__typename === 'CheckRun'
      ? [
          {
            name: node.name,
            // The REST spelling, which is what the shared verdict is written
            // against: GraphQL says `COMPLETED` where REST says `completed`.
            status: node.status.toLowerCase(),
            conclusion: node.conclusion?.toLowerCase(),
            checkSuiteId: node.checkSuite?.databaseId ?? 0,
            id: node.databaseId ?? 0,
          },
        ]
      : [],
  );

  const statuses = pull.contexts.flatMap((node) =>
    node.__typename === 'StatusContext'
      ? [{ context: node.context, state: statusState(node.state) }]
      : [],
  );

  return {
    number: pr.number,
    title: pr.title,
    body: pr.body,
    author: pr.author?.login ?? GHOST,
    isDraft: pr.isDraft,
    labels: labelsOf(pr.labels.nodes),
    autoMerge: pr.autoMergeRequest !== null,
    headRef: pr.headRefName,
    headSha: pr.headRefOid,
    baseRef: pr.baseRefName,
    url: pr.url,
    updatedAt: pr.updatedAt,
    comparison: pull.comparison === 'pending' ? undefined : pull.comparison,
    reported: reportedContexts(runs, statuses),
    linkedIssues: closingIssuesIn(repo, pr.closingIssuesReferences.nodes),
  };
};

/**
 * A commit status's state as the REST API spells it. `EXPECTED` is GraphQL's
 * alone — a required status nothing has reported yet — and is a wait, not a
 * failure.
 */
const statusState = (state: string): string =>
  state === 'EXPECTED' ? 'pending' : state.toLowerCase();

/**
 * GitHub works this out in the background after every push to either side,
 * and says `UNKNOWN` until it has; the next read will know.
 */
const mergeabilityOf = (mergeable: string | undefined): Mergeability =>
  mergeable === 'CONFLICTING'
    ? 'conflicting'
    : mergeable === 'MERGEABLE'
      ? 'mergeable'
      : 'unknown';

const approversOf = (pr: OpenPullRequest): readonly string[] =>
  pr.latestOpinionatedReviews.nodes.flatMap(({ state, author }) =>
    state === 'APPROVED' && author !== null ? [author.login] : [],
  );

const mergedOf = (
  repo: RepoRef,
  pr: MergedPullRequestNode,
  mergedAtEpochMs: number,
): Merged =>
  ({
    number: pr.number,
    title: pr.title,
    author: pr.author?.login ?? GHOST,
    url: pr.url,
    headRef: pr.headRefName,
    baseRef: pr.baseRefName,
    mergedAt: pr.mergedAt,
    mergedAtEpochMs,
    labels: labelsOf(pr.labels.nodes),
    linkedIssues: closingIssuesIn(repo, pr.closingIssuesReferences.nodes),
  }) as const;

/** What GitHub calls an account that has been deleted. */
const GHOST = 'ghost';

/**
 * GitHub sends a `null` description for a label that has none; the report
 * carries the empty string, so that nothing downstream has to know the
 * difference.
 */
const labelsOf = (
  labels: readonly Readonly<{
    name: string;
    color: string;
    description: string | null;
  }>[],
): readonly Label[] =>
  labels.map((label) => ({
    name: label.name,
    color: label.color,
    description: label.description ?? '',
  }));

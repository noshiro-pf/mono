/**
 * Reading the report out of GitHub, straight from the page.
 *
 * There is no report file any more: every read asks GitHub about the open pull
 * requests as they are now, so pressing **Refresh** shows what GitHub shows.
 * What is decided about them — the verdict over the required contexts, the
 * merge order the `Merge-After:` trailers and the stacks declare, the counts —
 * is `pr-report-core`, the same code `pnpm run pr-report` decides it with.
 * What is added here is what only this page reports: why `unblock-prs` set a
 * pull request aside, and whether it waits for a code owner.
 *
 * A read is several queries sent at once, one per part of the page
 * (`report-query.mts` says why), and the report is put together from whatever
 * of them has answered: a part still out is marked as being read rather than
 * left looking empty.
 */

import {
  anyRunInProgress,
  buildEntries,
  closingIssuesIn,
  closingKeywordIssuesIn,
  codeOwnerGate,
  codeOwnerReview,
  codeOwnersEnforcedBy,
  epochMsOf,
  namesEveryChangedPath,
  parseCodeOwners,
  parseMergeAfter,
  parseSetAsideComment,
  PENDING_LABEL,
  referenceStatusOf,
  reportedContexts,
  setAsideStillApplies,
  summarize,
  waitsFor,
  type CheckRunReport,
  type CodeOwnerReview,
  type CodeOwnersRule,
  type Comparison,
  type IssueDeclarations,
  type Label,
  type LinkedIssue,
  type MergedPullRequest,
  type OpenIssue,
  type PrReport,
  type PullRequestFacts,
  type ReferenceStatus,
  type RepoRef,
  type ReportEntry,
  type RulesetRequirements,
  type SetAside,
} from 'pr-report-core';
import type { ClaudeSession } from 'split-view-link';
import { Arr, isRecord, Obj, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord, StrictPick } from 'ts-type-forge';
import { loadBranchRules } from './branch-rules.mjs';
import { parseClaudeSessions } from './claude-session.mjs';
import type { ReportSource } from './constants.mjs';
import {
  askGraphql,
  type Answered,
  type Fetch,
  type GraphqlAnswer,
} from './graphql.mjs';
import { checksFailureOf } from './part-failures.mjs';
import { queueViewOf, type QueuePull, type QueueView } from './queue-view.mjs';
import type { RateLimit } from './rate-limit.mjs';
import {
  ChecksDataSchema,
  CompareFieldSchema,
  ContextsFieldSchema,
  DETAILED_PAGE_SIZE,
  DetailsDataSchema,
  FilesFieldSchema,
  followUpAlias,
  followUpQuery,
  issueAlias,
  ISSUES_LIMIT,
  ISSUES_PAGE_SIZE,
  issuesQuery,
  IssueWithBodySchema,
  MAX_OPEN_PULLS,
  MERGED_QUERY,
  MergedDataSchema,
  mergedSearch,
  OPEN_ISSUES_QUERY,
  OPEN_PULLS_QUERIES,
  OpenIssuesDataSchema,
  PullRequestsDataSchema,
  referenceAlias,
  ReferenceSchema,
  referencesQuery,
  type BlockedByNodes,
  type CheckSuiteNode,
  type ContextNode,
  type FollowUp,
  type FollowUpName,
  type MergedPullRequestNode,
  type OpenIssueNode,
  type OpenIssuePage,
  type OpenPullRequest,
  type OpenPullsQuery,
  type PullRequestDetails,
} from './report-query.mjs';
import type { RestFetch } from './workflow-runs.mjs';

/**
 * What `unblock-prs` said when it last set the pull request aside, read from
 * the record its comment on the pull request starts with. `current` is whether
 * it still applies: set aside against a base that has since moved, the next run
 * tries again. `retry` is a person having ticked the comment's retry box, which
 * the next run acts on.
 */
export type SetAsideView = SetAside &
  Readonly<{ current: boolean; retry: boolean; url: string }>;

/**
 * The parts of a pull request's card that a query of their own reads:
 * `checks` the verdict, `comparison` how far the head is from its base, and
 * `details` the set-aside record, the code owner's review and the linked
 * issues.
 */
export type EntryPart = 'checks' | 'comparison' | 'details';

/** One open pull request, as the page shows it. */
export type Entry = ReportEntry &
  Readonly<{
    /**
     * Absent unless `unblock-prs` set this head aside. Its own record rather
     * than GitHub's `mergeable`, which says whether a *merge* conflicts —
     * `pr-report-core`'s `set-aside.mts` says why that is not the question.
     */
    setAside: SetAsideView | undefined;
    codeOwnerReview: CodeOwnerReview;
    /** Read from the `Claude-Session:` trailers in the body. */
    claudeSessions: readonly ClaudeSession[];
    /**
     * Why the head's checks were not judged although they were read: it has
     * more results than a read follows. `checks` is then the stand-in for none
     * reported, which the page does not show as a verdict.
     */
    checksUnread: string | undefined;
    /**
     * The parts not read yet. What a listed part fills in holds a stand-in — no
     * checks reported, no comparison, no review asked for — which the page does
     * not show as if it had been read.
     */
    reading: readonly EntryPart[];
  }>;

export type Merged = MergedPullRequest & Readonly<{ mergedAtEpochMs: number }>;

/**
 * The counts the merge order leads with. A count is `undefined` while what it
 * counts is still being read for any pull request, because a count of the ones
 * read so far would be a number that is wrong until it is not.
 */
export type PageSummary = Readonly<{
  open: number;
  /** Labelled `merge-queued`: the author saying it is to be landed. */
  queued: number;
  draft: number;
  failing: number | undefined;
  /** Set aside by `unblock-prs`, against the base as it is now. */
  setAside: number | undefined;
  /** Waiting for a code owner to approve. */
  awaitingReview: number | undefined;
  /** Labelled `pending`: the author holding it back for now. */
  pending: number;
}>;

/**
 * What the repository has of what this repository runs, which decides what the
 * page has to say. Without any of it the page is still the merge order, the
 * stacks, the checks and the issues' dependencies; that is how it is used on
 * most other repositories.
 */
export type RepoFeatures = Readonly<{
  /**
   * Whether the default branch requires any context, by a ruleset or a classic
   * protection rule (`branch-rules.mts`). Without one, each pull request is
   * judged over every context reported on its head.
   */
  requiredChecks: boolean;
  /**
   * Whether a ruleset on the default branch has a code owner approve a change
   * to what they own. `true` until the rules have answered, so that the count
   * it offers is not taken away and given back on every first read here.
   */
  codeOwnerReview: boolean;
  /**
   * Whether the repository has the `merge-queued` label, which is what
   * `unblock-prs`'s queue is made of. Without it there is no queue to draw,
   * nothing is queued and nothing is set aside.
   */
  queue: boolean;
}>;

/** The sections below the merge order, each read by a query of its own. */
export type SectionPart = 'merged' | 'issues';

/**
 * What a read can be asked for on its own: the pull requests with everything
 * read of them, which the merge order and the queue are both drawn from, or one
 * of the sections. A read of a group asks for no other.
 */
export type ReadGroup = 'pulls' | SectionPart;

/** Every group, in the order a read of the page asks for them. */
export const READ_GROUPS = [
  'pulls',
  'merged',
  'issues',
] as const satisfies readonly ReadGroup[];

/** The parts each group is read in. */
export const PARTS_OF_GROUP = {
  pulls: ['pulls', 'rules', 'checks', 'details', 'comparisons'],
  merged: ['merged'],
  issues: ['issues'],
} as const satisfies ReadonlyRecord<ReadGroup, readonly ReadPart[]>;

/**
 * What the page holds now ({@link LoadRequest.held}): what it has of each part,
 * which of them failed on the read that last asked for it, and which groups are
 * being read, or are about to be, by a read other than this one.
 */
export type HeldParts = Readonly<{
  known: KnownParts;
  failed: PartFailures;
  reading: ReadonlySet<ReadGroup>;
}>;

/**
 * The parts a read asks for, each by a query, or a REST request, of its own,
 * and each able to fail on its own.
 */
export type ReadPart =
  | 'pulls'
  | 'rules'
  | 'checks'
  | 'details'
  | 'comparisons'
  | 'merged'
  | 'issues';

/**
 * A part a read could not read: why, and whether what the page shows of it is
 * the last read that could. A part with nothing kept is shown as not read,
 * never as empty.
 */
export type PartFailure = Readonly<{ message: string; kept: boolean }>;

/** What a read could not read, part by part. */
export type PartFailures = Partial<ReadonlyRecord<ReadPart, PartFailure>>;

/**
 * What a read had of each part, handed back to the next read
 * ({@link LoadRequest.previous}) so that a part that fails there keeps what
 * this one had.
 */
export type KnownParts = Known;

export type LoadedReport = Readonly<{
  repo: RepoRef;
  /** When the read this was built from started. */
  readAtEpochMs: number;
  /**
   * The contexts the default branch requires, or `undefined` where it requires
   * none, or its rules have not answered yet, and each pull request is judged
   * over every context reported on its head.
   */
  required: readonly string[] | undefined;
  features: RepoFeatures;
  summary: PageSummary;
  entries: readonly Entry[];
  roots: PrReport['roots'];
  cycles: PrReport['cycles'];
  /** Merged within {@link MERGED_WITHIN_DAYS}, newest first. */
  merged: readonly Merged[];
  /** The open issues, most recently updated first. */
  issues: IssueList;
  /**
   * `unblock-prs`'s queue (`queue-view.mts`), or `undefined` until the checks,
   * the comparisons and the details have all answered: a queue drawn from some
   * of them would put a pull request in a place it is not in.
   */
  queue: QueueView | undefined;
  /**
   * The sections not read yet. A listed section's list is empty because it has
   * not answered, not because there is nothing in it.
   */
  reading: readonly SectionPart[];
  /**
   * The parts this read could not read. Each is said in the panel that shows
   * it, beside what an earlier read had of it, and the rest of the page is
   * drawn from what did answer.
   */
  failed: PartFailures;
  /** What the next read falls back to for a part it cannot read. */
  parts: KnownParts;
}>;

/** The open issues the page lists, and where the list stops. */
export type IssueList = Readonly<{
  items: readonly IssueItem[];
  /** How many are open in all, so that a cut list can say so. */
  totalCount: number;
  /** Where the next page starts; `undefined` once every one is listed. */
  endCursor: string | undefined;
  /**
   * What the items' `Start-After:` declarations name that was read for them,
   * lowest number first; a number GitHub would not describe is not in it.
   */
  referenced: readonly ReferencedItem[];
}>;

/** One open issue, as the page lists it. */
export type IssueItem = OpenIssue;

/**
 * Something a `Start-After:` names that is not a listed issue, as GitHub
 * described it.
 */
export type ReferencedItem = Readonly<{
  number: number;
  kind: 'issue' | 'pull-request';
  title: string;
  url: string;
  status: ReferenceStatus;
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
  /**
   * How many open issues to list: {@link ISSUES_LIMIT} by default, and more
   * than that a page at a time.
   */
  issueCount?: number;
  /**
   * Handed the report as it stands each time a part of it answers, from the
   * moment the pull requests have — so that a page with nothing on it yet can
   * draw the merge order without waiting for the slowest query. Not called for
   * the last part: that is the report the read resolves to.
   */
  onProgress?: (report: LoadedReport) => void;
  /**
   * What the last read had ({@link LoadedReport.parts}). A part this read
   * cannot read keeps what that one had, and says it failed.
   */
  previous?: KnownParts;
  /**
   * The groups to read; all of them when absent. A read without the pull
   * requests never fails as a whole: each part it asks for that fails is said in
   * {@link LoadedReport.failed}, and the parts it does not ask for are taken
   * from {@link held}.
   */
  groups?: readonly ReadGroup[];
  /**
   * What the page holds now, asked each time the report is assembled rather
   * than once, so that a read of one group answering after a read of another
   * draws that other's answer rather than what it replaced.
   */
  held?: () => HeldParts;
  /** GraphQL's and REST's both: the default branch's rules are REST's. */
  fetchImpl?: Fetch & RestFetch;
}>;

/**
 * The report, or a sentence a reader can act on.
 *
 * Seven parts, all asked for at once: the pull requests, their check results,
 * their details, how far each head is from its base, what the default branch
 * requires of them, what merged lately, and the open issues — or the parts of
 * the groups {@link LoadRequest.groups} names, and no others.
 * Only the comparison and the rules wait, for the pull requests' heads and the
 * default branch's name.
 * Some parts may need one more query — the rest of a list that did not fit in
 * one page, which is rare and bounded by {@link MAX_FOLLOW_UP_ROUNDS}, or what
 * an issue a body closes by keyword, unlinked by GitHub, is called — and the
 * open issues past the first page are read only when more are asked for.
 *
 * A part that fails is said in {@link LoadedReport.failed}, and keeps what
 * {@link LoadRequest.previous} had of it, so that one query GitHub times out
 * takes nothing else off the page. Only a read in which every part failed — no
 * token GitHub takes, no network — fails as a whole, with what the pull
 * requests' query said.
 */
export const loadReport = async (
  source: ReportSource,
  request: LoadRequest,
): Promise<Answered<LoadedReport>> => {
  const {
    token,
    nowMs,
    issueCount = ISSUES_LIMIT,
    onProgress,
    previous = {},
    groups,
    held = (): HeldParts => NOTHING_HELD,
    fetchImpl,
  } = request;

  const repo: RepoRef = { owner: source.owner, name: source.repo } as const;

  const reads: ReadonlySet<ReadGroup> = new Set(groups ?? READ_GROUPS);

  const ask: Ask = async (query, bound = {}) =>
    askGraphql({
      query,
      variables: { owner: repo.owner, name: repo.name, ...bound },
      token,
      ...(fetchImpl === undefined ? {} : { fetchImpl }),
    });

  // Each asked for only when its group is: a part left out costs nothing.
  const pullParts = reads.has('pulls')
    ? readPullParts({ ask, source, repo, token, previous, fetchImpl })
    : undefined;

  const merged = reads.has('merged') ? readMerged(ask, repo, nowMs) : undefined;

  const issues = reads.has('issues')
    ? readIssues({
        count: issueCount,
        ask: async (after, pageSize) =>
          loadIssuePage(source, {
            token,
            after,
            first: pageSize,
            ...(fetchImpl === undefined ? {} : { fetchImpl }),
          }),
      })
    : undefined;

  let mut_known: Known = {};

  let mut_failed: PartFailures = {};

  let mut_outstanding = Arr.sum(
    Array.from(reads, (group) => PARTS_OF_GROUP[group].length),
  );

  // What the page holds of the groups this read does not ask for, as it is at
  // the moment of asking.
  const heldElsewhere = (): HeldParts => {
    const now = held();

    const keys = READ_GROUPS.filter((group) => !reads.has(group)).flatMap(
      (group) => PARTS_OF_GROUP[group],
    );

    // A part another read is asking for again is coming, whatever the read
    // before said of it.
    const settledKeys = keys.filter((part) => !now.reading.has(groupOf(part)));

    return {
      known: Obj.pick(now.known, keys),
      failed: Obj.pick(now.failed, settledKeys),
      reading: now.reading,
    };
  };

  const track = async <K extends keyof Known>(
    key: K,
    part: Promise<Answered<NonNullable<Known[K]>>>,
  ): Promise<Answered<unknown>> => {
    const answered = await part;

    mut_outstanding -= 1;

    if (Result.isOk(answered.result)) {
      mut_known = { ...mut_known, [key]: answered.result.value };
    } else {
      const kept = previous[key];

      mut_failed = {
        ...mut_failed,
        [key]: { message: answered.result.value, kept: kept !== undefined },
      };

      if (kept !== undefined) {
        mut_known = { ...mut_known, [key]: kept };
      }
    }

    // Drawn once the pull requests have answered, or have failed: the merge
    // order first, and never a page that says there are none while they are
    // still being read.
    if (
      onProgress !== undefined &&
      mut_outstanding > 0 &&
      (mut_known.pulls !== undefined || mut_failed.pulls !== undefined)
    ) {
      onProgress(assembleNow(false));
    }

    return answered;
  };

  const assembleNow = (settled: boolean): LoadedReport => {
    const elsewhere = heldElsewhere();

    return assemble({
      repo,
      nowMs,
      known: { ...elsewhere.known, ...mut_known },
      failed: { ...elsewhere.failed, ...mut_failed },
      settled,
      reads,
      readingElsewhere: elsewhere.reading,
    });
  };

  const answers = await Promise.all([
    ...(pullParts === undefined
      ? []
      : PARTS_OF_GROUP.pulls.map(async (part) => track(part, pullParts[part]))),
    ...(merged === undefined ? [] : [track('merged', merged)]),
    ...(issues === undefined ? [] : [track('issues', issues)]),
  ]);

  const rateLimit = answers
    .map((answered) => answered.rateLimit)
    .reduce(newerLimit, undefined);

  const [first] = answers;

  if (
    first !== undefined &&
    reads.has('pulls') &&
    Result.isErr(first.result) &&
    answers.every(({ result }) => Result.isErr(result))
  ) {
    return { rateLimit, result: Result.err(first.result.value) };
  }

  return { rateLimit, result: Result.ok(assembleNow(true)) };
};

/**
 * The open issues after `after`, in the order the report lists them: the next
 * page of {@link LoadedReport.issues}, to be put after it with
 * {@link appendIssues}.
 */
export const loadIssuePage = async (
  source: ReportSource,
  request: IssuePageRequest,
): Promise<Answered<IssueList>> => {
  const { token, after, first, fetchImpl } = request;

  const ask: Ask = async (query, bound = {}) =>
    askGraphql({
      query,
      variables: { owner: source.owner, name: source.repo, ...bound },
      token,
      ...(fetchImpl === undefined ? {} : { fetchImpl }),
    });

  const answered = await askGraphql({
    query: OPEN_ISSUES_QUERY,
    variables: {
      owner: source.owner,
      name: source.repo,
      first,
      after: after ?? null,
    },
    token,
    ...(fetchImpl === undefined ? {} : { fetchImpl }),
  });

  const { rateLimit } = answered;

  if (Result.isErr(answered.result)) {
    return { rateLimit, result: answered.result };
  }

  const validated = OpenIssuesDataSchema.validate(answered.result.value.data);

  if (Result.isErr(validated)) {
    return { rateLimit, result: Result.err(unexpectedShape(validated.value)) };
  }

  return withReferences({
    list: issueListOf(
      { owner: source.owner, name: source.repo },
      validated.value.repository.issues,
    ),
    rateLimit,
    ask,
  });
};

/**
 * `page` put after `held`. An issue already listed is not listed again: the
 * list is by last update, and one updated between the two reads can be met in
 * both. What either read for the declarations is kept, the page's description
 * of a number winning, being the newer.
 */
export const appendIssues = (held: IssueList, page: IssueList): IssueList => {
  const listed = new Set(held.items.map(({ number }) => number));

  const described = new Set(page.referenced.map(({ number }) => number));

  return {
    items: [
      ...held.items,
      ...page.items.filter(({ number }) => !listed.has(number)),
    ],
    totalCount: page.totalCount,
    endCursor: page.endCursor,
    referenced: [
      ...held.referenced.filter(({ number }) => !described.has(number)),
      ...page.referenced,
    ].toSorted((a, b) => a.number - b.number),
  };
};

/**
 * A part as a read that depends on it sees it: what it answered, or where it
 * failed, what the last read had of it.
 */
const orKept = async <T,>(
  part: Promise<Answered<T>>,
  kept: T | undefined,
): Promise<Answered<T>> => {
  const { rateLimit, result } = await part;

  return {
    rateLimit,
    result:
      kept !== undefined && Result.isErr(result) ? Result.ok(kept) : result,
  };
};

export type IssuePageRequest = Readonly<{
  token: string;
  /**
   * The `endCursor` of the list the page goes after, or `undefined` for the
   * first page.
   */
  after: string | undefined;
  /** How many to read, at most {@link ISSUES_PAGE_SIZE}. */
  first: number;
  fetchImpl?: Fetch;
}>;

/** One query, with the repository's owner and name bound already. */
type Ask = (
  query: string,
  variables?: ReadonlyRecord<string, unknown>,
) => Promise<Answered<GraphqlAnswer>>;

/** What has answered so far, part by part. */
type Known = Readonly<{
  pulls?: PullsPart;
  /** What the default branch requires, which the verdicts are over. */
  rules?: RulesetRequirements;
  checks?: ReadonlyMap<number, ChecksState>;
  details?: ReadonlyMap<number, DetailsPart>;
  /** Every pull request compared, `undefined` where GitHub could not. */
  comparisons?: ReadonlyMap<number, Comparison | undefined>;
  merged?: readonly Merged[];
  issues?: IssueList;
}>;

/** The answers of the pull requests' group, part by part. */
type PullParts = Readonly<{
  [K in (typeof PARTS_OF_GROUP)['pulls'][number]]: Promise<
    Answered<NonNullable<Known[K]>>
  >;
}>;

/** The group each part is read in, as {@link PARTS_OF_GROUP} lists them. */
const GROUP_OF_PART = {
  pulls: 'pulls',
  rules: 'pulls',
  checks: 'pulls',
  details: 'pulls',
  comparisons: 'pulls',
  merged: 'merged',
  issues: 'issues',
} as const satisfies ReadonlyRecord<ReadPart, ReadGroup>;

/** What a read that is not handed what the page holds falls back to. */
const NOTHING_HELD: HeldParts = {
  known: {},
  failed: {},
  reading: new Set<ReadGroup>(),
} as const;

/** The pull requests' query, and what the repository says of their owners. */
type PullsPart = Readonly<{
  defaultBranch: string;
  /** Whether the repository has the `merge-queued` label. */
  queue: boolean;
  codeOwners: readonly CodeOwnersRule[];
  /** The required check `CODEOWNERS` says enforces it, if it names one. */
  codeOwnersEnforcedBy: string | undefined;
  pulls: readonly OpenPullRequest[];
}>;

/** The check results on one pull request's head. */
type ChecksState = Readonly<{
  number: number;
  /** The head they were reported on. */
  headSha: string;
  contexts: readonly ContextNode[];
  /**
   * Where the next page of check results starts, if there is one. Still set
   * once the read is over, the head had more than it follows.
   */
  contextsAfter: string | undefined;
}>;

/** One pull request's details, partway through a read. */
type DetailsState = Readonly<{
  number: number;
  node: PullRequestDetails;
  files: readonly string[];
  /** Where the next page of changed files starts, if it is wanted. */
  filesAfter: string | undefined;
  /**
   * Whether the pages read so far name every path they change: a rename's old
   * one they do not (`namesEveryChangedPath`).
   */
  everyPathNamed: boolean;
  /** Whether the files were read to the end, and name every changed path. */
  filesComplete: boolean;
}>;

type DetailsPart = DetailsState &
  Readonly<{
    linkedIssues: readonly LinkedIssue[];
    /**
     * The `Start-After:` of each issue it closes, which it inherits as a merge
     * order; an issue GitHub would not describe is not in it.
     */
    startAfter: ReadonlyMap<number, readonly number[]>;
  }>;

/**
 * How many rounds of follow-ups one part may make. A round is a query per
 * {@link DETAILED_PAGE_SIZE} pull requests that have more, each of about a
 * point; ten is a thousand check results or changed files for the pull request
 * with the most, which is past anything this repository produces.
 */
const MAX_FOLLOW_UP_ROUNDS = 10;

const unexpectedShape = (
  errors: Parameters<typeof t.validationErrorsToMessages>[0],
): string =>
  `GitHub's answer is not the shape this page expects:\n${t.validationErrorsToMessages(errors).join('\n')}` as const;

const nextCursor = (
  pageInfo:
    Readonly<{ hasNextPage: boolean; endCursor: string | null }> | undefined,
): string | undefined =>
  pageInfo?.hasNextPage === true && pageInfo.endCursor !== null
    ? pageInfo.endCursor
    : undefined;

/**
 * Every page of one of the queries that list the open pull requests, each
 * validated by `schema`, the next asked for after the one before: a cursor is
 * known only once the page before it has answered. `refusal` words an answer
 * that is not a page at all. More than {@link MAX_OPEN_PULLS} fails the read,
 * rather than reporting the first of them as the whole.
 */
const readOpenPages = async <D extends OpenPage<unknown>>({
  ask,
  listing,
  schema,
  refusal,
  after = null,
  pages = [],
  rateLimit,
}: Readonly<{
  ask: Ask;
  listing: OpenPullsQuery;
  schema: t.Type<D>;
  refusal?: (answer: GraphqlAnswer) => string | undefined;
  after?: string | null;
  pages?: readonly D[];
  rateLimit?: RateLimit;
}>): Promise<Answered<readonly D[]>> => {
  if (pages.length * listing.pageSize >= MAX_OPEN_PULLS) {
    return {
      rateLimit,
      result: Result.err(
        `There are more than ${MAX_OPEN_PULLS} open pull requests; this page reads that many and would report a part of them as the whole.`,
      ),
    };
  }

  const answered = await ask(listing.query, { after });

  const latestLimit = answered.rateLimit ?? rateLimit;

  if (Result.isErr(answered.result)) {
    return { rateLimit: latestLimit, result: answered.result };
  }

  const refused = refusal?.(answered.result.value);

  if (refused !== undefined) {
    return { rateLimit: latestLimit, result: Result.err(refused) };
  }

  const validated = schema.validate(answered.result.value.data);

  if (Result.isErr(validated)) {
    return {
      rateLimit: latestLimit,
      result: Result.err(unexpectedShape(validated.value)),
    };
  }

  const read = Arr.toPushed(pages, validated.value);

  const next = nextCursor(validated.value.repository.open.pageInfo);

  return next === undefined
    ? { rateLimit: latestLimit, result: Result.ok(read) }
    : readOpenPages({
        ask,
        listing,
        schema,
        ...(refusal === undefined ? {} : { refusal }),
        after: next,
        pages: read,
        ...(latestLimit === undefined ? {} : { rateLimit: latestLimit }),
      });
};

const openNodesOf = <N,>(pages: readonly OpenPage<N>[]): readonly N[] =>
  pages.flatMap((page) => page.repository.open.nodes);

/** `repository` in an answer, `undefined` when there is no such field. */
const repositoryOf = ({ data }: GraphqlAnswer): unknown =>
  isRecord(data) ? data['repository'] : undefined;

const readPullRequests = async (
  ask: Ask,
  repo: RepoRef,
): Promise<Answered<PullsPart>> => {
  const { rateLimit, result: pages } = await readOpenPages({
    ask,
    listing: OPEN_PULLS_QUERIES.pullRequests,
    schema: PullRequestsDataSchema,
    // What GitHub answers for a name it cannot resolve for this token, whether
    // there is no such repository or it is one the token may not read: it does
    // not say which, so the sentence names both.
    refusal: (answer) =>
      repositoryOf(answer) === null
        ? `GitHub shows this token no repository ${repo.owner}/${repo.name}. Check the name, or, if it is private, give the page a token that can read it.`
        : undefined,
  });

  if (Result.isErr(pages)) {
    return { rateLimit, result: pages };
  }

  // What is not a list is the same on every page; the first one's is read.
  const first = pages.value[0];

  if (first === undefined) {
    return { rateLimit, result: Result.err('GitHub sent no pull requests.') };
  }

  const {
    defaultBranchRef,
    codeOwners,
    codeOwnersAtRoot,
    codeOwnersInDocs,
    queueLabel,
  } = first.repository;

  // GitHub reads the first of the three it finds, in this order.
  const owners = codeOwners ?? codeOwnersAtRoot ?? codeOwnersInDocs;

  return {
    rateLimit,
    result: Result.ok({
      // A repository with no default branch has no commits, and so no pull
      // requests to read a stack out of; the name is never compared.
      defaultBranch: defaultBranchRef?.name ?? '',
      queue: queueLabel !== null,
      codeOwners: owners === null ? [] : parseCodeOwners(owners.text),
      codeOwnersEnforcedBy:
        owners === null ? undefined : codeOwnersEnforcedBy(owners.text),
      pulls: openNodesOf(pages.value),
    }),
  };
};

/** The aliased fields under `repository` in an answer, by alias. */
const fieldsOf =
  (data: unknown) =>
  (alias: string): unknown => {
    const repository: unknown = isRecord(data) ? data['repository'] : undefined;

    return isRecord(repository) ? repository[alias] : undefined;
  };

/**
 * The follow-ups asked {@link DETAILED_PAGE_SIZE} at a time, one query after
 * another, and every answer's fields by alias: one query for every head is one
 * GitHub stops answering in time once there are enough of them. A query that
 * fails, or that GitHub could not finish, fails them all.
 */
const askInChunks = async (
  ask: Ask,
  operationName: FollowUpName,
  chunks: readonly (readonly FollowUp[])[],
  rateLimit: RateLimit | undefined,
  read: ReadonlyRecord<string, unknown> = {},
): Promise<Answered<ReadonlyRecord<string, unknown>>> => {
  const [chunk, ...rest] = chunks;

  if (chunk === undefined) {
    return { rateLimit, result: Result.ok(read) };
  }

  const { query, variables } = followUpQuery(operationName, chunk);

  const answered = await ask(query, variables);

  const latestLimit = answered.rateLimit ?? rateLimit;

  if (Result.isErr(answered.result)) {
    return { rateLimit: latestLimit, result: answered.result };
  }

  const failed = answered.result.value.errors.at(0);

  if (failed !== undefined) {
    return {
      rateLimit: latestLimit,
      result: Result.err(`GitHub could not finish the read: ${failed.message}`),
    };
  }

  const field = fieldsOf(answered.result.value.data);

  return askInChunks(ask, operationName, rest, latestLimit, {
    ...read,
    ...Object.fromEntries(
      chunk.map((followUp) => {
        const alias = followUpAlias(followUp);

        return [alias, field(alias)] as const;
      }),
    ),
  });
};

/**
 * Asks for whatever is left to follow up, folds the answer in, and goes round
 * again until nothing is left or the rounds run out. One round at a time,
 * because each round's questions are the previous round's cursors.
 *
 * A page that did not arrive fails the part: a verdict over half the checks, or
 * a review state over half the files, would be a guess presented as a fact.
 */
const followUpRounds = async <S extends Readonly<{ number: number }>>({
  operationName,
  states,
  followUpsOf,
  applyOne,
  rateLimit,
  ask,
  rounds = MAX_FOLLOW_UP_ROUNDS,
}: Readonly<{
  operationName: FollowUpName;
  states: readonly S[];
  followUpsOf: (state: S) => readonly FollowUp[];
  applyOne: (state: S, followUp: FollowUp, value: unknown) => Result<S, string>;
  rateLimit: RateLimit | undefined;
  ask: Ask;
  rounds?: number;
}>): Promise<Answered<readonly S[]>> => {
  const followUps = states.flatMap(followUpsOf);

  if (rounds <= 0 || !Arr.isNonEmpty(followUps)) {
    return { rateLimit, result: Result.ok(states) };
  }

  const asked = await askInChunks(
    ask,
    operationName,
    Arr.partition(followUps, DETAILED_PAGE_SIZE),
    rateLimit,
  );

  const latestLimit = asked.rateLimit;

  if (Result.isErr(asked.result)) {
    return { rateLimit: latestLimit, result: asked.result };
  }

  const fields = asked.result.value;

  const field = (alias: string): unknown => fields[alias];

  const mut_byNumber = new Map(states.map((state) => [state.number, state]));

  for (const followUp of followUps) {
    const state = mut_byNumber.get(followUp.number);

    if (state === undefined) {
      continue;
    }

    const next = applyOne(state, followUp, field(followUpAlias(followUp)));

    if (Result.isErr(next)) {
      return { rateLimit: latestLimit, result: next };
    }

    mut_byNumber.set(followUp.number, next.value);
  }

  return followUpRounds({
    operationName,
    states: states.map((state) => mut_byNumber.get(state.number) ?? state),
    followUpsOf,
    applyOne,
    rateLimit: latestLimit,
    ask,
    rounds: rounds - 1,
  });
};

const applyContexts = (
  state: ChecksState,
  _followUp: FollowUp,
  value: unknown,
): Result<ChecksState, string> => {
  const validated = ContextsFieldSchema.validate(value);

  if (Result.isErr(validated)) {
    return Result.err(
      `GitHub did not send the rest of #${state.number}'s check results.`,
    );
  }

  const page = validated.value.statusCheckRollup?.contexts;

  return Result.ok({
    ...state,
    contexts: [...state.contexts, ...(page?.nodes ?? [])],
    contextsAfter: nextCursor(page?.pageInfo),
  });
};

/**
 * The check results on every open pull request's head, all of them: a verdict
 * over the first hundred of a head with more would be a guess presented as a
 * fact, so a head whose results do not end within {@link MAX_FOLLOW_UP_ROUNDS}
 * pages is not judged (its `contextsAfter` still set), and its card says so.
 * Not the read failing: a head relabelled in a loop collects a round of check
 * runs per label event, and one such pull request would otherwise take the
 * verdicts and the queue of every other one with it, on every read until it
 * merged.
 */
const readChecks = async (
  ask: Ask,
): Promise<Answered<ReadonlyMap<number, ChecksState>>> => {
  const answered = await readOpenPages({
    ask,
    listing: OPEN_PULLS_QUERIES.checks,
    schema: ChecksDataSchema,
  });

  if (Result.isErr(answered.result)) {
    return { rateLimit: answered.rateLimit, result: answered.result };
  }

  const followedUp = await followUpRounds({
    operationName: 'MoreChecks',
    states: openNodesOf(answered.result.value).map((node): ChecksState => {
      const rollup = node.commits.nodes[0]?.commit.statusCheckRollup ?? null;

      return {
        number: node.number,
        headSha: node.headRefOid,
        contexts: rollup?.contexts.nodes ?? [],
        contextsAfter: nextCursor(rollup?.contexts.pageInfo),
      };
    }),
    followUpsOf: ({ number, headSha, contextsAfter }) =>
      contextsAfter === undefined
        ? []
        : [{ kind: 'contexts', number, headSha, after: contextsAfter }],
    applyOne: applyContexts,
    rateLimit: answered.rateLimit,
    ask,
  });

  const followed = followedUp.result;

  if (Result.isErr(followed)) {
    return { rateLimit: followedUp.rateLimit, result: followed };
  }

  return {
    rateLimit: followedUp.rateLimit,
    result: Result.ok(
      new Map(followed.value.map((state) => [state.number, state])),
    ),
  };
};

const applyFiles = (
  state: DetailsState,
  _followUp: FollowUp,
  value: unknown,
): Result<DetailsState, string> => {
  const validated = FilesFieldSchema.validate(value);

  if (Result.isErr(validated)) {
    return Result.err(
      `GitHub did not send the rest of #${state.number}'s changed files.`,
    );
  }

  const { files } = validated.value;

  const filesAfter = nextCursor(files.pageInfo);

  const everyPathNamed =
    state.everyPathNamed && namesEveryChangedPath(files.nodes);

  return Result.ok({
    ...state,
    files: [...state.files, ...files.nodes.map(({ path }) => path)],
    filesAfter,
    everyPathNamed,
    filesComplete: filesAfter === undefined && everyPathNamed,
  });
};

/** The numbers of `repo`'s issues among those blocking one. */
const ownBlockedBy = (
  repo: RepoRef,
  blockedBy: BlockedByNodes,
): readonly number[] => {
  const own = `${repo.owner}/${repo.name}`.toLowerCase();

  return blockedBy.nodes
    .filter(({ repository }) => repository.nameWithOwner.toLowerCase() === own)
    .map(({ number }) => number);
};

/** Each of `repo`'s issues among `nodes`, by what its body declares. */
const startAfterOfNodes = (
  repo: RepoRef,
  nodes: readonly t.TypeOf<typeof IssueWithBodySchema>[],
): ReadonlyMap<number, readonly number[]> => {
  const own = `${repo.owner}/${repo.name}`.toLowerCase();

  return new Map(
    nodes
      .filter(
        ({ repository }) => repository.nameWithOwner.toLowerCase() === own,
      )
      .map(({ number, body, blockedBy }) => [
        number,
        waitsFor(body, ownBlockedBy(repo, blockedBy)),
      ]),
  );
};

/**
 * What GitHub calls the issues in `numbers`, keyed by number, as a linked one
 * would be listed, and what each declares with `Start-After:`. Nothing is asked
 * when there are none, which is so for every pull request into the default
 * branch. An issue GitHub will not describe — deleted, or moved to another
 * repository — is left out rather than failing the read, and is listed by its
 * number alone.
 */
const describeIssues = async ({
  repo,
  numbers,
  rateLimit,
  ask,
}: Readonly<{
  repo: RepoRef;
  numbers: readonly number[];
  rateLimit: RateLimit | undefined;
  ask: Ask;
}>): Promise<Answered<DescribedIssues>> => {
  if (!Arr.isNonEmpty(numbers)) {
    return {
      rateLimit,
      result: Result.ok({
        issues: new Map<number, LinkedIssue>(),
        startAfter: new Map<number, readonly number[]>(),
      }),
    };
  }

  const { query, variables } = issuesQuery(numbers);

  const answered = await ask(query, variables);

  const latestLimit = answered.rateLimit ?? rateLimit;

  if (Result.isErr(answered.result)) {
    return { rateLimit: latestLimit, result: answered.result };
  }

  const field = fieldsOf(answered.result.value.data);

  const nodes = Arr.generate(function* () {
    for (const number of numbers) {
      const validated = IssueWithBodySchema.validate(field(issueAlias(number)));

      if (Result.isOk(validated)) {
        yield validated.value;
      }
    }
  });

  return {
    rateLimit: latestLimit,
    result: Result.ok({
      issues: new Map(
        closingIssuesIn(repo, nodes).map((issue) => [issue.number, issue]),
      ),
      startAfter: startAfterOfNodes(repo, nodes),
    }),
  };
};

const unlinkedIssuesOf = (
  repo: RepoRef,
  pr: ClosingSources,
): readonly number[] => {
  const linked = new Set(
    closingIssuesIn(repo, pr.closingIssuesReferences.nodes).map(
      ({ number }) => number,
    ),
  );

  return closingKeywordIssuesIn(repo, pr.bodyHTML).filter(
    (number) => !linked.has(number),
  );
};

/**
 * The `Start-After:` of the issues an open pull request closes: the ones
 * GitHub links, then the ones its body closes by keyword, from what
 * {@link describeIssues} read of them.
 */
const closingStartAfterOf = (
  repo: RepoRef,
  pr: StrictPick<PullRequestDetails, 'bodyHTML' | 'closingIssuesReferences'>,
  unlinked: ReadonlyMap<number, readonly number[]>,
): ReadonlyMap<number, readonly number[]> => {
  const mut_startAfter = new Map(
    startAfterOfNodes(repo, pr.closingIssuesReferences.nodes),
  );

  for (const number of unlinkedIssuesOf(repo, pr)) {
    const startAfter = unlinked.get(number);

    if (startAfter !== undefined) {
      mut_startAfter.set(number, startAfter);
    }
  }

  return mut_startAfter;
};

/**
 * The issues GitHub links, then the ones the body closes by keyword that it
 * does not link yet: GitHub links a keyword only on a pull request into the
 * default branch, and a stacked one waits for the layers below to merge.
 */
const linkedIssuesOf = (
  repo: RepoRef,
  pr: ClosingSources,
  described: ReadonlyMap<number, LinkedIssue>,
): readonly LinkedIssue[] =>
  [
    ...closingIssuesIn(repo, pr.closingIssuesReferences.nodes),
    ...unlinkedIssuesOf(repo, pr).map(
      (number): LinkedIssue =>
        described.get(number) ?? {
          number,
          title: '',
          url: `https://github.com/${repo.owner}/${repo.name}/issues/${number}`,
          state: 'unknown',
        },
    ),
  ] as const;

/**
 * Each open pull request's details, with the issues its body closes. The
 * changed files are paged through only when the default branch asks for a code
 * owner's review, since that is all they are read for — which its rules say, or
 * a required check `CODEOWNERS` names (`enforcedBy`), so this waits for them
 * before asking for more pages.
 */
const readDetails = async (
  ask: Ask,
  repo: RepoRef,
  rules: Promise<Answered<RulesetRequirements>>,
  enforcedBy: Promise<string | undefined>,
): Promise<Answered<ReadonlyMap<number, DetailsPart>>> => {
  const answered = await readOpenPages({
    ask,
    listing: OPEN_PULLS_QUERIES.details,
    schema: DetailsDataSchema,
  });

  if (Result.isErr(answered.result)) {
    return { rateLimit: answered.rateLimit, result: answered.result };
  }

  const { result: ruled } = await rules;

  // The pull requests' read only when the rules alone do not decide it. That
  // costs no wait of its own: `CODEOWNERS` comes with the pull requests' read,
  // and the rules are asked for only once it has named the default branch.
  const wantFiles =
    Result.isOk(ruled) &&
    (ruled.value.requireCodeOwnerReview ||
      codeOwnerGate(ruled.value, await enforcedBy) !== undefined);

  const followedUp = await followUpRounds({
    operationName: 'MoreFiles',
    states: openNodesOf(answered.result.value).map((node): DetailsState => {
      const everyPathNamed = namesEveryChangedPath(node.files.nodes);

      return {
        number: node.number,
        node,
        files: node.files.nodes.map(({ path }) => path),
        filesAfter: wantFiles ? nextCursor(node.files.pageInfo) : undefined,
        everyPathNamed,
        filesComplete: !node.files.pageInfo.hasNextPage && everyPathNamed,
      };
    }),
    followUpsOf: ({ number, filesAfter }) =>
      filesAfter === undefined
        ? []
        : [{ kind: 'files', number, after: filesAfter }],
    applyOne: applyFiles,
    rateLimit: answered.rateLimit,
    ask,
  });

  const followed = followedUp.result;

  if (Result.isErr(followed)) {
    return { rateLimit: followedUp.rateLimit, result: followed };
  }

  const states = followed.value;

  const described = await describeIssues({
    repo,
    numbers: Arr.uniq(
      states.flatMap(({ node }) => unlinkedIssuesOf(repo, node)),
    ),
    rateLimit: followedUp.rateLimit,
    ask,
  });

  if (Result.isErr(described.result)) {
    return { rateLimit: described.rateLimit, result: described.result };
  }

  const { issues: names, startAfter: unlinkedStartAfter } =
    described.result.value;

  return {
    rateLimit: described.rateLimit,
    result: Result.ok(
      new Map(
        states.map((state) => [
          state.number,
          {
            ...state,
            linkedIssues: linkedIssuesOf(repo, state.node, names),
            startAfter: closingStartAfterOf(
              repo,
              state.node,
              unlinkedStartAfter,
            ),
          },
        ]),
      ),
    ),
  };
};

/**
 * The later of two budgets: the one with the later reset, or within one window
 * the one with less left. The parts answer in no particular order, so the last
 * to answer need not be the last GitHub counted.
 */
const newerLimit = (
  held: RateLimit | undefined,
  next: RateLimit | undefined,
): RateLimit | undefined =>
  held === undefined
    ? next
    : next === undefined
      ? held
      : next.resetEpochMs !== held.resetEpochMs
        ? next.resetEpochMs > held.resetEpochMs
          ? next
          : held
        : next.remaining < held.remaining
          ? next
          : held;

/**
 * How far each head is from its base. A comparison GitHub could not make is a
 * gap the page can show — "ahead / behind unread" — so its error is not a
 * failure of the read; a query of them GitHub did not answer is.
 */
const readComparisons = async (
  ask: Ask,
  pulls: readonly OpenPullRequest[],
): Promise<Answered<ReadonlyMap<number, Comparison | undefined>>> => {
  if (!Arr.isNonEmpty(pulls)) {
    return {
      rateLimit: undefined,
      result: Result.ok(new Map<number, Comparison | undefined>()),
    };
  }

  const followUps = pulls.map(
    ({ number, baseRefName, headRefOid }): FollowUp => ({
      kind: 'compare',
      number,
      baseQualifiedName: `refs/heads/${baseRefName}`,
      headSha: headRefOid,
    }),
  );

  // One query per DETAILED_PAGE_SIZE heads, all at once: a comparison per head
  // is what the query costs in time, and one query for every open pull request
  // is one GitHub stops answering once there are enough of them.
  const answers = await Promise.all(
    Arr.partition(followUps, DETAILED_PAGE_SIZE).map(async (chunk) => {
      const { query, variables } = followUpQuery('Compare', chunk);

      const answered = await ask(query, variables);

      return { chunk, answered } as const;
    }),
  );

  const rateLimit = answers
    .map(({ answered }) => answered.rateLimit)
    .reduce(newerLimit, undefined);

  // Not a gap the page can show, as one comparison GitHub could not make is:
  // the queue's order turns on how far each head is behind, and a queue drawn
  // without some of them would put a pull request where it is not.
  const mut_entries: (readonly [number, Comparison | undefined])[] = [];

  for (const { chunk, answered } of answers) {
    if (Result.isErr(answered.result)) {
      return { rateLimit, result: answered.result };
    }

    const field = fieldsOf(answered.result.value.data);

    for (const followUp of chunk) {
      const validated = CompareFieldSchema.validate(
        field(followUpAlias(followUp)) ?? null,
      );

      mut_entries.push([
        followUp.number,
        Result.isOk(validated) && validated.value?.compare != null
          ? validated.value.compare
          : undefined,
      ]);
    }
  }

  return { rateLimit, result: Result.ok(new Map(mut_entries)) };
};

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

const mergedOf = (
  repo: RepoRef,
  pr: MergedPullRequestNode,
  mergedAtEpochMs: number,
  described: ReadonlyMap<number, LinkedIssue>,
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
    linkedIssues: linkedIssuesOf(repo, pr, described),
  }) as const;

/** The five parts of the pull requests' group, asked for together. */
const readPullParts = ({
  ask,
  source,
  repo,
  token,
  previous,
  fetchImpl,
}: Readonly<{
  ask: Ask;
  source: ReportSource;
  repo: RepoRef;
  token: string;
  previous: KnownParts;
  fetchImpl: (Fetch & RestFetch) | undefined;
}>): PullParts => {
  const pulls = readPullRequests(ask, repo);

  // What the rules and the comparisons are asked from: the pull requests this
  // read found, or where it could not, the ones the last read had, so that one
  // query timing out does not take three parts back to the last read.
  const pullsOrKept = orKept(pulls, previous.pulls);

  const rules = pullsOrKept.then(async ({ result }) =>
    Result.isOk(result)
      ? {
          rateLimit: undefined,
          result: await loadBranchRules(source, result.value.defaultBranch, {
            token,
            ...(fetchImpl === undefined ? {} : { fetchImpl }),
          }),
        }
      : // The pull requests' own failure is the one the read reports.
        { rateLimit: undefined, result },
  );

  return {
    pulls,
    rules,
    checks: readChecks(ask),
    // The details follow the changed files where the rules ask for a code
    // owner, which the last read's rules still say where these fail.
    details: readDetails(
      ask,
      repo,
      orKept(rules, previous.rules),
      pullsOrKept.then(({ result }) =>
        Result.isOk(result) ? result.value.codeOwnersEnforcedBy : undefined,
      ),
    ),
    comparisons: pullsOrKept.then(async ({ result }) =>
      Result.isOk(result)
        ? readComparisons(ask, result.value.pulls)
        : // The pull requests' own failure is the one the read reports.
          { rateLimit: undefined, result },
    ),
  } as const;
};

/** What merged within {@link MERGED_WITHIN_DAYS}, newest first. */
const readMerged = async (
  ask: Ask,
  repo: RepoRef,
  nowMs: number,
): Promise<Answered<readonly Merged[]>> => {
  const cutoff = nowMs - MERGED_WITHIN_DAYS * MS_PER_DAY;

  const answered = await ask(MERGED_QUERY, {
    search: mergedSearch(repo, cutoff),
  });

  if (Result.isErr(answered.result)) {
    return { rateLimit: answered.rateLimit, result: answered.result };
  }

  const validated = MergedDataSchema.validate(answered.result.value.data);

  if (Result.isErr(validated)) {
    return {
      rateLimit: answered.rateLimit,
      result: Result.err(unexpectedShape(validated.value)),
    };
  }

  const inWindow = Arr.generate(function* () {
    for (const pr of validated.value.merged.nodes) {
      const mergedAtEpochMs = epochMsOf(pr.mergedAt);

      if (mergedAtEpochMs !== undefined) {
        yield { pr, mergedAtEpochMs };
      }
    }
  })
    .filter(({ mergedAtEpochMs }) => mergedAtEpochMs >= cutoff)
    .toSorted((a, b) => b.mergedAtEpochMs - a.mergedAtEpochMs)
    .slice(0, MERGED_LIMIT);

  const described = await describeIssues({
    repo,
    numbers: Arr.uniq(inWindow.flatMap(({ pr }) => unlinkedIssuesOf(repo, pr))),
    rateLimit: answered.rateLimit,
    ask,
  });

  if (Result.isErr(described.result)) {
    return { rateLimit: described.rateLimit, result: described.result };
  }

  const names = described.result.value.issues;

  return {
    rateLimit: described.rateLimit,
    result: Result.ok(
      inWindow.map(({ pr, mergedAtEpochMs }) =>
        mergedOf(repo, pr, mergedAtEpochMs, names),
      ),
    ),
  };
};

/**
 * `listed` and the pages after it, until they have asked for `count` or listed
 * every open issue. One page at a time, because each page starts where the last
 * ended.
 *
 * Counted in what was asked for rather than what came back: an issue the token
 * may not see comes back as nothing (`withoutNullNodes`), and a list one short
 * of `count` would otherwise ask for one more page on every read.
 */
const listIssuesUpTo = async ({
  listed,
  covered,
  count,
  rateLimit,
  ask,
}: Readonly<{
  listed: IssueList;
  /** How many issues the reads that made `listed` asked for. */
  covered: number;
  count: number;
  rateLimit: RateLimit | undefined;
  ask: (after: string, size: number) => Promise<Answered<IssueList>>;
}>): Promise<Answered<IssueList>> => {
  const wanted = count - covered;

  if (listed.endCursor === undefined || wanted <= 0) {
    return { rateLimit, result: Result.ok(listed) };
  }

  const pageSize = Math.min(wanted, ISSUES_PAGE_SIZE);

  const answered = await ask(listed.endCursor, pageSize);

  const latestLimit = answered.rateLimit ?? rateLimit;

  if (Result.isErr(answered.result)) {
    return { rateLimit: latestLimit, result: answered.result };
  }

  const page = answered.result.value;

  // A page that ends where it started would be asked for again, forever.
  const appended = appendIssues(
    listed,
    page.endCursor === listed.endCursor
      ? { ...page, endCursor: undefined }
      : page,
  );

  return listIssuesUpTo({
    listed: appended,
    covered: covered + pageSize,
    count,
    rateLimit: latestLimit,
    ask,
  });
};

/**
 * The first {@link ISSUES_LIMIT} open issues, and the pages after them until
 * `count` have been asked for or every open issue is listed.
 */
const readIssues = async ({
  count,
  ask,
}: Readonly<{
  count: number;
  ask: (
    after: string | undefined,
    first: number,
  ) => Promise<Answered<IssueList>>;
}>): Promise<Answered<IssueList>> => {
  const firstPage = await ask(undefined, ISSUES_LIMIT);

  if (Result.isErr(firstPage.result)) {
    return firstPage;
  }

  return listIssuesUpTo({
    listed: firstPage.result.value,
    covered: ISSUES_LIMIT,
    count,
    rateLimit: firstPage.rateLimit,
    ask,
  });
};

/** Where one named item stands, in `pr-report-core`'s terms. */
const referencedOf = (
  node: t.TypeOf<typeof ReferenceSchema>,
): ReferencedItem =>
  node.__typename === 'Issue'
    ? ({
        number: node.number,
        kind: 'issue',
        title: node.title,
        url: node.url,
        status: referenceStatusOf({
          kind: 'issue',
          state: node.state,
          stateReason: node.stateReason ?? undefined,
        }),
      } as const)
    : ({
        number: node.number,
        kind: 'pull-request',
        title: node.title,
        url: node.url,
        status: referenceStatusOf({
          kind: 'pull-request',
          state: node.pullRequestState,
          merged: node.merged,
        }),
      } as const);

/**
 * `list` with what its declarations name described: one query for every number
 * named that is not an item of `list`, and none when there is no such number.
 * Each page is described as it is read (`loadIssuePage`), so a number an
 * earlier page lists may be asked about again; that costs a field, where
 * finding out would cost the read its independence.
 */
const withReferences = async ({
  list,
  rateLimit,
  ask,
}: Readonly<{
  list: IssueList;
  rateLimit: RateLimit | undefined;
  ask: Ask;
}>): Promise<Answered<IssueList>> => {
  const listed = new Set(list.items.map(({ number }) => number));

  const numbers = Arr.uniq(list.items.flatMap(({ startAfter }) => startAfter))
    .filter((number) => !listed.has(number))
    .toSorted((a, b) => a - b);

  if (!Arr.isNonEmpty(numbers)) {
    return { rateLimit, result: Result.ok(list) };
  }

  const { query, variables } = referencesQuery(numbers);

  const answered = await ask(query, variables);

  const latestLimit = answered.rateLimit ?? rateLimit;

  if (Result.isErr(answered.result)) {
    return { rateLimit: latestLimit, result: answered.result };
  }

  const field = fieldsOf(answered.result.value.data);

  return {
    rateLimit: latestLimit,
    result: Result.ok({
      ...list,
      referenced: Arr.generate<ReferencedItem>(function* () {
        for (const number of numbers) {
          const validated = ReferenceSchema.validate(
            field(referenceAlias(number)),
          );

          if (Result.isOk(validated)) {
            yield referencedOf(validated.value);
          }
        }
      }),
    }),
  };
};

/** A page of one of the queries that list the open pull requests. */
type OpenPage<N> = Readonly<{
  repository: Readonly<{
    open: Readonly<{
      pageInfo: Readonly<{ hasNextPage: boolean; endCursor: string | null }>;
      nodes: readonly N[];
    }>;
  }>;
}>;

type DescribedIssues = Readonly<{
  issues: ReadonlyMap<number, LinkedIssue>;
  startAfter: ReadonlyMap<number, readonly number[]>;
}>;

/**
 * What the issues read so far declare with `Start-After:` — the listed ones,
 * and the ones the open pull requests close — for those pull requests to
 * inherit, and which numbers are known to be open issues.
 */
const issueDeclarationsOf = (known: Known): IssueDeclarations => {
  const listed = known.issues?.items ?? [];

  const mut_startAfter = new Map<number, readonly number[]>();

  for (const { startAfter } of known.details?.values() ?? []) {
    for (const [number, declared] of startAfter) {
      mut_startAfter.set(number, declared);
    }
  }

  for (const { number, startAfter } of listed) {
    mut_startAfter.set(number, startAfter);
  }

  return {
    startAfter: mut_startAfter,
    open: new Set(
      Arr.generate(function* () {
        for (const { number } of listed) {
          yield number;
        }

        for (const { number, kind, status } of known.issues?.referenced ?? []) {
          if (kind === 'issue' && status === 'waiting') {
            yield number;
          }
        }
      }),
    ),
  };
};

const summaryOf = (
  entries: readonly Entry[],
  lacking: ReadonlySet<EntryPart>,
): PageSummary => {
  const counted = summarize(entries);

  // Not counted while any pull request lacks the part, whether it is still
  // coming or this read did not get it: a count of none read is not none.
  const once = (part: EntryPart, count: () => number): number | undefined =>
    lacking.has(part) ? undefined : count();

  return {
    open: counted.open,
    queued: counted.queued,
    draft: counted.draft,
    failing: once('checks', () => counted.failing),
    setAside: once(
      'details',
      () => entries.filter((entry) => entry.setAside?.current === true).length,
    ),
    awaitingReview: once(
      'details',
      () =>
        entries.filter((entry) => entry.codeOwnerReview.state === 'required')
          .length,
    ),
    pending: entries.filter((entry) =>
      entry.labels.some((label) => label.name === PENDING_LABEL),
    ).length,
  };
};

/** The workflow run a check suite is, in the shared verdict's terms. */
const roundOf = (suite: CheckSuiteNode | null): CheckRunReport['round'] => {
  const workflowId = suite?.workflowRun?.workflow.databaseId ?? undefined;

  return suite === null || workflowId === undefined
    ? undefined
    : { workflowId, completed: suite.status === 'COMPLETED' };
};

/**
 * A commit status's state as the REST API spells it. `EXPECTED` is GraphQL's
 * alone — a required status nothing has reported yet — and is a wait, not a
 * failure.
 */
const statusState = (state: string): string =>
  state === 'EXPECTED' ? 'pending' : state.toLowerCase();

const factsOf = (
  pr: OpenPullRequest,
  { checks, comparison, details }: PartsOfPull,
): PullRequestFacts => {
  // An unfinished list is judged as none, rather than as what it began with.
  const contexts =
    checks === undefined || checks.contextsAfter !== undefined
      ? ([] as const)
      : checks.contexts;

  const runs: readonly CheckRunReport[] = Arr.generate(function* () {
    for (const node of contexts) {
      if (node.__typename === 'CheckRun') {
        yield {
          name: node.name,
          // The REST spelling, which is what the shared verdict is written
          // against: GraphQL says `COMPLETED` where REST says `completed`.
          status: node.status.toLowerCase(),
          conclusion: node.conclusion?.toLowerCase(),
          checkSuiteId: node.checkSuite?.databaseId ?? 0,
          id: node.databaseId ?? 0,
          round: roundOf(node.checkSuite),
        };
      }
    }
  });

  const statuses = Arr.generate(function* () {
    for (const node of contexts) {
      if (node.__typename === 'StatusContext') {
        yield { context: node.context, state: statusState(node.state) };
      }
    }
  });

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
    fromFork: pr.isCrossRepository,
    url: pr.url,
    updatedAt: pr.updatedAt,
    headCommittedAt: pr.commits.nodes[0]?.commit.committedDate,
    comparison,
    reported: reportedContexts(runs, statuses),
    checksRunning: anyRunInProgress(runs),
    linkedIssues: details?.linkedIssues ?? [],
  };
};

/**
 * What the viewer's `unblock-prs` comment on this pull request says, when it
 * says the pull request is set aside at the head it is at now. Once the branch
 * has been pushed the record is someone else's head's, and the script rewrites
 * the comment as resolved on its next survey.
 */
const setAsideOf = (
  pr: OpenPullRequest,
  details: DetailsPart,
): SetAsideView | undefined => {
  const found = Arr.generate(function* () {
    for (const { viewerDidAuthor, url, body } of details.node.comments.nodes) {
      if (!viewerDidAuthor) {
        continue;
      }

      const says = parseSetAsideComment(body);

      if (says !== undefined) {
        yield { url, says };
      }
    }
  }).at(0);

  if (
    found?.says.kind !== 'standing' ||
    found.says.setAside.headSha !== pr.headRefOid
  ) {
    return undefined;
  }

  const { setAside, retry } = found.says;

  const baseTip = pr.baseRef?.target?.oid;

  return {
    ...setAside,
    retry,
    url: found.url,
    current: baseTip !== undefined && setAsideStillApplies(setAside, baseTip),
  };
};

const approversOf = (details: PullRequestDetails): readonly string[] =>
  Arr.generate(function* () {
    for (const { state, author } of details.latestOpinionatedReviews.nodes) {
      if (state === 'APPROVED' && author !== null) {
        yield author.login;
      }
    }
  });

/** What the queue reads of one pull request (`queue-view.mts`). */
const queuePullOf = (
  entry: ReportEntry,
  pr: OpenPullRequest,
  details: DetailsPart,
): QueuePull => {
  const { node } = details;

  return {
    entry,
    baseTip: pr.baseRef?.target?.oid ?? '',
    mergeable: node.mergeable,
    nativeStack:
      node.stackEntry === null
        ? undefined
        : {
            stack: node.stackEntry.stack.number,
            position: node.stackEntry.position,
            size: node.stackEntry.stack.size,
          },
    review: {
      author: entry.author,
      approvers: approversOf(node),
      files: details.files,
      filesComplete: details.filesComplete,
      unresolvedConversations: node.reviewThreads.nodes.filter(
        ({ isResolved }) => !isResolved,
      ).length,
    },
    ownComments: node.comments.nodes
      .filter(({ viewerDidAuthor }) => viewerDidAuthor)
      .map(({ body }) => body),
  };
};

/**
 * Why a head with no checks read cannot be judged on this read, worded for its
 * card; `undefined` while its checks may still come.
 */
const checksFailure = (failed: PartFailures): string | undefined => {
  const failure = checksFailureOf(failed);

  return failure === undefined
    ? undefined
    : failed.rules?.kept === false
      ? `What the default branch requires could not be read, so no check is judged. ${failure.message}`
      : `The check results could not be read. ${failure.message}`;
};

const groupOf = (part: ReadPart): ReadGroup => GROUP_OF_PART[part];

/** Everything read so far, arranged into what the page shows. */
const assemble = ({
  repo,
  nowMs,
  known,
  failed,
  settled,
  reads,
  readingElsewhere,
}: Readonly<{
  repo: RepoRef;
  nowMs: number;
  known: Known;
  failed: PartFailures;
  /**
   * Whether every part has answered or failed, so that nothing a card lacks is
   * still coming on this read.
   */
  settled: boolean;
  /** The groups this read asks for. */
  reads: ReadonlySet<ReadGroup>;
  /** The groups being read, or about to be, by another read. */
  readingElsewhere: ReadonlySet<ReadGroup>;
}>): LoadedReport => {
  // Without the pull requests, the page is the sections that do not need them.
  const {
    defaultBranch,
    queue,
    codeOwners,
    codeOwnersEnforcedBy: enforcedBy,
    pulls,
  } = known.pulls ?? NO_PULLS;

  // A part that failed is not being read any more, nor is anything once the
  // read is over: what a card lacks then — a part kept from the last read has
  // nothing of a pull request opened since — is said, not waited for.
  // A part of a group another read has is still coming while that read is out.
  const doneWith = (part: ReadPart): boolean =>
    failed[part] !== undefined ||
    (reads.has(groupOf(part)) ? settled : !readingElsewhere.has(groupOf(part)));

  const requirements = known.rules;

  // What enforces `CODEOWNERS`: the ruleset, or a required check it names.
  const gate =
    requirements === undefined
      ? undefined
      : codeOwnerGate(requirements, enforcedBy);

  const required =
    requirements !== undefined && Arr.isNonEmpty(requirements.requiredContexts)
      ? requirements.requiredContexts
      : undefined;

  const features: RepoFeatures = {
    requiredChecks: required !== undefined,
    // Until the pull requests answer, `CODEOWNERS` is not read either, and an
    // `enforced-by:` line may yet turn the review on.
    codeOwnerReview:
      requirements === undefined ||
      known.pulls === undefined ||
      gate !== undefined,
    queue,
  } as const;

  // The same for every card: what failed is the read's, not the card's.
  const checksUnreadBy =
    checksFailure(failed) ??
    (settled
      ? 'The check results read were not of this head, or were read before it was opened; the next read has them.'
      : undefined);

  const partsOf = (pr: OpenPullRequest): PartsOfPull => {
    const checks = known.checks?.get(pr.number);

    return {
      // Results reported on another head — a push that landed between the two
      // queries — are not this head's, and the next read has them. Nor are any
      // judged before the rules say which of them count.
      checks:
        requirements !== undefined && checks?.headSha === pr.headRefOid
          ? checks
          : undefined,
      comparisonRead: known.comparisons?.has(pr.number) === true,
      comparison: known.comparisons?.get(pr.number),
      details: known.details?.get(pr.number),
    };
  };

  const byNumber = new Map(
    pulls.map((pr) => [pr.number, { pr, ...partsOf(pr) }]),
  );

  const issueDeclarations = issueDeclarationsOf(known);

  const report = buildEntries({
    required,
    // `skip-ci` holds the checks back where `unblock-prs` runs, and is anyone's
    // label anywhere else.
    skipCiPauses: queue,
    defaultBranch,
    pulls: pulls.map((pr) => factsOf(pr, partsOf(pr))),
    issues: issueDeclarations,
  });

  const entries: readonly Entry[] = report.entries.map((entry) => {
    const parts = byNumber.get(entry.number);

    const details = parts?.details;

    return {
      ...entry,
      setAside:
        parts === undefined || details === undefined
          ? undefined
          : setAsideOf(parts.pr, details),
      codeOwnerReview:
        details === undefined || requirements === undefined
          ? { state: 'unknown' }
          : codeOwnerReview({
              required: gate !== undefined,
              rules: codeOwners,
              files: details.files,
              filesComplete: details.filesComplete,
              approvers: approversOf(details.node),
              author: entry.author,
              authorApproves: gate === 'check',
            }),
      claudeSessions: parseClaudeSessions(entry.body),
      checksUnread:
        parts?.checks === undefined
          ? checksUnreadBy
          : parts.checks.contextsAfter === undefined
            ? undefined
            : `#${entry.number} has more check results than this page reads, so it gives no verdict over them.`,
      reading: [
        ...(checksUnreadBy === undefined && parts?.checks === undefined
          ? (['checks'] as const)
          : []),
        ...(parts?.comparisonRead === true || doneWith('comparisons')
          ? []
          : (['comparison'] as const)),
        ...(details === undefined && !doneWith('details')
          ? (['details'] as const)
          : []),
      ],
    };
  });

  return {
    repo,
    readAtEpochMs: nowMs,
    required,
    features,
    summary: summaryOf(
      entries,
      new Set(
        Arr.generate(function* () {
          for (const pr of pulls) {
            const parts = partsOf(pr);

            if (parts.checks === undefined) {
              yield 'checks' as const;
            }

            if (!parts.comparisonRead) {
              yield 'comparison' as const;
            }

            if (parts.details === undefined) {
              yield 'details' as const;
            }
          }
        }),
      ),
    ),
    entries,
    roots: report.roots,
    cycles: report.cycles,
    merged: known.merged ?? [],
    issues: known.issues ?? NO_ISSUES,
    queue:
      requirements === undefined ||
      known.pulls === undefined ||
      known.checks === undefined ||
      known.comparisons === undefined ||
      known.details === undefined ||
      // A part kept from the last read has nothing of a pull request opened
      // since, and a queue drawn without it would leave it out of the order.
      pulls.some(
        ({ number }) =>
          !(
            known.checks?.has(number) === true &&
            known.details?.has(number) === true &&
            known.comparisons?.has(number) === true
          ),
      )
        ? undefined
        : queueViewOf({
            defaultBranch,
            nowEpochMs: nowMs,
            startAfterOf: issueDeclarations.startAfter,
            rules: {
              requireCodeOwnerReview: requirements.requireCodeOwnerReview,
              requireConversationResolution:
                requirements.requireConversationResolution,
              codeOwners,
              codeOwnerGate: gate,
            },
            pulls: Arr.generate(function* () {
              for (const entry of report.entries) {
                const parts = byNumber.get(entry.number);

                if (parts?.details !== undefined) {
                  yield queuePullOf(entry, parts.pr, parts.details);
                }
              }
            }),
          }),
    reading: [
      ...(known.merged === undefined && !doneWith('merged')
        ? (['merged'] as const)
        : []),
      ...(known.issues === undefined && !doneWith('issues')
        ? (['issues'] as const)
        : []),
    ],
    failed,
    parts: known,
  };
};

/** The pull requests' part of a read they failed in. */
const NO_PULLS: PullsPart = {
  defaultBranch: '',
  // Not known, and a queue block shown on a repository that has none would go
  // again on the next read.
  queue: false,
  codeOwners: [],
  codeOwnersEnforcedBy: undefined,
  pulls: [],
} as const;

/** What has answered about one pull request. */
type PartsOfPull = Readonly<{
  checks: ChecksState | undefined;
  /** Whether the comparison was asked and answered, possibly with nothing. */
  comparisonRead: boolean;
  comparison: Comparison | undefined;
  details: DetailsPart | undefined;
}>;

const NO_ISSUES: IssueList = {
  items: [],
  totalCount: 0,
  endCursor: undefined,
  referenced: [],
} as const;

const MS_PER_DAY = 86_400_000;

/**
 * What a pull request says it closes, read both ways. A merged one's closing
 * issues are read without their bodies, which an open one's have.
 */
type ClosingSources = StrictPick<
  MergedPullRequestNode,
  'bodyHTML' | 'closingIssuesReferences'
>;

const issueOf = (repo: RepoRef, issue: OpenIssueNode): IssueItem =>
  ({
    number: issue.number,
    title: issue.title,
    author: issue.author?.login ?? GHOST,
    url: issue.url,
    labels: labelsOf(issue.labels.nodes),
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    comments: issue.comments.totalCount,
    startAfter: waitsFor(issue.body, ownBlockedBy(repo, issue.blockedBy)),
    misplacedMergeAfter: parseMergeAfter(issue.body),
  }) as const;

const issueListOf = (repo: RepoRef, page: OpenIssuePage): IssueList =>
  ({
    items: page.nodes.map((issue) => issueOf(repo, issue)),
    totalCount: page.totalCount,
    endCursor: nextCursor(page.pageInfo),
    referenced: [],
  }) as const;

/** What GitHub calls an account that has been deleted. */
const GHOST = 'ghost';

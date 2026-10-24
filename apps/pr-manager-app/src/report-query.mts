/**
 * What the page asks GitHub, and the shape it expects back.
 *
 * **One query per part of the page**, sent together rather than as one
 * query, because GitHub answers a query only once all of it is ready, and
 * the parts take very different times. Measured against this repository:
 * the pull requests the merge order is drawn from take about a second; their check results about three; the one
 * query that asked for everything took four and a half, and the page drew
 * nothing until then. Apart, the merge order is on screen after the first,
 * and each badge and section fills in as its own query answers.
 *
 * **A follow-up** asks for what could only be named after an answer: how
 * far each head is from its base, once the heads are known, and the next
 * page of any list that did not fit in one.
 */

import {
  MAIN_RULESET_PATH,
  MERGE_QUEUED_LABEL,
  SET_ASIDE_COMMENT_SCAN,
} from 'pr-report-core';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';

/**
 * How many open pull requests one read covers. A repository with more open
 * than this has a different problem than an unreadable page, so a read that
 * finds more fails loudly rather than reporting part of them as the whole.
 * It is also most of what the query costs: the points are counted from the
 * sizes asked for, not from what comes back.
 */
export const OPEN_LIMIT = 50;

/**
 * How many recently updated merged pull requests are looked through for the
 * ones that merged in the window. Updated rather than merged, because GitHub
 * does not sort by merge time.
 */
const MERGED_SCAN = 30;

/**
 * How many open issues a read lists, most recently updated first — the
 * same number `pnpm run pr-report` defaults to. Enough to see what is
 * open without the section becoming the page; the rest are a page of
 * {@link ISSUES_PAGE_SIZE} each, read when the reader asks for them.
 */
export const ISSUES_LIMIT = 30;

/** How many more open issues each page after the first reads: GitHub's most. */
export const ISSUES_PAGE_SIZE = 100;

/** One page of a list inside a pull request. */
const PAGE_SIZE = 100;

const CODE_OWNERS_PATH = '.github/CODEOWNERS';

const LABELS = 'labels(first: 20) { nodes { name color description } }';

const ISSUE_FIELDS = 'number title url state repository { nameWithOwner }';

/**
 * The issues GitHub records as blocking one — its issue dependencies — which
 * are read as `Start-After:` lines are (`pr-report-core`'s `waitsFor`).
 */
const BLOCKED_BY =
  'blockedBy(first: 20) { nodes { number repository { nameWithOwner } } }';

const CLOSING_ISSUES =
  `closingIssuesReferences(first: 10) { nodes { ${ISSUE_FIELDS} } }` as const;

/**
 * An open pull request's closing issues, with the bodies their
 * `Start-After:` is read from: the pull request inherits it as a merge order
 * (`docs/issue-start-after.md`). A merged one inherits nothing, so its
 * closing issues are read without.
 */
const OPEN_CLOSING_ISSUES =
  `closingIssuesReferences(first: 10) { nodes { ${ISSUE_FIELDS} body ${BLOCKED_BY} } }` as const;

const PAGE_INFO = 'pageInfo { hasNextPage endCursor }';

/** The open issues, newest update first, in either query that lists them. */
const OPEN_ISSUES_ORDER =
  'states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }';

const OPEN_ISSUE_PAGE = [
  'totalCount',
  PAGE_INFO,
  'nodes {',
  '  number title body url createdAt updatedAt',
  `  ${BLOCKED_BY}`,
  '  author { login }',
  `  ${LABELS}`,
  '  comments { totalCount }',
  '}',
].join(' ');

const CONTEXT_NODES = [
  'nodes {',
  '  __typename',
  '  ... on CheckRun { databaseId name status conclusion checkSuite { databaseId status workflowRun { workflow { databaseId } } } }',
  '  ... on StatusContext { context state description }',
  '}',
].join(' ');

/** The open pull requests, in the order every query that lists them uses. */
const OPEN_PULLS =
  `open: pullRequests(states: OPEN, first: ${OPEN_LIMIT}, orderBy: { field: CREATED_AT, direction: ASC })` as const;

/**
 * The open pull requests as the merge order draws them — what each is, the
 * branch it is of, its labels, what its body declares — the two files on
 * the default branch (`HEAD`) that say what a pull request is required to
 * have, and whether the repository has the label `unblock-prs`'s queue is
 * made of. The one query the page waits for before it draws anything.
 */
export const PULL_REQUESTS_QUERY = [
  'query PullRequests($owner: String!, $name: String!) {',
  '  repository(owner: $owner, name: $name) {',
  '    defaultBranchRef { name }',
  `    ruleset: object(expression: "HEAD:${MAIN_RULESET_PATH}") { ... on Blob { text } }`,
  `    codeOwners: object(expression: "HEAD:${CODE_OWNERS_PATH}") { ... on Blob { text } }`,
  `    queueLabel: label(name: "${MERGE_QUEUED_LABEL}") { name }`,
  `    ${OPEN_PULLS} {`,
  '      totalCount',
  '      nodes {',
  '        number title body isDraft url updatedAt',
  '        author { login }',
  '        autoMergeRequest { enabledAt }',
  '        headRefName headRefOid baseRefName isCrossRepository',
  '        baseRef { target { oid } }',
  `        ${LABELS}`,
  '        commits(last: 1) { nodes { commit { committedDate } } }',
  '      }',
  '    }',
  '  }',
  '}',
].join('\n');

/**
 * What every context reported on each open pull request's head. Its own
 * query because it is the slowest part by far: each check run is followed to
 * the workflow it belongs to, which is what tells a superseded round from the
 * current one.
 */
export const CHECKS_QUERY = [
  'query Checks($owner: String!, $name: String!) {',
  '  repository(owner: $owner, name: $name) {',
  `    ${OPEN_PULLS} {`,
  '      nodes {',
  '        number headRefOid',
  `        commits(last: 1) { nodes { commit { statusCheckRollup { contexts(first: ${PAGE_SIZE}) { ${PAGE_INFO} ${CONTEXT_NODES} } } } } }`,
  '      }',
  '    }',
  '  }',
  '}',
].join('\n');

/**
 * What only the badges, the linked issues on each card and the queue are
 * read from: the issues the body closes, the reviews and the changed files a
 * code owner's approval is decided over, the recent comments a set-aside
 * record or a claim is found among, and what the queue's order turns on —
 * whether a merge would conflict, the unresolved conversations, and a place
 * in one of GitHub's native stacks (`queue-view.mts`).
 */
export const DETAILS_QUERY = [
  'query PullRequestDetails($owner: String!, $name: String!) {',
  '  repository(owner: $owner, name: $name) {',
  `    ${OPEN_PULLS} {`,
  '      nodes {',
  '        number bodyHTML',
  `        ${OPEN_CLOSING_ISSUES}`,
  '        latestOpinionatedReviews(first: 20, writersOnly: true) { nodes { state author { login } } }',
  `        files(first: ${PAGE_SIZE}) { ${PAGE_INFO} nodes { path } }`,
  `        comments(last: ${SET_ASIDE_COMMENT_SCAN}) { nodes { url body viewerDidAuthor } }`,
  '        mergeable stackEntry { position stack { number size } }',
  `        reviewThreads(first: ${PAGE_SIZE}) { nodes { isResolved } }`,
  '      }',
  '    }',
  '  }',
  '}',
].join('\n');

/** The pull requests that merged lately, for the section below the queue. */
export const MERGED_QUERY = [
  'query MergedPullRequests($owner: String!, $name: String!) {',
  '  repository(owner: $owner, name: $name) {',
  `    merged: pullRequests(states: MERGED, first: ${MERGED_SCAN}, orderBy: { field: UPDATED_AT, direction: DESC }) {`,
  '      nodes {',
  '        number title bodyHTML url mergedAt headRefName baseRefName',
  '        author { login }',
  `        ${LABELS}`,
  `        ${CLOSING_ISSUES}`,
  '      }',
  '    }',
  '  }',
  '}',
].join('\n');

/**
 * `$first` open issues, most recently updated first: the first of them when
 * `$after` is `null`, and otherwise the page after that cursor.
 */
export const OPEN_ISSUES_QUERY = [
  'query OpenIssues($owner: String!, $name: String!, $first: Int!, $after: String) {',
  '  repository(owner: $owner, name: $name) {',
  `    issues(${OPEN_ISSUES_ORDER}, first: $first, after: $after) { ${OPEN_ISSUE_PAGE} }`,
  '  }',
  '}',
].join('\n');

/**
 * What a follow-up can be asked to fetch for one pull request. Each becomes
 * one aliased field, so a single request covers all of them.
 */
export type FollowUp = Readonly<
  | {
      kind: 'compare';
      number: number;
      /** `refs/heads/<base>`. */
      baseQualifiedName: string;
      /** The head commit, which works for a fork's head as well as a branch. */
      headSha: string;
    }
  | { kind: 'contexts'; number: number; headSha: string; after: string }
  | { kind: 'files'; number: number; after: string }
>;

/**
 * What a follow-up query is called, after what it asks: how far each head is
 * from its base, or the rest of the check results or of the changed files.
 * Named apart because they go out at different moments, and a name is what
 * tells them apart in the browser's network panel.
 */
export type FollowUpName = 'Compare' | 'MoreChecks' | 'MoreFiles';

/**
 * One query for a list of follow-ups, with every value that came from
 * GitHub passed as a variable rather than written into the query text: a
 * branch name is chosen by whoever opened the pull request.
 *
 * The aliases are `compare_N`, `contexts_N` and `files_N`, `N` being the pull
 * request number, which is what {@link followUpAlias} reads them back by.
 */
export const followUpQuery = (
  operationName: FollowUpName,
  followUps: readonly FollowUp[],
): Readonly<{
  query: string;
  variables: ReadonlyRecord<string, number | string>;
}> => {
  const parts = followUps.map(followUpPart);

  return {
    query: [
      `query ${operationName}(${['$owner: String!', '$name: String!', ...parts.flatMap(({ declarations }) => declarations)].join(', ')}) {`,
      '  repository(owner: $owner, name: $name) {',
      ...parts.map(({ field }) => `    ${field}`),
      '  }',
      '}',
    ].join('\n'),
    variables: Object.fromEntries(
      parts.flatMap(({ variables }) => Object.entries(variables)),
    ),
  };
};

export const followUpAlias = (followUp: FollowUp): string =>
  `${followUp.kind}_${followUp.number}` as const;

/** One follow-up as a field of the query, and what it declares and binds. */
const followUpPart = (
  followUp: FollowUp,
): Readonly<{
  declarations: readonly string[];
  field: string;
  variables: ReadonlyRecord<string, number | string>;
}> => {
  const alias = followUpAlias(followUp);

  switch (followUp.kind) {
    case 'compare':
      return {
        declarations: [`$${alias}_base: String!`, `$${alias}_head: String!`],
        field: `${alias}: ref(qualifiedName: $${alias}_base) { compare(headRef: $${alias}_head) { aheadBy behindBy } }`,
        variables: {
          [`${alias}_base`]: followUp.baseQualifiedName,
          [`${alias}_head`]: followUp.headSha,
        },
      };

    case 'contexts':
      return {
        declarations: [
          `$${alias}_oid: GitObjectID!`,
          `$${alias}_after: String!`,
        ],
        field: `${alias}: object(oid: $${alias}_oid) { ... on Commit { statusCheckRollup { contexts(first: ${PAGE_SIZE}, after: $${alias}_after) { ${PAGE_INFO} ${CONTEXT_NODES} } } } }`,
        variables: {
          [`${alias}_oid`]: followUp.headSha,
          [`${alias}_after`]: followUp.after,
        },
      };

    case 'files':
      return {
        declarations: [`$${alias}_number: Int!`, `$${alias}_after: String!`],
        field: `${alias}: pullRequest(number: $${alias}_number) { files(first: ${PAGE_SIZE}, after: $${alias}_after) { ${PAGE_INFO} nodes { path } } }`,
        variables: {
          [`${alias}_number`]: followUp.number,
          [`${alias}_after`]: followUp.after,
        },
      };
  }
};

/**
 * One query for the issues a body closes by keyword that GitHub has not
 * linked, so that each is listed as a linked one is, with the body its
 * `Start-After:` is read from. The aliases are
 * `issue_N`, which is what {@link issueAlias} reads them back by.
 */
export const issuesQuery = (
  numbers: readonly number[],
): Readonly<{
  query: string;
  variables: ReadonlyRecord<string, number>;
}> =>
  ({
    query: [
      `query Issues(${['$owner: String!', '$name: String!', ...numbers.map((number) => `$${issueAlias(number)}: Int!`)].join(', ')}) {`,
      '  repository(owner: $owner, name: $name) {',
      ...numbers.map((number) => {
        const alias = issueAlias(number);

        return `    ${alias}: issue(number: $${alias}) { ${ISSUE_FIELDS} body ${BLOCKED_BY} }`;
      }),
      '  }',
      '}',
    ].join('\n'),
    variables: Object.fromEntries(
      numbers.map((number) => [issueAlias(number), number]),
    ),
  }) as const;

export const issueAlias = (number: number): string =>
  `issue_${number}` as const;

/**
 * One query for what the open issues' `Start-After:` declarations name that
 * is not itself a listed issue: what has closed or merged, an open pull
 * request, and an open issue past the end of the list. Issues and pull
 * requests share their numbers, so one field answers for either. The aliases
 * are `ref_N`, which is what {@link referenceAlias} reads them back by.
 */
export const referencesQuery = (
  numbers: readonly number[],
): Readonly<{
  query: string;
  variables: ReadonlyRecord<string, number>;
}> =>
  ({
    query: [
      `query References(${['$owner: String!', '$name: String!', ...numbers.map((number) => `$${referenceAlias(number)}: Int!`)].join(', ')}) {`,
      '  repository(owner: $owner, name: $name) {',
      ...numbers.map((number) => {
        const alias = referenceAlias(number);

        return `    ${alias}: issueOrPullRequest(number: $${alias}) { ${REFERENCE_FIELDS} }`;
      }),
      '  }',
      '}',
    ].join('\n'),
    variables: Object.fromEntries(
      numbers.map((number) => [referenceAlias(number), number]),
    ),
  }) as const;

export const referenceAlias = (number: number): string =>
  `ref_${number}` as const;

const REFERENCE_FIELDS = [
  '__typename',
  '... on Issue { number title url state stateReason }',
  '... on PullRequest { number title url state merged }',
].join(' ');

const PageInfoSchema = t.record({
  hasNextPage: t.boolean(),
  endCursor: t.union([t.string(), t.nullType]),
});

const LabelsSchema = t.record({
  nodes: t.array(
    t.record({
      name: t.string(),
      color: t.string(),
      description: t.union([t.string(), t.nullType]),
    }),
  ),
});

export const IssueSchema = t.record({
  number: t.number(),
  title: t.string(),
  url: t.string(),
  state: t.string(),
  repository: t.record({ nameWithOwner: t.string() }),
});

/** What GitHub records as blocking an issue, of any repository. */
const BlockedBySchema = t.record({
  nodes: t.array(
    t.record({
      number: t.number(),
      repository: t.record({ nameWithOwner: t.string() }),
    }),
  ),
});

export type BlockedByNodes = t.TypeOf<typeof BlockedBySchema>;

/**
 * {@link IssueSchema} with what it waits for: the body `Start-After:` is
 * read from, and its issue dependencies.
 */
export const IssueWithBodySchema = t.record({
  number: t.number(),
  title: t.string(),
  url: t.string(),
  state: t.string(),
  repository: t.record({ nameWithOwner: t.string() }),
  body: t.string(),
  blockedBy: BlockedBySchema,
});

const ClosingIssuesSchema = t.record({ nodes: t.array(IssueSchema) });

/** `null` for a deleted account, which GitHub calls a ghost. */
const AuthorSchema = t.union([t.record({ login: t.string() }), t.nullType]);

const CheckSuiteSchema = t.record({
  databaseId: t.union([t.number(), t.nullType]),
  status: t.string(),
  // `null` for a suite another app made.
  workflowRun: t.union([
    t.record({
      workflow: t.record({ databaseId: t.union([t.number(), t.nullType]) }),
    }),
    t.nullType,
  ]),
});

export type CheckSuiteNode = t.TypeOf<typeof CheckSuiteSchema>;

const ContextSchema = t.union([
  t.record({
    __typename: t.literal('CheckRun'),
    databaseId: t.union([t.number(), t.nullType]),
    name: t.string(),
    status: t.string(),
    conclusion: t.union([t.string(), t.nullType]),
    checkSuite: t.union([CheckSuiteSchema, t.nullType]),
  }),
  t.record({
    __typename: t.literal('StatusContext'),
    context: t.string(),
    state: t.string(),
    description: t.union([t.string(), t.nullType]),
  }),
]);

export type ContextNode = t.TypeOf<typeof ContextSchema>;

const ContextsPageSchema = t.record({
  pageInfo: PageInfoSchema,
  nodes: t.array(ContextSchema),
});

const FilesPageSchema = t.record({
  pageInfo: PageInfoSchema,
  nodes: t.array(t.record({ path: t.string() })),
});

/** A commit nobody has reported anything on has no rollup at all. */
const RollupSchema = t.union([
  t.record({ contexts: ContextsPageSchema }),
  t.nullType,
]);

const PullRequestSchema = t.record({
  number: t.number(),
  title: t.string(),
  /** Where `Merge-After:` and the `Claude-Session:` trailers are read from. */
  body: t.string(),
  isDraft: t.boolean(),
  url: t.string(),
  updatedAt: t.string(),
  author: AuthorSchema,
  autoMergeRequest: t.union([t.record({}), t.nullType]),
  headRefName: t.string(),
  headRefOid: t.string(),
  baseRefName: t.string(),
  /** A fork's head branch is never the parent of a stacked pull request. */
  isCrossRepository: t.boolean(),
  /**
   * The base branch's tip now, which is what a set-aside comment is judged
   * against. `null` when the base branch has been deleted.
   */
  baseRef: t.union([
    t.record({ target: t.union([t.record({ oid: t.string() }), t.nullType]) }),
    t.nullType,
  ]),
  labels: LabelsSchema,
  commits: t.record({
    nodes: t.array(
      t.record({
        commit: t.record({
          /** When the head commit was made: the branch's last push, nearly. */
          committedDate: t.string(),
        }),
      }),
    ),
  }),
});

export type OpenPullRequest = t.TypeOf<typeof PullRequestSchema>;

const PullRequestChecksSchema = t.record({
  number: t.number(),
  /** The head the checks are of, which a push can move between two queries. */
  headRefOid: t.string(),
  commits: t.record({
    nodes: t.array(
      t.record({ commit: t.record({ statusCheckRollup: RollupSchema }) }),
    ),
  }),
});

export type PullRequestChecks = t.TypeOf<typeof PullRequestChecksSchema>;

const PullRequestDetailsSchema = t.record({
  number: t.number(),
  /** Where GitHub marks the closing keywords it read in `body`. */
  bodyHTML: t.string(),
  closingIssuesReferences: t.record({ nodes: t.array(IssueWithBodySchema) }),
  latestOpinionatedReviews: t.record({
    nodes: t.array(t.record({ state: t.string(), author: AuthorSchema })),
  }),
  files: FilesPageSchema,
  /**
   * Where `unblock-prs` says why it set the pull request aside, among the
   * rest. `pr-report-core`'s `set-aside.mts` says why only the ones the
   * viewer wrote are read.
   */
  comments: t.record({
    nodes: t.array(
      t.record({
        url: t.string(),
        body: t.string(),
        viewerDidAuthor: t.boolean(),
      }),
    ),
  }),
  /**
   * `CONFLICTING` when a merge into the base would conflict, which the queue
   * orders after the rest as `unblock-prs` orders `DIRTY`. GitHub's
   * `mergeStateStatus` would say it outright, but is a preview field.
   */
  mergeable: t.string(),
  /** Its place in one of GitHub's native stacks, which nothing arms. */
  stackEntry: t.union([
    t.record({
      position: t.number(),
      stack: t.record({ number: t.number(), size: t.number() }),
    }),
    t.nullType,
  ]),
  reviewThreads: t.record({
    nodes: t.array(t.record({ isResolved: t.boolean() })),
  }),
});

export type PullRequestDetails = t.TypeOf<typeof PullRequestDetailsSchema>;

const MergedPullRequestSchema = t.record({
  number: t.number(),
  title: t.string(),
  bodyHTML: t.string(),
  url: t.string(),
  mergedAt: t.string(),
  headRefName: t.string(),
  baseRefName: t.string(),
  author: AuthorSchema,
  labels: LabelsSchema,
  closingIssuesReferences: ClosingIssuesSchema,
});

export type MergedPullRequestNode = t.TypeOf<typeof MergedPullRequestSchema>;

const OpenIssueSchema = t.record({
  number: t.number(),
  title: t.string(),
  /** Where `Start-After:` is read from. */
  body: t.string(),
  blockedBy: BlockedBySchema,
  url: t.string(),
  createdAt: t.string(),
  updatedAt: t.string(),
  author: AuthorSchema,
  labels: LabelsSchema,
  comments: t.record({ totalCount: t.number() }),
});

export type OpenIssueNode = t.TypeOf<typeof OpenIssueSchema>;

const OpenIssuePageSchema = t.record({
  totalCount: t.number(),
  pageInfo: PageInfoSchema,
  nodes: t.array(OpenIssueSchema),
});

export type OpenIssuePage = t.TypeOf<typeof OpenIssuePageSchema>;

export const OpenIssuesDataSchema = t.record({
  repository: t.record({ issues: OpenIssuePageSchema }),
});

/** What `issueOrPullRequest` answers, by the kind it turned out to be. */
export const ReferenceSchema = t.union([
  t.record({
    __typename: t.literal('Issue'),
    number: t.number(),
    title: t.string(),
    url: t.string(),
    state: t.string(),
    stateReason: t.union([t.string(), t.nullType]),
  }),
  t.record({
    __typename: t.literal('PullRequest'),
    number: t.number(),
    title: t.string(),
    url: t.string(),
    state: t.string(),
    merged: t.boolean(),
  }),
]);

/** `null` when the path is not on the default branch. */
const BlobSchema = t.union([t.record({ text: t.string() }), t.nullType]);

export const PullRequestsDataSchema = t.record({
  repository: t.record({
    /** `null` only for a repository with no commits, and so no pull requests. */
    defaultBranchRef: t.union([t.record({ name: t.string() }), t.nullType]),
    ruleset: BlobSchema,
    codeOwners: BlobSchema,
    /** `null` when the repository has no such label. */
    queueLabel: t.union([t.record({ name: t.string() }), t.nullType]),
    open: t.record({
      totalCount: t.number(),
      nodes: t.array(PullRequestSchema),
    }),
  }),
});

export const ChecksDataSchema = t.record({
  repository: t.record({
    open: t.record({ nodes: t.array(PullRequestChecksSchema) }),
  }),
});

export const DetailsDataSchema = t.record({
  repository: t.record({
    open: t.record({ nodes: t.array(PullRequestDetailsSchema) }),
  }),
});

export const MergedDataSchema = t.record({
  repository: t.record({
    merged: t.record({ nodes: t.array(MergedPullRequestSchema) }),
  }),
});

/** A base branch that no longer exists is a `null` ref. */
export const CompareFieldSchema = t.union([
  t.record({
    compare: t.union([
      t.record({ aheadBy: t.number(), behindBy: t.number() }),
      t.nullType,
    ]),
  }),
  t.nullType,
]);

export const ContextsFieldSchema = t.record({
  statusCheckRollup: RollupSchema,
});

export const FilesFieldSchema = t.record({ files: FilesPageSchema });

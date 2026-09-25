/**
 * What the page asks GitHub, and the shape it expects back.
 *
 * Two kinds of query. **The report query** asks for everything that can be
 * asked for at once: every open pull request with its labels, reviews,
 * changed files and check results, what merged recently, the open issues,
 * and the two files
 * on the default branch that say what a pull request is required to have —
 * the ruleset and `CODEOWNERS`. **A follow-up** asks for what could only be
 * named after that answer: how far each head is from its base, and the next
 * page of any list that did not fit in one.
 *
 * Measured against this repository: 4 points and about four seconds for the
 * report query, and about one point for the follow-up that always runs.
 */

import { MAIN_RULESET_PATH } from 'pr-report-core';
import * as t from 'ts-fortress';
import { type ReadonlyRecord } from 'ts-type-forge';

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
 * How many open issues are listed, most recently updated first — the same
 * number `pnpm run pr-report` defaults to. Enough to see what is open
 * without the section becoming the page.
 */
export const ISSUES_LIMIT = 30;

/** One page of a list inside a pull request. */
const PAGE_SIZE = 100;

const CODE_OWNERS_PATH = '.github/CODEOWNERS';

const LABELS = 'labels(first: 20) { nodes { name color description } }';

const CLOSING_ISSUES =
  'closingIssuesReferences(first: 10) { nodes { number title url state repository { nameWithOwner } } }';

const PAGE_INFO = 'pageInfo { hasNextPage endCursor }';

const CONTEXT_NODES = [
  'nodes {',
  '  __typename',
  '  ... on CheckRun { databaseId name status conclusion checkSuite { databaseId } }',
  '  ... on StatusContext { context state description }',
  '}',
].join(' ');

/** The report query. `HEAD` is the default branch. */
export const REPORT_QUERY = [
  'query PullRequestsManager($owner: String!, $name: String!) {',
  '  repository(owner: $owner, name: $name) {',
  `    ruleset: object(expression: "HEAD:${MAIN_RULESET_PATH}") { ... on Blob { text } }`,
  `    codeOwners: object(expression: "HEAD:${CODE_OWNERS_PATH}") { ... on Blob { text } }`,
  `    open: pullRequests(states: OPEN, first: ${OPEN_LIMIT}, orderBy: { field: CREATED_AT, direction: ASC }) {`,
  '      totalCount',
  '      nodes {',
  '        number title body isDraft url updatedAt',
  '        author { login }',
  '        autoMergeRequest { enabledAt }',
  '        headRefName headRefOid baseRefName',
  '        baseRef { target { oid } }',
  `        ${LABELS}`,
  `        ${CLOSING_ISSUES}`,
  '        latestOpinionatedReviews(first: 20, writersOnly: true) { nodes { state author { login } } }',
  `        files(first: ${PAGE_SIZE}) { ${PAGE_INFO} nodes { path } }`,
  `        commits(last: 1) { nodes { commit { committedDate statusCheckRollup { contexts(first: ${PAGE_SIZE}) { ${PAGE_INFO} ${CONTEXT_NODES} } } } } }`,
  '      }',
  '    }',
  `    merged: pullRequests(states: MERGED, first: ${MERGED_SCAN}, orderBy: { field: UPDATED_AT, direction: DESC }) {`,
  '      nodes {',
  '        number title url mergedAt headRefName baseRefName',
  '        author { login }',
  `        ${LABELS}`,
  `        ${CLOSING_ISSUES}`,
  '      }',
  '    }',
  `    issues(states: OPEN, first: ${ISSUES_LIMIT}, orderBy: { field: UPDATED_AT, direction: DESC }) {`,
  '      totalCount',
  '      nodes {',
  '        number title url createdAt updatedAt',
  '        author { login }',
  `        ${LABELS}`,
  '        comments { totalCount }',
  '      }',
  '    }',
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
 * One query for a list of follow-ups, with every value that came from
 * GitHub passed as a variable rather than written into the query text: a
 * branch name is chosen by whoever opened the pull request.
 *
 * The aliases are `compare_N`, `contexts_N` and `files_N`, `N` being the pull
 * request number, which is what {@link followUpAlias} reads them back by.
 */
export const followUpQuery = (
  followUps: readonly FollowUp[],
): Readonly<{
  query: string;
  variables: ReadonlyRecord<string, number | string>;
}> => {
  const parts = followUps.map(followUpPart);

  return {
    query: [
      `query FollowUp(${['$owner: String!', '$name: String!', ...parts.flatMap(({ declarations }) => declarations)].join(', ')}) {`,
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

const ClosingIssuesSchema = t.record({
  nodes: t.array(
    t.record({
      number: t.number(),
      title: t.string(),
      url: t.string(),
      state: t.string(),
      repository: t.record({ nameWithOwner: t.string() }),
    }),
  ),
});

/** `null` for a deleted account, which GitHub calls a ghost. */
const AuthorSchema = t.union([t.record({ login: t.string() }), t.nullType]);

const ContextSchema = t.union([
  t.record({
    __typename: t.literal('CheckRun'),
    databaseId: t.union([t.number(), t.nullType]),
    name: t.string(),
    status: t.string(),
    conclusion: t.union([t.string(), t.nullType]),
    checkSuite: t.union([
      t.record({ databaseId: t.union([t.number(), t.nullType]) }),
      t.nullType,
    ]),
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

const OpenPullRequestSchema = t.record({
  number: t.number(),
  title: t.string(),
  body: t.string(),
  isDraft: t.boolean(),
  url: t.string(),
  updatedAt: t.string(),
  author: AuthorSchema,
  autoMergeRequest: t.union([t.record({}), t.nullType]),
  headRefName: t.string(),
  headRefOid: t.string(),
  baseRefName: t.string(),
  /**
   * The base branch's tip now, which is what a set-aside status is judged
   * against. `null` when the base branch has been deleted.
   */
  baseRef: t.union([
    t.record({ target: t.union([t.record({ oid: t.string() }), t.nullType]) }),
    t.nullType,
  ]),
  labels: LabelsSchema,
  closingIssuesReferences: ClosingIssuesSchema,
  latestOpinionatedReviews: t.record({
    nodes: t.array(t.record({ state: t.string(), author: AuthorSchema })),
  }),
  files: FilesPageSchema,
  commits: t.record({
    nodes: t.array(
      t.record({
        commit: t.record({
          /** When the head commit was made: the branch's last push, nearly. */
          committedDate: t.string(),
          statusCheckRollup: RollupSchema,
        }),
      }),
    ),
  }),
});

export type OpenPullRequest = t.TypeOf<typeof OpenPullRequestSchema>;

const MergedPullRequestSchema = t.record({
  number: t.number(),
  title: t.string(),
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
  url: t.string(),
  createdAt: t.string(),
  updatedAt: t.string(),
  author: AuthorSchema,
  labels: LabelsSchema,
  comments: t.record({ totalCount: t.number() }),
});

export type OpenIssueNode = t.TypeOf<typeof OpenIssueSchema>;

/** `null` when the path is not on the default branch. */
const BlobSchema = t.union([t.record({ text: t.string() }), t.nullType]);

export const ReportDataSchema = t.record({
  repository: t.record({
    ruleset: BlobSchema,
    codeOwners: BlobSchema,
    open: t.record({
      totalCount: t.number(),
      nodes: t.array(OpenPullRequestSchema),
    }),
    merged: t.record({ nodes: t.array(MergedPullRequestSchema) }),
    issues: t.record({
      totalCount: t.number(),
      nodes: t.array(OpenIssueSchema),
    }),
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

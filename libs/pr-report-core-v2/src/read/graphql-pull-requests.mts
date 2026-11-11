/**
 * The open pull requests over GraphQL, in two parts, each its own query read to
 * its last page: what each is (`PULL_REQUESTS_QUERY`), and what its review,
 * comments, stack and timeline say (`DETAILS_QUERY`), which takes GitHub far
 * longer to answer. What only REST answers — the checks and their rounds, the
 * comparison with the base, who pushed — is read over REST for each, as the
 * REST reader reads it (`libs/pr-merge-queue-v2/spec/README.md`, §3); and so is
 * what GraphQL cuts short or leaves out: labels past a hundred, files past a
 * hundred or with a rename or copy, comments past a hundred, and the head's
 * commit time where the head is not the last commit listed.
 */

import { Arr, hasKey, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import type { ReadonlyRecord } from 'ts-type-forge';
import { closingKeywordIssuesInHtml } from '../conventions/index.mjs';
import type {
  BaseChange,
  ChangedFile,
  ClosingIssue,
  MergedParent,
  OwnComment,
  PullRequestFacts,
  Read,
  ReviewFacts,
} from '../snapshot/index.mjs';
import { allRead } from './all-read.mjs';
import { malformed } from './classify.mjs';
import { graphqlRead } from './graphql.mjs';
import { readHeadChecks } from './rest-checks.mjs';
import {
  LabelSchema,
  labelsOf,
  latestReviewsOf,
  readChangedFiles,
  readClosingIssue,
  readComparison,
  readHeadCommittedAt,
  readLabels,
  readOwnComments,
  readPushers,
} from './rest-pull-requests.mjs';
import { isContextRepository, MAX_PAGES } from './rest.mjs';
import type { ReadContext } from './transport.mjs';

/**
 * Every open pull request, lowest number first. The list itself fails whole;
 * each pull request's own parts fail on their own, as the REST reader's do.
 */
export const readPullRequestsGraphql = async (
  context: ReadContext,
  options: Readonly<{ viewer: Read<string> }>,
): Promise<Read<readonly PullRequestFacts[]>> => {
  // The details take GitHub far longer: what each pull request reads over REST
  // starts as soon as the list is in, beside them.
  const details = graphqlPages(
    context,
    'the details of the open pull requests',
    DETAILS_QUERY,
    DetailsSchema,
  ).then(Result.map(byNumber));

  const pulls = await graphqlPages(
    context,
    'the open pull requests',
    PULL_REQUESTS_QUERY,
    PullSchema,
  );

  // The details are waited for whatever the list says, so that nothing is left
  // reading on after this read has ended.
  const [read] = await Promise.all([
    Result.isErr(pulls)
      ? Promise.resolve(pulls)
      : Promise.all(
          pulls.value.map(async (pr) =>
            pullRequestOf(
              context,
              pr,
              details.then((each) =>
                Result.isErr(each)
                  ? each
                  : detailsFor(pr.number, each.value.get(pr.number)),
              ),
              options.viewer,
            ),
          ),
        ).then(allRead),
    details,
  ]);

  return read;
};

/** One page of open pull requests, oldest first, as every part lists them. */
const OPEN_PULLS =
  'pullRequests(states: OPEN, first: $first, after: $after, orderBy: { field: CREATED_AT, direction: ASC })';

const PAGE_INFO = 'pageInfo { hasNextPage endCursor }';

/** What each open pull request is: the merge order is drawn from this alone. */
export const PULL_REQUESTS_QUERY = [
  'query PullRequests($owner: String!, $name: String!, $first: Int!, $after: String) {',
  '  repository(owner: $owner, name: $name) {',
  `    list: ${OPEN_PULLS} {`,
  `      ${PAGE_INFO}`,
  '      nodes {',
  '        number title body bodyHTML url isDraft createdAt updatedAt',
  '        author { login }',
  '        labels(first: 100) { totalCount nodes { name color description } }',
  '        autoMergeRequest { enabledAt }',
  '        headRefName headRefOid baseRefName isCrossRepository mergeStateStatus',
  '        headRepository { nameWithOwner }',
  '        commits(last: 1) { nodes { commit { oid committedDate } } }',
  '        closingIssuesReferences(first: 50) { totalCount nodes { number title url state repository { nameWithOwner } } }',
  '      }',
  '    }',
  '  }',
  '}',
].join('\n');

/**
 * What a review rule, a comment record, a stack and a restack read. The files
 * name only their new path: a rename's old one is GraphQL's to withhold.
 */
export const DETAILS_QUERY = [
  'query PullRequestDetails($owner: String!, $name: String!, $first: Int!, $after: String) {',
  '  repository(owner: $owner, name: $name) {',
  `    list: ${OPEN_PULLS} {`,
  `      ${PAGE_INFO}`,
  '      nodes {',
  '        number changedFiles',
  '        latestOpinionatedReviews(first: 100, writersOnly: true) { totalCount nodes { state author { login } } }',
  '        files(first: 100) { nodes { path changeType } }',
  '        reviewThreads(first: 100) { totalCount nodes { isResolved } }',
  '        comments(last: 100) { totalCount nodes { databaseId body createdAt viewerDidAuthor } }',
  '        stackEntry { position stack { number size } }',
  '        timelineItems(itemTypes: [BASE_REF_CHANGED_EVENT], first: 100) { totalCount nodes { ... on BaseRefChangedEvent { previousRefName currentRefName createdAt } } }',
  '      }',
  '    }',
  '  }',
  '}',
].join('\n');

/** How many merged pull requests of one head branch are looked through. */
const MERGED_HEAD_SCAN = 100;

/**
 * The merged pull requests of a head branch, most recently updated first: the
 * one of this repository merged last is the parent (a branch name is reused,
 * and a fork's may match).
 */
export const MERGED_HEAD_QUERY = [
  'query MergedHead($owner: String!, $name: String!, $branch: String!) {',
  '  repository(owner: $owner, name: $name) {',
  `    pullRequests(headRefName: $branch, states: MERGED, first: ${MERGED_HEAD_SCAN}, orderBy: { field: UPDATED_AT, direction: DESC }) {`,
  '      nodes { number headRefOid mergedAt headRepository { nameWithOwner } mergeCommit { oid } }',
  '    }',
  '  }',
  '}',
].join('\n');

/**
 * How many open pull requests one page covers: what decides whether GitHub
 * answers the details at all is time, not points, and a query it does not
 * finish in time comes back as no answer.
 */
const PAGE_SIZE = 20;

const LoginSchema = t.union([t.record({ login: t.string() }), t.nullType]);

const PullSchema = t.record({
  number: t.number(),
  title: t.string(),
  body: t.string(),
  bodyHTML: t.string(),
  url: t.string(),
  isDraft: t.boolean(),
  createdAt: t.string(),
  updatedAt: t.string(),
  author: LoginSchema,
  labels: t.record({ totalCount: t.number(), nodes: t.array(LabelSchema) }),
  autoMergeRequest: t.union([t.record({ enabledAt: t.unknown() }), t.nullType]),
  headRefName: t.string(),
  headRefOid: t.string(),
  baseRefName: t.string(),
  mergeStateStatus: t.string(),
  headRepository: t.union([
    t.record({ nameWithOwner: t.string() }),
    t.nullType,
  ]),
  commits: t.record({
    nodes: t.array(
      t.record({
        commit: t.record({ oid: t.string(), committedDate: t.string() }),
      }),
    ),
  }),
  closingIssuesReferences: t.record({
    totalCount: t.number(),
    nodes: t.array(
      t.record({
        number: t.number(),
        title: t.string(),
        url: t.string(),
        state: t.string(),
        repository: t.record({ nameWithOwner: t.string() }),
      }),
    ),
  }),
});

type PullJson = t.TypeOf<typeof PullSchema>;

const DetailsSchema = t.record({
  number: t.number(),
  changedFiles: t.number(),
  latestOpinionatedReviews: t.record({
    totalCount: t.number(),
    nodes: t.array(t.record({ state: t.string(), author: LoginSchema })),
  }),
  files: t.union([
    t.record({
      nodes: t.array(t.record({ path: t.string(), changeType: t.string() })),
    }),
    t.nullType,
  ]),
  reviewThreads: t.record({
    totalCount: t.number(),
    nodes: t.array(t.record({ isResolved: t.boolean() })),
  }),
  comments: t.record({
    totalCount: t.number(),
    nodes: t.array(
      t.record({
        databaseId: t.union([t.number(), t.nullType]),
        body: t.string(),
        createdAt: t.string(),
        viewerDidAuthor: t.boolean(),
      }),
    ),
  }),
  stackEntry: t.union([
    t.record({
      position: t.number(),
      stack: t.record({ number: t.number(), size: t.number() }),
    }),
    t.nullType,
  ]),
  timelineItems: t.record({
    totalCount: t.number(),
    nodes: t.array(
      t.record({
        previousRefName: t.optional(t.string()),
        currentRefName: t.optional(t.string()),
        createdAt: t.optional(t.string()),
      }),
    ),
  }),
});

type DetailsJson = t.TypeOf<typeof DetailsSchema>;

/** GraphQL's `changeType`, as REST spells a file's `status`. */
const CHANGE_OF = {
  ADDED: 'added',
  CHANGED: 'changed',
  COPIED: 'copied',
  DELETED: 'removed',
  MODIFIED: 'modified',
  RENAMED: 'renamed',
} as const satisfies ReadonlyRecord<string, ChangedFile['change']>;

/** Every page of one open-pull-request list query, failing past the bound. */
const graphqlPages = async <A,>(
  context: ReadContext,
  what: string,
  query: string,
  node: t.Type<A>,
  after: string | null = null,
  before: readonly A[] = [],
  pagesLeft: number = MAX_PAGES,
): Promise<Read<readonly A[]>> => {
  if (pagesLeft <= 0) {
    return Result.err(
      malformed(what, 'more pages than allowed; not read as the whole'),
    );
  }

  const page = await graphqlRead(
    context,
    what,
    query,
    { first: PAGE_SIZE, after },
    t.record({
      repository: t.record({
        list: t.record({
          pageInfo: t.record({
            hasNextPage: t.boolean(),
            endCursor: t.union([t.string(), t.nullType]),
          }),
          nodes: t.array(node),
        }),
      }),
    }),
  );

  if (Result.isErr(page)) {
    return page;
  }

  const { pageInfo, nodes } = page.value.repository.list;

  const read = [...before, ...nodes] as const;

  if (!pageInfo.hasNextPage) {
    return Result.ok(read);
  }

  return pageInfo.endCursor === null
    ? Result.err(malformed(what, 'a next page and no cursor to it'))
    : graphqlPages(
        context,
        what,
        query,
        node,
        pageInfo.endCursor,
        read,
        pagesLeft - 1,
      );
};

const byNumber = (
  nodes: readonly DetailsJson[],
): ReadonlyMap<number, DetailsJson> =>
  new Map<number, DetailsJson>(
    nodes.map((node) => [node.number, node] as const),
  );

const changeOf = (changeType: string): ChangedFile['change'] =>
  hasKey(CHANGE_OF, changeType) ? CHANGE_OF[changeType] : 'changed';

/** One pull request's details, or why they are missing from the list. */
const detailsFor = (
  number: number,
  details: DetailsJson | undefined,
): Read<DetailsJson> =>
  details === undefined
    ? Result.err(
        malformed(
          `the details of #${number}`,
          'opened while the pull requests were read',
        ),
      )
    : Result.ok(details);

/**
 * The issues the pull request closes: those GitHub links (for a pull request
 * into the default branch only), and the closing keywords GitHub marked in the
 * rendered body, which it does not link otherwise (`conventions.md`, "Closing
 * issues"); in the body's order, then the linked ones it does not name.
 */
const closingIssuesOf = async (
  context: ReadContext,
  pr: PullJson,
): Promise<Read<readonly ClosingIssue[]>> => {
  const references = pr.closingIssuesReferences;

  if (references.totalCount > references.nodes.length) {
    return Result.err(
      malformed(
        `the closing issues of #${pr.number}`,
        `${references.totalCount} linked, ${references.nodes.length} read`,
      ),
    );
  }

  const linked = new Map<number, ClosingIssue>(
    references.nodes
      .filter(({ repository }) =>
        isContextRepository(repository.nameWithOwner, context),
      )
      .map(({ number, title, url, state }) => [
        number,
        { number, title, url, state: state === 'OPEN' ? 'open' : 'closed' },
      ]),
  );

  const named = closingKeywordIssuesInHtml(context, pr.bodyHTML);

  const fromBody = await Promise.all(
    named.map(
      async (number) =>
        linked.get(number) ?? (await readClosingIssue(context, number)),
    ),
  );

  return Result.ok([
    ...fromBody,
    ...Array.from(linked.values()).filter(
      ({ number }) => !named.includes(number),
    ),
  ]);
};

const reviewOf = async (
  context: ReadContext,
  pr: PullJson,
  details: DetailsJson,
): Promise<Read<ReviewFacts>> => {
  const reviews = details.latestOpinionatedReviews;

  if (reviews.totalCount > reviews.nodes.length) {
    return Result.err(
      malformed(
        `the reviews of #${pr.number}`,
        `${reviews.totalCount} reviewers, ${reviews.nodes.length} read`,
      ),
    );
  }

  const listed = details.files?.nodes ?? [];

  // Past the first hundred, or a rename or copy, whose old path GraphQL does
  // not name: every file over REST, as the REST reader reads them.
  const [files, pushers] = await Promise.all([
    details.files === null ||
    listed.length < details.changedFiles ||
    listed.some(
      ({ changeType }) => changeType === 'RENAMED' || changeType === 'COPIED',
    )
      ? readChangedFiles(context, pr.number, details.changedFiles)
      : Result.ok({
          files: listed.map(({ path, changeType }) => ({
            path,
            change: changeOf(changeType),
            previousPath: undefined,
          })),
          complete: true,
        }),
    readPushers(context, pr.headRefName, pr.headRefOid),
  ]);

  if (Result.isErr(files)) {
    return files;
  }

  const threads = details.reviewThreads;

  return Result.ok({
    latestReviews: latestReviewsOf(
      Arr.generate(function* () {
        for (const { state, author } of reviews.nodes) {
          if (author !== null) {
            yield { login: author.login, state };
          }
        }
      }),
      // `writersOnly` lists only those who may write.
      () => true,
    ),
    files: files.value.files,
    filesComplete: files.value.complete,
    unresolvedConversations:
      threads.totalCount > threads.nodes.length
        ? 'unknown'
        : threads.nodes.filter(({ isResolved }) => !isResolved).length,
    pushers,
  });
};

/**
 * This account's comments among the last hundred, or every one of them over
 * REST where there are more: a record older than those must still be found.
 */
const ownCommentsOf = async (
  context: ReadContext,
  number: number,
  details: DetailsJson,
  viewer: Read<string>,
): Promise<Read<readonly OwnComment[]>> =>
  details.comments.totalCount > details.comments.nodes.length
    ? readOwnComments(context, number, viewer)
    : Result.ok(
        Arr.generate(function* () {
          for (const { databaseId, body, createdAt, viewerDidAuthor } of details
            .comments.nodes) {
            if (viewerDidAuthor && databaseId !== null) {
              yield { id: databaseId, body, createdAt };
            }
          }
        }),
      );

const baseChangesOf = (
  number: number,
  details: DetailsJson,
): Read<readonly BaseChange[]> => {
  const timeline = details.timelineItems;

  if (timeline.totalCount > timeline.nodes.length) {
    return Result.err(
      malformed(
        `the base changes of #${number}`,
        `${timeline.totalCount} changes, ${timeline.nodes.length} read`,
      ),
    );
  }

  return Result.ok(
    Arr.generate(function* () {
      for (const {
        previousRefName,
        currentRefName,
        createdAt,
      } of timeline.nodes) {
        if (
          previousRefName !== undefined &&
          currentRefName !== undefined &&
          createdAt !== undefined
        ) {
          yield { from: previousRefName, to: currentRefName, at: createdAt };
        }
      }
    }),
  );
};

/**
 * The merged pull request whose head branch the last base change moved this one
 * off, and whether this head still contains the head it merged at.
 */
const mergedParentOf = async (
  context: ReadContext,
  pr: PullJson,
  baseChanges: Read<readonly BaseChange[]>,
): Promise<Read<MergedParent | undefined>> => {
  if (Result.isErr(baseChanges)) {
    return baseChanges;
  }

  const last = baseChanges.value.at(-1);

  if (last === undefined) {
    return Result.ok(undefined);
  }

  const what = `the merged parent of #${pr.number}` as const;

  const merged = await graphqlRead(
    context,
    what,
    MERGED_HEAD_QUERY,
    { branch: last.from },
    t.record({
      repository: t.record({
        pullRequests: t.record({
          nodes: t.array(
            t.record({
              number: t.number(),
              headRefOid: t.string(),
              mergedAt: t.union([t.string(), t.nullType]),
              headRepository: t.union([
                t.record({ nameWithOwner: t.string() }),
                t.nullType,
              ]),
              mergeCommit: t.union([t.record({ oid: t.string() }), t.nullType]),
            }),
          ),
        }),
      }),
    }),
  );

  if (Result.isErr(merged)) {
    return merged;
  }

  const { nodes } = merged.value.repository.pullRequests;

  // Sorted by update, not merge: a full scan may have left the parent out.
  if (Arr.isMinLengthArray(MERGED_HEAD_SCAN, nodes)) {
    return Result.err(
      malformed(what, `${MERGED_HEAD_SCAN} or more merged from ${last.from}`),
    );
  }

  const movedAt = Date.parse(last.at);

  // This repository's, merged before the base moved off it (a branch name
  // reused later names another), the last of them.
  const parent = Arr.generate(function* () {
    for (const node of nodes) {
      const mergedAtMs =
        node.mergedAt === null ? Number.NaN : Date.parse(node.mergedAt);

      if (
        isContextRepository(node.headRepository?.nameWithOwner, context) &&
        mergedAtMs <= movedAt
      ) {
        yield { node, mergedAtMs };
      }
    }
  })
    .toSorted((a, b) =>
      b.mergedAtMs === a.mergedAtMs
        ? b.node.number - a.node.number
        : b.mergedAtMs - a.mergedAtMs,
    )
    .at(0)?.node;

  const mergeCommit = parent?.mergeCommit ?? null;

  if (parent === undefined || mergeCommit === null) {
    return Result.ok(undefined);
  }

  const comparison = await readComparison(
    context,
    what,
    parent.headRefOid,
    pr.headRefOid,
  );

  return Result.map(comparison, ({ behindBy }) => ({
    number: parent.number,
    headSha: parent.headRefOid,
    mergeCommitSha: mergeCommit.oid,
    containsHead: behindBy === 0,
  }));
};

const pullRequestOf = async (
  context: ReadContext,
  pr: PullJson,
  detailsRead: Promise<Read<DetailsJson>>,
  viewer: Read<string>,
): Promise<Read<PullRequestFacts>> => {
  const lastCommit = pr.commits.nodes.at(-1)?.commit;

  const [
    labels,
    checks,
    closingIssues,
    comparison,
    headCommittedAt,
    [review, comments, baseChanges, mergedParent],
  ] = await Promise.all([
    // Past the hundred listed, every label over REST.
    pr.labels.totalCount > pr.labels.nodes.length
      ? readLabels(context, pr.number)
      : Result.ok(labelsOf(pr.labels.nodes)),
    readHeadChecks(context, pr.headRefOid),
    closingIssuesOf(context, pr),
    readComparison(
      context,
      `the comparison of #${pr.number}`,
      pr.baseRefName,
      pr.headRefOid,
    ),
    // The last commit listed is the head but where the list is cut short or a
    // rebase dated an older commit later: then the head is read by its sha.
    lastCommit?.oid === pr.headRefOid
      ? Result.ok(lastCommit.committedDate)
      : readHeadCommittedAt(context, pr.headRefOid),
    detailsRead.then(async (details) => {
      if (Result.isErr(details)) {
        return [details, details, details, details] as const;
      }

      const changes = baseChangesOf(pr.number, details.value);

      const [reviewRead, commentsRead, parentRead] = await Promise.all([
        reviewOf(context, pr, details.value),
        ownCommentsOf(context, pr.number, details.value, viewer),
        mergedParentOf(context, pr, changes),
      ]);

      return [reviewRead, commentsRead, changes, parentRead] as const;
    }),
  ]);

  if (Result.isErr(labels)) {
    return labels;
  }

  return Result.ok({
    number: pr.number,
    title: pr.title,
    body: pr.body,
    author: pr.author?.login ?? '',
    url: pr.url,
    isDraft: pr.isDraft,
    labels: labels.value,
    autoMerge: pr.autoMergeRequest !== null,
    headRef: pr.headRefName,
    headSha: pr.headRefOid,
    baseRef: pr.baseRefName,
    fromFork: !isContextRepository(pr.headRepository?.nameWithOwner, context),
    mergeState: pr.mergeStateStatus.toUpperCase(),
    createdAt: pr.createdAt,
    updatedAt: pr.updatedAt,
    headCommittedAt,
    checks,
    review,
    comments,
    closingIssues,
    comparison,
    nativeStack: Result.map(await detailsRead, ({ stackEntry }) =>
      stackEntry === null
        ? undefined
        : {
            stack: stackEntry.stack.number,
            position: stackEntry.position,
            size: stackEntry.stack.size,
          },
    ),
    baseChanges,
    mergedParent,
  });
};

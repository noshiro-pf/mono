// cspell:ignore retarget retargeted

/**
 * Everything that reads or writes GitHub or `git`, and nothing that decides.
 * The API client and the `git` runner are shared with the other commands
 * (`tools/scripts/lib/`).
 */

import {
  isSafeRefName,
  parseClaimComment,
  parseSetAsideComment,
  requirementsOfRules,
  SET_ASIDE_COMMENT_SCAN,
  SKIP_CI_LABEL,
  type CheckRunReport,
  type Claim,
  type NativeStackEntry,
  type ReviewState,
  type RulesetRequirements,
} from 'pr-report-core';
import { Arr, isRecord, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import {
  addLabel,
  git,
  graphql,
  graphqlQuery,
  resolveApiContext,
  rest,
  sh,
  type ApiContext,
  type GraphqlVariables,
} from '../lib/index.mjs';
import {
  issueOrderOf,
  unlinkedClosingIssues,
  type ClosingIssueAnswer,
} from './merge-after.mjs';
import {
  PullRequestSchema,
  type BaseChange,
  type IssueOrder,
  type OwnSetAsideComment,
  type PullRequest,
} from './types.mjs';
import { headShaFromListing } from './util.mjs';

/**
 * The credential and the repository every call here takes, and the branch
 * the queue lands on. `repoOption` is `--repo owner/name`, when given.
 */
export const checkPreflight = async (
  repoOption: string | undefined,
): Promise<
  Result<Readonly<{ api: ApiContext; defaultBranch: string }>, string>
> => {
  const api = await resolveApiContext(repoOption);

  if (Result.isErr(api)) {
    return api;
  }

  const repository = await rest(
    api.value,
    'GET',
    '',
    t.record({ default_branch: t.string() }),
  );

  if (Result.isErr(repository)) {
    return Result.err(`cannot read the default branch: ${repository.value}`);
  }

  const name = repository.value.default_branch;

  if (!isSafeRefName(name)) {
    return Result.err(
      `unexpected default branch name: ${JSON.stringify(name)}`,
    );
  }

  return Result.ok({ api: api.value, defaultBranch: name });
};

/**
 * The open pull requests, newest first, at most {@link OPEN_LIMIT} of them
 * as `gh pr list` read. GraphQL, because `mergeStateStatus` is not in REST.
 */
export const listPullRequests = async (
  api: ApiContext,
): Promise<Result<readonly PullRequest[], string>> =>
  Result.map(
    await askRepositoryOf(
      api,
      [
        'query($owner: String!, $name: String!) {',
        '  repository(owner: $owner, name: $name) {',
        `    pullRequests(states: OPEN, first: ${OPEN_LIMIT}, orderBy: { field: CREATED_AT, direction: DESC }) {`,
        `      nodes { ${PULL_REQUEST_FIELDS} }`,
        '    }',
        '  }',
        '}',
      ].join('\n'),
      {},
      t.record({
        pullRequests: t.record({ nodes: t.array(PullRequestNodeSchema) }),
      }),
    ),
    ({ pullRequests }) => pullRequests.nodes.map(pullRequestOfNode),
  );

export const viewPullRequest = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<PullRequest, string>> =>
  Result.map(
    await askRepositoryOf(
      api,
      [
        'query($owner: String!, $name: String!, $number: Int!) {',
        '  repository(owner: $owner, name: $name) {',
        `    pullRequest(number: $number) { ${PULL_REQUEST_FIELDS} }`,
        '  }',
        '}',
      ].join('\n'),
      { number: prNumber },
      t.record({ pullRequest: PullRequestNodeSchema }),
    ),
    ({ pullRequest }) => pullRequestOfNode(pullRequest),
  );

/**
 * `REVIEW_REQUIRED`, `CHANGES_REQUESTED`, `APPROVED`, or empty when the
 * rules ask for no review. Read only when a green pull request will not
 * merge, to say what holds it.
 */
export const viewReviewDecision = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<string, string>> =>
  Result.map(
    await askRepositoryOf(
      api,
      [
        'query($owner: String!, $name: String!, $number: Int!) {',
        '  repository(owner: $owner, name: $name) {',
        '    pullRequest(number: $number) { reviewDecision }',
        '  }',
        '}',
      ].join('\n'),
      { number: prNumber },
      t.record({
        pullRequest: t.record({
          reviewDecision: t.union([t.string(), t.nullType]),
        }),
      }),
    ),
    ({ pullRequest }) => pullRequest.reviewDecision ?? '',
  );

/**
 * A pull request as GraphQL answers it, in the shape every module here reads
 * ({@link PullRequestSchema}): only the labels differ, a connection there and
 * a list here.
 */
export const pullRequestOfNode = (
  node: t.TypeOf<typeof PullRequestNodeSchema>,
): PullRequest =>
  ({
    ...node,
    labels: node.labels.nodes,
  }) as const;

/** How many open pull requests one survey reads, as many as `gh` did. */
const OPEN_LIMIT = 100;

/**
 * The fields of {@link PullRequestSchema}, read off it so that a field added
 * there is asked for here; `labels` and `autoMergeRequest` are objects, and
 * name what of them is read.
 */
const PULL_REQUEST_FIELDS = Object.keys(PullRequestSchema.shape)
  .map((key) =>
    key === 'labels'
      ? 'labels(first: 100) { nodes { name } }'
      : key === 'autoMergeRequest'
        ? 'autoMergeRequest { enabledAt }'
        : key,
  )
  .join(' ');

const PullRequestNodeSchema = t.record({
  ...PullRequestSchema.shape,
  labels: t.record({ nodes: PullRequestSchema.shape.labels }),
});

/**
 * The tip of `branch` on `origin`, by its whole ref name
 * (`headShaFromListing`): the default branch read as the version pull
 * request's branch is a set-aside recorded against a base that never moves.
 */
export const remoteSha = async (
  branch: string,
): Promise<Result<string, string>> => {
  const listed = await git(
    `git ls-remote origin ${sh(`refs/heads/${branch}`)}`,
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const sha = headShaFromListing(listed.value, branch);

  return sha === undefined
    ? Result.err(`origin has no branch named ${branch}`)
    : Result.ok(sha);
};

/**
 * What GitHub enforces on the branch, every ruleset that applies to it
 * together — rather than what `repo-settings/` declares, which changes
 * nothing until it is applied.
 */
export const readBranchRules = async (
  api: ApiContext,
  branch: string,
): Promise<Result<RulesetRequirements, string>> => {
  // One path segment, whatever the name holds: `release/1.x` included. The
  // rule's premise, building a query string, is not what this is.
  // eslint-disable-next-line no-restricted-globals
  const segment = encodeURIComponent(branch);

  return Result.map(
    await rest(api, 'GET', `/rules/branches/${segment}`, t.array(t.unknown())),
    requirementsOfRules,
  );
};

/**
 * `CODEOWNERS` on the default branch, and what `pr-report-core`'s
 * `review-hold.mts` reads about each of `numbers`, in one GraphQL request.
 * `undefined` for a repository without `.github/CODEOWNERS`, the one of the
 * three places GitHub looks that this repository uses.
 *
 * Every number goes in as a variable, and each pull request comes back under
 * its own alias.
 */
export const readReviewStates = async (
  api: ApiContext,
  numbers: readonly number[],
  defaultBranch: string,
): Promise<
  Result<
    Readonly<{
      codeOwners: string | undefined;
      states: ReadonlyMap<number, ReviewState>;
    }>,
    string
  >
> => {
  const query = [
    `query ReviewStates(${['$owner: String!', '$name: String!', '$codeOwners: String!', ...numbers.map((n) => `$pr_${n}: Int!`)].join(', ')}) {`,
    '  repository(owner: $owner, name: $name) {',
    '    codeOwners: object(expression: $codeOwners) { ... on Blob { text } }',
    ...numbers.map(
      (n) => `    pr_${n}: pullRequest(number: $pr_${n}) { ...ReviewState }`,
    ),
    '  }',
    '}',
    'fragment ReviewState on PullRequest {',
    '  author { login }',
    '  latestOpinionatedReviews(first: 20, writersOnly: true) { nodes { state author { login } } }',
    `  files(first: ${PAGE_SIZE}) { pageInfo { hasNextPage } nodes { path } }`,
    // A pull request with more conversations than one page is counted from
    // the first page. Undercounting only ever holds less, and holding less
    // is what happened before this was read at all.
    `  reviewThreads(first: ${PAGE_SIZE}) { nodes { isResolved } }`,
    '}',
  ].join('\n');

  const answered = await askRepositoryOf(
    api,
    query,
    {
      codeOwners: `${defaultBranch}:${CODE_OWNERS_PATH}`,
      ...Object.fromEntries(numbers.map((n) => [`pr_${n}`, n] as const)),
    },
    t.unknown(),
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const repository = answered.value;

  if (!isRecord(repository)) {
    return Result.err('GitHub answered without the repository');
  }

  const codeOwners = CodeOwnersBlobSchema.validate(repository['codeOwners']);

  const nodes = numbers.map(
    (n) => [n, ReviewStateNodeSchema.validate(repository[`pr_${n}`])] as const,
  );

  const invalid = Arr.generate(function* () {
    for (const [n, node] of nodes) {
      if (Result.isErr(node)) {
        yield `#${n}: ${t.validationErrorsToMessages(node.value).join('\n')}`;
      }
    }
  });

  if (Arr.isNonEmpty(invalid)) {
    return Result.err(invalid.join('\n'));
  }

  const states: ReadonlyMap<number, ReviewState> = new Map(
    Arr.generate(function* () {
      for (const [n, node] of nodes) {
        if (Result.isOk(node)) {
          yield [n, reviewStateOf(node.value)] as const;
        }
      }
    }),
  );

  return Result.ok({
    codeOwners:
      Result.isOk(codeOwners) && codeOwners.value !== null
        ? codeOwners.value.text
        : undefined,
    states,
  });
};

/**
 * What the issues the open pull requests close add to the merge order
 * (`merge-after.mts`'s `issueOrderOf`): one GraphQL request for what GitHub
 * links and how it marked the bodies, and one more for the keyword-closed
 * issues it did not link, only when there are any.
 */
export const readIssueOrder = async (
  api: ApiContext,
  numbers: readonly number[],
): Promise<Result<IssueOrder, string>> => {
  if (!Arr.isNonEmpty(numbers)) {
    return Result.ok({ closes: new Map(), startAfter: new Map() });
  }

  const pulls = await askRepository(
    api,
    'ClosingIssues',
    numbers.map((n) => ({
      alias: `pr_${n}`,
      number: n,
      field: `pullRequest(number: $pr_${n}) { bodyHTML closingIssuesReferences(first: 10) { nodes { ${CLOSING_ISSUE_FIELDS} repository { nameWithOwner } } } }`,
    })),
  );

  if (Result.isErr(pulls)) {
    return pulls;
  }

  const { repo, fields } = pulls.value;

  const own = `${repo.owner}/${repo.name}`.toLowerCase();

  const read = Arr.generate(function* () {
    for (const n of numbers) {
      const node = ClosingIssuesNodeSchema.validate(fields(`pr_${n}`));

      if (Result.isOk(node)) {
        yield {
          number: n,
          bodyHtml: node.value.bodyHTML,
          linked: node.value.closingIssuesReferences.nodes
            .filter(
              (issue) => issue.repository.nameWithOwner.toLowerCase() === own,
            )
            .map((issue) => closingIssueAnswer(own, issue)),
        };
      }
    }
  });

  const unlinked = unlinkedClosingIssues(repo, read);

  if (!Arr.isNonEmpty(unlinked)) {
    return Result.ok(issueOrderOf(repo, read, new Map()));
  }

  const issues = await askRepository(
    api,
    'UnlinkedIssues',
    unlinked.map((n) => ({
      alias: `issue_${n}`,
      number: n,
      field: `issue(number: $issue_${n}) { ${CLOSING_ISSUE_FIELDS} }`,
    })),
  );

  if (Result.isErr(issues)) {
    return issues;
  }

  const described = new Map(
    Arr.generate(function* () {
      for (const n of unlinked) {
        const node = ClosingIssueSchema.validate(
          issues.value.fields(`issue_${n}`),
        );

        if (Result.isOk(node)) {
          yield [n, closingIssueAnswer(own, node.value)] as const;
        }
      }
    }),
  );

  return Result.ok(issueOrderOf(repo, read, described));
};

/**
 * What an issue waits for is its `Start-After:` and the issues GitHub
 * records as blocking it, read as one (`pr-report-core`'s `waitsFor`).
 */
const CLOSING_ISSUE_FIELDS =
  'number state body blockedBy(first: 20) { nodes { number repository { nameWithOwner } } }';

const BlockedBySchema = t.record({
  nodes: t.array(
    t.record({
      number: t.number(),
      repository: t.record({ nameWithOwner: t.string() }),
    }),
  ),
});

const ClosingIssueSchema = t.record({
  number: t.number(),
  state: t.string(),
  body: t.string(),
  blockedBy: BlockedBySchema,
});

/** An issue as read, with only `own`'s issues among what blocks it. */
const closingIssueAnswer = (
  own: string,
  { number, state, body, blockedBy }: t.TypeOf<typeof ClosingIssueSchema>,
): ClosingIssueAnswer =>
  ({
    number,
    state,
    body,
    blockedBy: blockedBy.nodes
      .filter(
        ({ repository }) => repository.nameWithOwner.toLowerCase() === own,
      )
      .map((node) => node.number),
  }) as const;

const ClosingIssuesNodeSchema = t.record({
  bodyHTML: t.string(),
  closingIssuesReferences: t.record({
    nodes: t.array(
      t.record({
        number: t.number(),
        state: t.string(),
        body: t.string(),
        blockedBy: BlockedBySchema,
        repository: t.record({ nameWithOwner: t.string() }),
      }),
    ),
  }),
});

/**
 * One GraphQL request of aliased fields under the repository of the working
 * directory, each taking one number as `$<alias>`, with the repository's own
 * name read back so that a body's references can be told apart from another
 * repository's.
 */
const askRepository = async (
  api: ApiContext,
  operationName: string,
  parts: readonly Readonly<{ alias: string; number: number; field: string }>[],
): Promise<
  Result<
    Readonly<{
      repo: Readonly<{ owner: string; name: string }>;
      fields: (alias: string) => unknown;
    }>,
    string
  >
> => {
  const query = [
    `query ${operationName}(${['$owner: String!', '$name: String!', ...parts.map(({ alias }) => `$${alias}: Int!`)].join(', ')}) {`,
    '  repository(owner: $owner, name: $name) {',
    '    nameWithOwner',
    ...parts.map(({ alias, field }) => `    ${alias}: ${field}`),
    '  }',
    '}',
  ].join('\n');

  const answered = await askRepositoryOf(
    api,
    query,
    Object.fromEntries(
      parts.map(({ alias, number }) => [alias, number] as const),
    ),
    t.unknown(),
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const repository = answered.value;

  const nameWithOwner = isRecord(repository)
    ? repository['nameWithOwner']
    : undefined;

  const [owner, name] =
    typeof nameWithOwner === 'string'
      ? nameWithOwner.split('/')
      : ([] as const);

  if (owner === undefined || name === undefined || !isRecord(repository)) {
    return Result.err('GitHub answered without the repository');
  }

  return Result.ok({
    repo: { owner, name },
    fields: (alias) => repository[alias],
  });
};

/**
 * One GraphQL request whose `$owner` and `$name` are the repository's, to be
 * declared by `query`, resolving to what it answered under `repository`.
 */
const askRepositoryOf = async <A,>(
  api: ApiContext,
  query: string,
  variables: GraphqlVariables,
  schema: t.Type<A>,
): Promise<Result<A, string>> =>
  Result.map(
    await graphqlQuery(
      api,
      query,
      { owner: api.repo.owner, name: api.repo.name, ...variables },
      t.record({ repository: schema }),
    ),
    ({ repository }) => repository,
  );

const CODE_OWNERS_PATH = '.github/CODEOWNERS';

/** One page of a list inside a pull request. */
const PAGE_SIZE = 100;

const CodeOwnersBlobSchema = t.union([
  t.record({ text: t.string() }),
  t.nullType,
]);

const LoginSchema = t.union([t.record({ login: t.string() }), t.nullType]);

const ReviewStateNodeSchema = t.record({
  author: LoginSchema,
  latestOpinionatedReviews: t.record({
    nodes: t.array(t.record({ state: t.string(), author: LoginSchema })),
  }),
  files: t.record({
    pageInfo: t.record({ hasNextPage: t.boolean() }),
    nodes: t.array(t.record({ path: t.string() })),
  }),
  reviewThreads: t.record({
    nodes: t.array(t.record({ isResolved: t.boolean() })),
  }),
});

const reviewStateOf = (
  node: t.TypeOf<typeof ReviewStateNodeSchema>,
): ReviewState =>
  ({
    author: node.author?.login ?? '',
    approvers: Arr.generate(function* () {
      for (const { state, author } of node.latestOpinionatedReviews.nodes) {
        if (state === 'APPROVED' && author !== null) {
          yield author.login;
        }
      }
    }),
    files: node.files.nodes.map(({ path }) => path),
    filesComplete: !node.files.pageInfo.hasNextPage,
    unresolvedConversations: node.reviewThreads.nodes.filter(
      ({ isResolved }) => !isResolved,
    ).length,
  }) as const;

export const addSkipCiLabel = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<undefined, string>> => addLabel(api, prNumber, SKIP_CI_LABEL);

/**
 * This account's set-aside comment on each of `numbers` that has one. See
 * {@link readOwnComments}.
 */
export const readSetAsideComments = async (
  api: ApiContext,
  numbers: readonly number[],
): Promise<Result<ReadonlyMap<number, OwnSetAsideComment>, string>> =>
  Result.map(await readOwnComments(api, numbers), ({ setAside }) => setAside);

/**
 * This account's set-aside comment, and the standing claim a session wrote
 * (`claims.mts`), on each of `numbers` that has one, in one GraphQL request:
 * every number goes in as a variable and each pull request comes back under
 * its own alias. `pr-report-core`'s `set-aside.mts` says why only
 * `viewerDidAuthor` counts; of several of a kind, the oldest is the one.
 */
export const readOwnComments = async (
  api: ApiContext,
  numbers: readonly number[],
): Promise<
  Result<
    Readonly<{
      setAside: ReadonlyMap<number, OwnSetAsideComment>;
      claims: ReadonlyMap<number, Claim>;
    }>,
    string
  >
> => {
  if (!Arr.isNonEmpty(numbers)) {
    return Result.ok({ setAside: new Map(), claims: new Map() });
  }

  const query = [
    `query SetAsideComments(${['$owner: String!', '$name: String!', ...numbers.map((n) => `$pr_${n}: Int!`)].join(', ')}) {`,
    '  repository(owner: $owner, name: $name) {',
    ...numbers.map(
      (n) =>
        `    pr_${n}: pullRequest(number: $pr_${n}) { comments(last: ${SET_ASIDE_COMMENT_SCAN}) { nodes { databaseId body viewerDidAuthor } } }`,
    ),
    '  }',
    '}',
  ].join('\n');

  const answered = await askRepositoryOf(
    api,
    query,
    Object.fromEntries(numbers.map((n) => [`pr_${n}`, n] as const)),
    t.unknown(),
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const repository = answered.value;

  if (!isRecord(repository)) {
    return Result.err('GitHub answered without the repository');
  }

  const nodes = numbers.map(
    (n) => [n, CommentsNodeSchema.validate(repository[`pr_${n}`])] as const,
  );

  const invalid = Arr.generate(function* () {
    for (const [n, node] of nodes) {
      if (Result.isErr(node)) {
        yield `#${n}: ${t.validationErrorsToMessages(node.value).join('\n')}`;
      }
    }
  });

  if (Arr.isNonEmpty(invalid)) {
    return Result.err(invalid.join('\n'));
  }

  const own = Arr.generate(function* () {
    for (const [n, node] of nodes) {
      if (Result.isOk(node)) {
        yield [
          n,
          node.value.comments.nodes.filter(
            ({ viewerDidAuthor }) => viewerDidAuthor,
          ),
        ] as const;
      }
    }
  });

  return Result.ok({
    setAside: new Map(
      Arr.generate(function* () {
        for (const [n, comments] of own) {
          const found = ownSetAsideComment(comments);

          if (found !== undefined) {
            yield [n, found] as const;
          }
        }
      }),
    ),
    claims: new Map(
      Arr.generate(function* () {
        for (const [n, comments] of own) {
          const says = Arr.generate(function* () {
            for (const { body } of comments) {
              const claim = parseClaimComment(body);

              if (claim !== undefined) {
                yield claim;
              }
            }
          }).at(0);

          if (says?.kind === 'standing') {
            yield [n, says.claim] as const;
          }
        }
      }),
    ),
  });
};

const ownSetAsideComment = (
  comments: readonly t.TypeOf<typeof CommentSchema>[],
): OwnSetAsideComment | undefined =>
  Arr.generate(function* () {
    for (const { databaseId, body } of comments) {
      const says = parseSetAsideComment(body);

      if (databaseId !== null && says !== undefined) {
        yield { databaseId, says };
      }
    }
  }).at(0);

const CommentSchema = t.record({
  databaseId: t.union([t.number(), t.nullType]),
  body: t.string(),
  viewerDidAuthor: t.boolean(),
});

const CommentsNodeSchema = t.record({
  comments: t.record({ nodes: t.array(CommentSchema) }),
});

/**
 * Writes `body` as the pull request's set-aside comment: over `existing`,
 * this account's own, when there is one — a pull request has one, edited in
 * place — and as a new comment otherwise.
 */
export const writeSetAsideCommentOn = async (
  api: ApiContext,
  prNumber: number,
  existing: number | undefined,
  body: string,
): Promise<Result<undefined, string>> =>
  Result.map(
    await rest(
      api,
      existing === undefined ? 'POST' : 'PATCH',
      existing === undefined
        ? `/issues/${prNumber}/comments`
        : `/issues/comments/${existing}`,
      t.unknown(),
      { body: { body } },
    ),
    () => undefined,
  );

/**
 * Every change of the pull request's base its timeline records, oldest
 * first; `stack.mts` reads which branch GitHub moved it off.
 *
 * GraphQL, because the REST timeline does not say which branches a change of
 * base was between.
 */
export const readBaseChanges = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<readonly BaseChange[], string>> =>
  Result.map(
    await askRepositoryOf(
      api,
      TIMELINE_QUERY,
      { number: prNumber },
      TimelineSchema,
    ),
    ({ pullRequest }) =>
      pullRequest.timelineItems.nodes.map(
        (node) =>
          ({
            from: node.previousRefName ?? '',
            to: node.currentRefName ?? '',
          }) as const,
      ),
  );

const TIMELINE_QUERY = [
  'query($owner: String!, $name: String!, $number: Int!) {',
  '  repository(owner: $owner, name: $name) {',
  '    pullRequest(number: $number) {',
  '      timelineItems(last: 100, itemTypes: [BASE_REF_CHANGED_EVENT]) {',
  '        nodes {',
  '          ... on BaseRefChangedEvent { previousRefName currentRefName }',
  '        }',
  '      }',
  '    }',
  '  }',
  '}',
].join(' ');

const TimelineNodeSchema = t.record({
  previousRefName: t.optional(t.union([t.string(), t.nullType])),
  currentRefName: t.optional(t.union([t.string(), t.nullType])),
});

const TimelineSchema = t.record({
  pullRequest: t.record({
    timelineItems: t.record({
      nodes: t.array(TimelineNodeSchema),
    }),
  }),
});

/**
 * The pull request's place in one of GitHub's native stacks, or `undefined`
 * when it is in none. GraphQL, because REST does not know them.
 */
export const readNativeStack = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<NativeStackEntry | undefined, string>> =>
  Result.map(
    await askRepositoryOf(
      api,
      NATIVE_STACK_QUERY,
      { number: prNumber },
      NativeStackSchema,
    ),
    ({ pullRequest: { stackEntry } }) =>
      stackEntry === null
        ? undefined
        : {
            stack: stackEntry.stack.number,
            position: stackEntry.position,
            size: stackEntry.stack.size,
          },
  );

const NATIVE_STACK_QUERY = [
  'query($owner: String!, $name: String!, $number: Int!) {',
  '  repository(owner: $owner, name: $name) {',
  '    pullRequest(number: $number) {',
  '      stackEntry { position stack { number size } }',
  '    }',
  '  }',
  '}',
].join(' ');

const NativeStackSchema = t.record({
  pullRequest: t.record({
    stackEntry: t.union([
      t.record({
        position: t.number(),
        stack: t.record({ number: t.number(), size: t.number() }),
      }),
      t.nullType,
    ]),
  }),
});

/**
 * The head the last merged pull request from `branch` was merged at, and the
 * commit its merge made, or `undefined` when none was — the layer a
 * retargeted pull request was stacked on, whose commits it may still carry.
 */
export const mergedHeadOf = async (
  api: ApiContext,
  branch: string,
): Promise<Result<MergedHead | undefined, string>> =>
  Result.map(
    await rest(api, 'GET', '/pulls', t.array(MergedPullSchema), {
      query: {
        state: 'closed',
        head: `${api.repo.owner}:${branch}`,
        sort: 'updated',
        direction: 'desc',
        per_page: '5',
      },
    }),
    latestMergedHead,
  );

/**
 * The last merged of `pulls`, closed pull requests from one branch, or
 * `undefined` when none of them merged.
 */
export const latestMergedHead = (
  pulls: readonly t.TypeOf<typeof MergedPullSchema>[],
): MergedHead | undefined => {
  const [latest] = pulls
    .filter(
      (pull): pull is typeof pull & Readonly<{ merged_at: string }> =>
        pull.merged_at !== null,
    )
    .toSorted((a, b) => b.merged_at.localeCompare(a.merged_at));

  return latest === undefined
    ? undefined
    : {
        number: latest.number,
        headSha: latest.head.sha,
        mergeCommit: latest.merge_commit_sha ?? undefined,
      };
};

export type MergedHead = Readonly<{
  number: number;
  headSha: string;
  /** The squash commit on the base; GitHub may not have it for a moment. */
  mergeCommit: string | undefined;
}>;

const MergedPullSchema = t.record({
  number: t.number(),
  head: t.record({ sha: t.string() }),
  merge_commit_sha: t.union([t.string(), t.nullType]),
  merged_at: t.union([t.string(), t.nullType]),
});

/**
 * Arms auto-merge, squash being the one method the ruleset allows. The
 * mutation refuses when nothing holds the pull request, where
 * `gh pr merge --auto` would merge it on the spot.
 */
export const armAutoMerge = async (
  api: ApiContext,
  nodeId: string,
): Promise<Result<undefined, string>> =>
  graphql(api, ARM_MUTATION, { id: nodeId });

const ARM_MUTATION =
  'mutation($id: ID!) { enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: SQUASH }) { clientMutationId } }';

/**
 * Every check run GitHub Actions reported on one commit, every job of every
 * workflow rather than only the required aggregates, so that a failure can
 * be traced to the matrix entry under the aggregate. Other apps' runs — the
 * codecov ones — are left out: nothing here can act on them, and none is
 * required.
 */
export const listCheckRuns = async (
  api: ApiContext,
  headSha: string,
): Promise<Result<readonly CheckRunReport[], string>> => {
  if (!SHA.test(headSha)) {
    return Result.err(`unexpected head SHA: ${JSON.stringify(headSha)}`);
  }

  const mut_collected: CheckRunReport[] = [];

  for (const page of Arr.seq(MAX_CHECK_RUN_PAGES)) {
    const answered = await rest(
      api,
      'GET',
      `/commits/${headSha}/check-runs`,
      CheckRunPageSchema,
      {
        query: { per_page: PAGE_SIZE.toString(), page: (page + 1).toString() },
      },
    );

    if (Result.isErr(answered)) {
      return answered;
    }

    for (const run of answered.value.check_runs) {
      if (run.app?.slug === 'github-actions') {
        mut_collected.push({
          id: run.id,
          checkSuiteId: run.check_suite.id,
          name: run.name,
          status: run.status,
          conclusion: run.conclusion ?? undefined,
          // Not read: a fix is planned once the checks have failed, not
          // while a newer round is running.
          round: undefined,
        });
      }
    }

    if (
      Arr.isEmpty(answered.value.check_runs) ||
      (page + 1) * PAGE_SIZE >= answered.value.total_count
    ) {
      return Result.ok(mut_collected);
    }
  }

  return Result.err(
    `${headSha} has more than ${PAGE_SIZE * MAX_CHECK_RUN_PAGES} check runs, which is more than this reads`,
  );
};

const MAX_CHECK_RUN_PAGES = 10;

const CheckRunPageSchema = t.record({
  total_count: t.number(),
  check_runs: t.array(
    t.record({
      id: t.number(),
      check_suite: t.record({ id: t.number() }),
      app: t.union([t.record({ slug: t.string() }), t.nullType]),
      name: t.string(),
      status: t.string(),
      conclusion: t.union([t.string(), t.nullType]),
    }),
  ),
});

export const removeWorktree = async (worktreeDir: string): Promise<void> => {
  // Both fail harmlessly when there is nothing to remove.
  await git(`git worktree remove --force ${sh(worktreeDir)}`);

  await git('git worktree prune');
};

const SHA = /^[0-9a-f]{40}$/u;

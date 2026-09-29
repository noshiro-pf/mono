// cspell:ignore retarget retargeted

/**
 * Everything that shells out to `gh` or `git`, and nothing that decides.
 * `git` is also what `auto-fix.mts` runs its `pnpm` commands through.
 */

import {
  MERGE_QUEUED_LABEL,
  parseSetAsideComment,
  requirementsOfRules,
  SET_ASIDE_COMMENT_SCAN,
  SKIP_CI_LABEL,
  type CheckRunReport,
  type RulesetRequirements,
} from 'pr-report-core';
import { Arr, isRecord, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { $ } from 'ts-repo-utils';
import { projectRootPath } from '../../project-root-path.mjs';
import { type ReviewState } from './review.mjs';
import {
  PullRequestListSchema,
  PullRequestSchema,
  type NativeStackEntry,
  type OwnSetAsideComment,
  type PullRequest,
  type TimelineEvent,
} from './types.mjs';
import { isSafeRefName, sh } from './util.mjs';

const PR_JSON_FIELDS =
  'number,id,title,body,state,headRefName,headRefOid,baseRefName,isCrossRepository,isDraft,mergeStateStatus,autoMergeRequest,labels';

/**
 * Passed to every git and gh invocation. `GIT_TERMINAL_PROMPT=0` turns a
 * missing credential into a failure instead of a hang; `GIT_EDITOR=true`
 * keeps any editor git might want out of the way.
 */
const childEnv: NodeJS.ProcessEnv = {
  ...process.env,
  GIT_TERMINAL_PROMPT: '0',
  GIT_EDITOR: 'true',
} as const;

export const checkPreflight = async (): Promise<
  Result<Readonly<{ defaultBranch: string }>, string>
> => {
  const auth = await git('gh auth status');

  if (Result.isErr(auth)) {
    return Result.err(`gh is not authenticated:\n${auth.value}`);
  }

  const defaultBranch = await git(
    'gh repo view --json defaultBranchRef --jq .defaultBranchRef.name',
  );

  if (Result.isErr(defaultBranch)) {
    return Result.err(`cannot read the default branch: ${defaultBranch.value}`);
  }

  const name = defaultBranch.value.trim();

  if (!isSafeRefName(name)) {
    return Result.err(
      `unexpected default branch name: ${JSON.stringify(name)}`,
    );
  }

  return Result.ok({ defaultBranch: name });
};

export const listPullRequests = async (): Promise<
  Result<readonly PullRequest[], string>
> => {
  const listed = await git(
    `gh pr list --state open --limit 100 --json ${PR_JSON_FIELDS}`,
  );

  return Result.isErr(listed)
    ? listed
    : parseJson(listed.value, PullRequestListSchema);
};

export const viewPullRequest = async (
  prNumber: number,
): Promise<Result<PullRequest, string>> => {
  const viewed = await git(`gh pr view ${prNumber} --json ${PR_JSON_FIELDS}`);

  return Result.isErr(viewed)
    ? viewed
    : parseJson(viewed.value, PullRequestSchema);
};

/**
 * `REVIEW_REQUIRED`, `CHANGES_REQUESTED`, `APPROVED`, or empty when the
 * rules ask for no review. Read only when a green pull request will not
 * merge, to say what holds it.
 */
export const viewReviewDecision = async (
  prNumber: number,
): Promise<Result<string, string>> => {
  const viewed = await git(
    `gh pr view ${prNumber} --json reviewDecision --jq .reviewDecision`,
  );

  return Result.isErr(viewed) ? viewed : Result.ok(viewed.value.trim());
};

export const remoteSha = async (
  branch: string,
): Promise<Result<string, string>> => {
  const listed = await git(`git ls-remote --heads origin ${sh(branch)}`);

  if (Result.isErr(listed)) {
    return listed;
  }

  const sha = listed.value.trim().split(/\s+/u, 1)[0];

  return sha === undefined || sha === ''
    ? Result.err(`origin has no branch named ${branch}`)
    : Result.ok(sha);
};

/**
 * What GitHub enforces on the branch, every ruleset that applies to it
 * together — rather than what `repo-settings/` declares, which changes
 * nothing until it is applied.
 */
export const readBranchRules = async (
  branch: string,
): Promise<Result<RulesetRequirements, string>> => {
  const listed = await git(
    [
      'gh api',
      // Joined rather than interpolated: `gh` fills the `{owner}` and
      // `{repo}` placeholders in, and a template literal holding them is
      // indistinguishable from a mistyped one to `unicorn`.
      sh(['repos', '{owner}', '{repo}', 'rules', 'branches', branch].join('/')),
    ].join(' '),
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const rules = parseJson(listed.value, t.array(t.unknown()));

  return Result.isErr(rules)
    ? rules
    : Result.ok(requirementsOfRules(rules.value));
};

/**
 * `CODEOWNERS` on the default branch, and what `review.mts` reads about each
 * of `numbers`, in one GraphQL request. `undefined` for a repository without
 * `.github/CODEOWNERS` — the one place the Pull Requests Manager reads it
 * from too.
 *
 * Every number goes in as a variable, and each pull request comes back under
 * its own alias.
 */
export const readReviewStates = async (
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

  const answered = await git(
    [
      'gh api graphql',
      `-f ${sh(`query=${query}`)}`,
      // `-F` fills `{owner}` and `{repo}` in, as `gh api` does in a path,
      // and sends a number as a number.
      `-F ${sh('owner={owner}')}`,
      `-F ${sh('name={repo}')}`,
      `-f ${sh(`codeOwners=${defaultBranch}:${CODE_OWNERS_PATH}`)}`,
      ...numbers.map((n) => `-F ${sh(`pr_${n}=${n}`)}`),
    ].join(' '),
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const parsed = parseJson(answered.value, RepositoryAnswerSchema);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  const { repository } = parsed.value.data;

  if (!isRecord(repository)) {
    return Result.err('GitHub answered without the repository');
  }

  const codeOwners = CodeOwnersBlobSchema.validate(repository['codeOwners']);

  const nodes = numbers.map(
    (n) => [n, ReviewStateNodeSchema.validate(repository[`pr_${n}`])] as const,
  );

  const invalid = nodes.flatMap(([n, node]) =>
    Result.isErr(node)
      ? [`#${n}: ${t.validationErrorsToMessages(node.value).join('\n')}`]
      : [],
  );

  if (Arr.isNonEmpty(invalid)) {
    return Result.err(invalid.join('\n'));
  }

  const states: ReadonlyMap<number, ReviewState> = new Map(
    nodes.flatMap(([n, node]) =>
      Result.isOk(node) ? [[n, reviewStateOf(node.value)] as const] : [],
    ),
  );

  return Result.ok({
    codeOwners:
      Result.isOk(codeOwners) && codeOwners.value !== null
        ? codeOwners.value.text
        : undefined,
    states,
  });
};

const CODE_OWNERS_PATH = '.github/CODEOWNERS';

/** One page of a list inside a pull request. */
const PAGE_SIZE = 100;

const RepositoryAnswerSchema = t.record({
  data: t.record({
    repository: t.unknown(),
  }),
});

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
    approvers: node.latestOpinionatedReviews.nodes.flatMap(
      ({ state, author }) =>
        state === 'APPROVED' && author !== null ? [author.login] : [],
    ),
    files: node.files.nodes.map(({ path }) => path),
    filesComplete: !node.files.pageInfo.hasNextPage,
    unresolvedConversations: node.reviewThreads.nodes.filter(
      ({ isResolved }) => !isResolved,
    ).length,
  }) as const;

export const addSkipCiLabel = async (
  prNumber: number,
): Promise<Result<undefined, string>> => {
  const added = await git(
    `gh pr edit ${prNumber} --add-label ${sh(SKIP_CI_LABEL)}`,
  );

  return Result.isErr(added) ? added : Result.ok(undefined);
};

/**
 * This account's set-aside comment on each of `numbers` that has one, in one
 * GraphQL request: every number goes in as a variable and each pull request
 * comes back under its own alias. `pr-report-core`'s `set-aside.mts` says
 * why only `viewerDidAuthor` counts; of several, the oldest is the one.
 */
export const readSetAsideComments = async (
  numbers: readonly number[],
): Promise<Result<ReadonlyMap<number, OwnSetAsideComment>, string>> => {
  if (!Arr.isNonEmpty(numbers)) {
    return Result.ok(new Map());
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

  const answered = await git(
    [
      'gh api graphql',
      `-f ${sh(`query=${query}`)}`,
      `-F ${sh('owner={owner}')}`,
      `-F ${sh('name={repo}')}`,
      ...numbers.map((n) => `-F ${sh(`pr_${n}=${n}`)}`),
    ].join(' '),
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const parsed = parseJson(answered.value, RepositoryAnswerSchema);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  const { repository } = parsed.value.data;

  if (!isRecord(repository)) {
    return Result.err('GitHub answered without the repository');
  }

  const nodes = numbers.map(
    (n) => [n, CommentsNodeSchema.validate(repository[`pr_${n}`])] as const,
  );

  const invalid = nodes.flatMap(([n, node]) =>
    Result.isErr(node)
      ? [`#${n}: ${t.validationErrorsToMessages(node.value).join('\n')}`]
      : [],
  );

  if (Arr.isNonEmpty(invalid)) {
    return Result.err(invalid.join('\n'));
  }

  return Result.ok(
    new Map(
      nodes.flatMap(([n, node]) => {
        const own = Result.isOk(node)
          ? ownSetAsideComment(node.value.comments.nodes)
          : undefined;

        return own === undefined ? [] : [[n, own] as const];
      }),
    ),
  );
};

const ownSetAsideComment = (
  comments: readonly t.TypeOf<typeof CommentSchema>[],
): OwnSetAsideComment | undefined =>
  comments
    .filter(({ viewerDidAuthor }) => viewerDidAuthor)
    .flatMap(({ databaseId, body }) => {
      const says = parseSetAsideComment(body);

      return databaseId === null || says === undefined
        ? []
        : [{ databaseId, says }];
    })
    .at(0);

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
  prNumber: number,
  existing: number | undefined,
  body: string,
): Promise<Result<undefined, string>> => {
  const written = await git(
    [
      existing === undefined ? 'gh api --method POST' : 'gh api --method PATCH',
      // `{owner}` and `{repo}` are `gh api`'s placeholders for the
      // repository of the working directory, not interpolations.
      sh(
        existing === undefined
          ? [ISSUES_ROUTE, prNumber, 'comments'].join('/')
          : [ISSUES_ROUTE, 'comments', existing].join('/'),
      ),
      `-f ${sh(`body=${body}`)}`,
    ].join(' '),
  );

  return Result.isErr(written) ? written : Result.ok(undefined);
};

/**
 * What the pull request's timeline says about its base, its auto-merge and
 * its being queued, oldest first: `stack.mts` reads which branch GitHub moved
 * it off, and `auto-merge.mts` whether a person disarmed it since it was
 * queued.
 *
 * GraphQL, because the REST timeline does not say which branches a change of
 * base was between. Enabling auto-merge is three event types, one per merge
 * method; a label other than `merge-queued` is dropped.
 */
export const readTimeline = async (
  prNumber: number,
): Promise<Result<readonly TimelineEvent[], string>> => {
  const answered = await git(
    [
      'gh api graphql',
      // `gh` fills these two placeholders in from the working directory's
      // repository.
      `-F ${sh('owner={owner}')}`,
      `-F ${sh('repo={repo}')}`,
      `-F number=${prNumber}`,
      `-f ${sh(`query=${TIMELINE_QUERY}`)}`,
    ].join(' '),
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const parsed = parseJson(answered.value, TimelineSchema);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  return Result.ok(
    parsed.value.data.repository.pullRequest.timelineItems.nodes.flatMap(
      toTimelineEvents,
    ),
  );
};

const toTimelineEvents = (
  node: t.TypeOf<typeof TimelineNodeSchema>,
): readonly TimelineEvent[] => {
  switch (node.__typename) {
    case 'BaseRefChangedEvent':
      return [
        {
          kind: 'base-changed',
          from: node.previousRefName ?? '',
          to: node.currentRefName ?? '',
        },
      ];

    case 'AutoMergeDisabledEvent':
      return [
        {
          kind: 'auto-merge-disabled',
          manually: node.reasonCode === 'manually_disabled',
        },
      ];

    case 'LabeledEvent':
      return node.label?.name === MERGE_QUEUED_LABEL
        ? [{ kind: 'queued' }]
        : [];

    default:
      return [{ kind: 'auto-merge-enabled' }];
  }
};

const TIMELINE_QUERY = [
  'query($owner: String!, $repo: String!, $number: Int!) {',
  '  repository(owner: $owner, name: $repo) {',
  '    pullRequest(number: $number) {',
  '      timelineItems(last: 100, itemTypes: [BASE_REF_CHANGED_EVENT, AUTO_MERGE_ENABLED_EVENT, AUTO_SQUASH_ENABLED_EVENT, AUTO_REBASE_ENABLED_EVENT, AUTO_MERGE_DISABLED_EVENT, LABELED_EVENT]) {',
  '        nodes {',
  '          __typename',
  '          ... on BaseRefChangedEvent { previousRefName currentRefName }',
  '          ... on AutoMergeDisabledEvent { reasonCode }',
  '          ... on LabeledEvent { label { name } }',
  '        }',
  '      }',
  '    }',
  '  }',
  '}',
].join(' ');

const TimelineNodeSchema = t.record({
  __typename: t.string(),
  previousRefName: t.optional(t.union([t.string(), t.nullType])),
  currentRefName: t.optional(t.union([t.string(), t.nullType])),
  reasonCode: t.optional(t.union([t.string(), t.nullType])),
  label: t.optional(t.union([t.record({ name: t.string() }), t.nullType])),
});

const TimelineSchema = t.record({
  data: t.record({
    repository: t.record({
      pullRequest: t.record({
        timelineItems: t.record({
          nodes: t.array(TimelineNodeSchema),
        }),
      }),
    }),
  }),
});

/**
 * The pull request's place in one of GitHub's native stacks, or `undefined`
 * when it is in none. GraphQL, because `gh pr view` does not know them.
 */
export const readNativeStack = async (
  prNumber: number,
): Promise<Result<NativeStackEntry | undefined, string>> => {
  const answered = await git(
    [
      'gh api graphql',
      `-F ${sh('owner={owner}')}`,
      `-F ${sh('repo={repo}')}`,
      `-F number=${prNumber}`,
      `-f ${sh(`query=${NATIVE_STACK_QUERY}`)}`,
    ].join(' '),
  );

  if (Result.isErr(answered)) {
    return answered;
  }

  const parsed = parseJson(answered.value, NativeStackSchema);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  const entry = parsed.value.data.repository.pullRequest.stackEntry;

  return Result.ok(
    entry === null
      ? undefined
      : {
          stack: entry.stack.number,
          position: entry.position,
          size: entry.stack.size,
        },
  );
};

const NATIVE_STACK_QUERY = [
  'query($owner: String!, $repo: String!, $number: Int!) {',
  '  repository(owner: $owner, name: $repo) {',
  '    pullRequest(number: $number) {',
  '      stackEntry { position stack { number size } }',
  '    }',
  '  }',
  '}',
].join(' ');

const NativeStackSchema = t.record({
  data: t.record({
    repository: t.record({
      pullRequest: t.record({
        stackEntry: t.union([
          t.record({
            position: t.number(),
            stack: t.record({ number: t.number(), size: t.number() }),
          }),
          t.nullType,
        ]),
      }),
    }),
  }),
});

/**
 * The head the last merged pull request from `branch` was merged at, and the
 * commit its merge made, or `undefined` when none was — the layer a
 * retargeted pull request was stacked on, whose commits it may still carry.
 */
export const mergedHeadOf = async (
  branch: string,
): Promise<Result<MergedHead | undefined, string>> => {
  const listed = await git(
    `gh pr list --state merged --head ${sh(branch)} --limit 5 --json number,headRefOid,mergeCommit,mergedAt`,
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const parsed = parseJson(listed.value, MergedHeadListSchema);

  if (Result.isErr(parsed)) {
    return parsed;
  }

  const [latest] = parsed.value.toSorted((a, b) =>
    b.mergedAt.localeCompare(a.mergedAt),
  );

  return Result.ok(
    latest === undefined
      ? undefined
      : {
          number: latest.number,
          headSha: latest.headRefOid,
          mergeCommit: latest.mergeCommit?.oid,
        },
  );
};

export type MergedHead = Readonly<{
  number: number;
  headSha: string;
  /** The squash commit on the base; GitHub may not have it for a moment. */
  mergeCommit: string | undefined;
}>;

const MergedHeadListSchema = t.array(
  t.record({
    number: t.number(),
    headRefOid: t.string(),
    mergeCommit: t.union([t.record({ oid: t.string() }), t.nullType]),
    mergedAt: t.string(),
  }),
);

/**
 * Arms auto-merge, squash being the one method the ruleset allows. The
 * mutation rather than `gh pr merge --auto`, which merges on the spot when
 * nothing holds the pull request; this one refuses instead.
 */
export const armAutoMerge = async (
  nodeId: string,
): Promise<Result<undefined, string>> => {
  const armed = await git(
    [
      'gh api graphql',
      `-f ${sh(`id=${nodeId}`)}`,
      `-f ${sh(`query=${ARM_MUTATION}`)}`,
    ].join(' '),
  );

  return Result.isErr(armed) ? armed : Result.ok(undefined);
};

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
  headSha: string,
): Promise<Result<readonly CheckRunReport[], string>> => {
  if (!SHA.test(headSha)) {
    return Result.err(`unexpected head SHA: ${JSON.stringify(headSha)}`);
  }

  const listed = await git(
    [
      'gh api --paginate --slurp',
      // `gh api`'s placeholders again, as in `writeSetAsideCommentOn`.
      sh([COMMITS_ROUTE, headSha, 'check-runs?per_page=100'].join('/')),
    ].join(' '),
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const pages = parseJson(listed.value, CheckRunPagesSchema);

  return Result.isErr(pages)
    ? pages
    : Result.ok(
        pages.value
          .flatMap((page) => page.check_runs)
          .filter((run) => run.app?.slug === 'github-actions')
          .map((run) => ({
            id: run.id,
            checkSuiteId: run.check_suite.id,
            name: run.name,
            status: run.status,
            conclusion: run.conclusion ?? undefined,
          })),
      );
};

const CheckRunPagesSchema = t.array(
  t.record({
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
  }),
);

export const removeWorktree = async (worktreeDir: string): Promise<void> => {
  // Both fail harmlessly when there is nothing to remove.
  await git(`git worktree remove --force ${sh(worktreeDir)}`);

  await git('git worktree prune');
};

const SHA = /^[0-9a-f]{40}$/u;

const ISSUES_ROUTE = 'repos/{owner}/{repo}/issues';

const COMMITS_ROUTE = 'repos/{owner}/{repo}/commits';

/**
 * Runs a git or gh command silently and resolves to its stdout, or to a
 * message that includes what it printed to stderr.
 */
export const git = async (
  command: string,
  cwd: string = projectRootPath,
): Promise<Result<string, string>> => {
  const result = await $(command, {
    cwd,
    silent: true,
    env: childEnv,
    maxBuffer: 64 * 1024 * 1024,
  });

  return Result.isOk(result)
    ? Result.ok(result.value.stdout)
    : Result.err(result.value.message.trim());
};

export const parseJson = <A,>(
  text: string,
  schema: t.Type<A>,
): Result<A, string> => {
  const parsed = Json.parse(text);

  if (Result.isErr(parsed)) {
    return Result.err(`invalid JSON: ${parsed.value}`);
  }

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(t.validationErrorsToMessages(validated.value).join('\n'))
    : Result.ok(validated.value);
};

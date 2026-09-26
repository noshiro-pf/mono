/**
 * Everything that shells out to `gh` or `git`, and nothing that decides.
 * `git` is also what `auto-fix.mts` runs its `pnpm` commands through.
 */

import {
  describeSetAside,
  requirementsOfRules,
  SET_ASIDE_CONTEXT,
  SKIP_CI_LABEL,
  type CheckRunReport,
  type RulesetRequirements,
  type SetAside,
} from 'pr-report-core';
import { Arr, isRecord, Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { $ } from 'ts-repo-utils';
import { projectRootPath } from '../../project-root-path.mjs';
import { type ReviewState } from './review.mjs';
import {
  PullRequestListSchema,
  PullRequestSchema,
  type PullRequest,
} from './types.mjs';
import { isSafeRefName, sh } from './util.mjs';

const PR_JSON_FIELDS =
  'number,title,body,state,headRefName,headRefOid,baseRefName,isDraft,mergeStateStatus,autoMergeRequest,labels';

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

  const parsed = parseJson(answered.value, ReviewStatesAnswerSchema);

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

const ReviewStatesAnswerSchema = t.record({
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
 * Leaves a `failure` commit status on the head a pull request was set aside
 * at, saying why and against which base. `pr-report-core`'s `set-aside.mts`
 * says what reads it and why it is a status rather than a label or a
 * comment.
 */
export const postSetAsideStatus = async (
  headSha: string,
  setAside: SetAside,
): Promise<Result<undefined, string>> => {
  if (!SHA.test(headSha)) {
    return Result.err(`unexpected head SHA: ${JSON.stringify(headSha)}`);
  }

  const posted = await git(
    [
      'gh api --method POST',
      // `{owner}` and `{repo}` are `gh api`'s placeholders for the
      // repository of the working directory, not interpolations.
      sh([STATUSES_ROUTE, headSha].join('/')),
      '-f state=failure',
      `-f ${sh(`context=${SET_ASIDE_CONTEXT}`)}`,
      `-f ${sh(`description=${describeSetAside(setAside)}`)}`,
    ].join(' '),
  );

  return Result.isErr(posted) ? posted : Result.ok(undefined);
};

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
      // `gh api`'s placeholders again, as in `postSetAsideStatus`.
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

const STATUSES_ROUTE = 'repos/{owner}/{repo}/statuses';

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

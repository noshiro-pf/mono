/** Everything that talks to GitHub or to `git`, and nothing that decides. */

import dedent from 'dedent';
import { Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { git } from '../unblock-prs/github.mjs';
import { isSafeRefName, sh } from '../unblock-prs/util.mjs';
import {
  graphql,
  resolveRepo,
  resolveToken,
  rest,
  type ApiContext,
} from './api.mjs';
import {
  PullRequestListResponseSchema,
  PullRequestResponseSchema,
  toPullRequest,
  type PullRequest,
} from './types.mjs';

/**
 * There is a credential and a repository to use it on, and the branch about
 * to be pushed is not the branch everything targets.
 */
export const preflight = async (): Promise<
  Result<
    Readonly<{ api: ApiContext; branch: string; defaultBranch: string }>,
    string
  >
> => {
  const token = await resolveToken();

  if (Result.isErr(token)) return token;

  const repo = await resolveRepo();

  if (Result.isErr(repo)) return repo;

  const api: ApiContext = { repo: repo.value, token: token.value } as const;

  const branch = await readRefName('git rev-parse --abbrev-ref HEAD');

  if (Result.isErr(branch)) return branch;

  if (branch.value === 'HEAD') {
    return Result.err('HEAD is detached; check a branch out first');
  }

  const repository = await rest(
    api,
    'GET',
    '',
    t.record({ default_branch: t.string() }),
  );

  if (Result.isErr(repository)) {
    return Result.err(`cannot read the repository: ${repository.value}`);
  }

  const defaultBranch = repository.value.default_branch;

  if (branch.value === defaultBranch) {
    return Result.err(
      `the current branch is ${branch.value}, which is what pull requests target; make a branch first`,
    );
  }

  return Result.ok({ api, branch: branch.value, defaultBranch });
};

/** The subject of the branch tip, which is the default pull request title. */
export const lastCommitSubject = async (): Promise<Result<string, string>> => {
  const subject = await git('git log -1 --format=%s');

  if (Result.isErr(subject)) return subject;

  const trimmed = subject.value.trim();

  return trimmed === ''
    ? Result.err('the branch tip has no commit subject to use as a title')
    : Result.ok(trimmed);
};

/** Pushes and sets the upstream, so the branch exists to open against. */
export const pushBranch = async (
  branch: string,
): Promise<Result<undefined, string>> => {
  const pushed = await git(`git push -u origin ${sh(branch)}`);

  return Result.isErr(pushed) ? pushed : Result.ok(undefined);
};

/**
 * The open pull request for this branch, or `undefined`.
 *
 * `head` is qualified with the owner. A bare branch name matches the same
 * name on a fork, and this command must not mistake someone else's pull
 * request for its own.
 */
export const findOpenPullRequest = async (
  api: ApiContext,
  branch: string,
): Promise<Result<PullRequest | undefined, string>> => {
  const listed = await rest(
    api,
    'GET',
    '/pulls',
    PullRequestListResponseSchema,
    {
      query: {
        state: 'open',
        per_page: '1',
        head: `${api.repo.owner}:${branch}`,
      },
    },
  );

  if (Result.isErr(listed)) return listed;

  const [found] = listed.value;

  // `noUncheckedIndexedAccess` makes this `… | undefined`, which is the
  // answer: there is one open pull request for the branch, or none.
  return Result.ok(found === undefined ? undefined : toPullRequest(found));
};

export const viewPullRequest = async (
  api: ApiContext,
  prNumber: number,
): Promise<Result<PullRequest, string>> => {
  const viewed = await rest(
    api,
    'GET',
    `/pulls/${prNumber}`,
    PullRequestResponseSchema,
  );

  return Result.isErr(viewed) ? viewed : Result.ok(toPullRequest(viewed.value));
};

/**
 * Creates it ready for review — never a draft, because a draft cannot be
 * armed and arming is the next step.
 */
export const createPullRequest = async ({
  api,
  branch,
  base,
  title,
  body,
}: Readonly<{
  api: ApiContext;
  branch: string;
  base: string;
  title: string;
  body: string;
}>): Promise<Result<number, string>> => {
  const created = await rest(
    api,
    'POST',
    '/pulls',
    t.record({ number: t.number() }),
    { body: { head: branch, base, title, body, draft: false } },
  );

  return Result.isErr(created) ? created : Result.ok(created.value.number);
};

export const addLabel = async (
  api: ApiContext,
  prNumber: number,
  label: string,
): Promise<Result<undefined, string>> => {
  // Labels hang off the issue, which is the same object as the pull request.
  const added = await rest(
    api,
    'POST',
    `/issues/${prNumber}/labels`,
    t.unknown(),
    { body: { labels: [label] } },
  );

  return Result.isErr(added) ? added : Result.ok(undefined);
};

/** GraphQL: the REST API cannot take a pull request out of draft. */
export const markReady = async (
  api: ApiContext,
  nodeId: string,
): Promise<Result<undefined, string>> =>
  graphql(
    api,
    dedent`
      mutation ($id: ID!) {
        markPullRequestReadyForReview(input: { pullRequestId: $id }) {
          clientMutationId
        }
      }
    `,
    { id: nodeId },
  );

/**
 * GraphQL: the REST API cannot arm auto-merge either.
 *
 * Squash, because the `main` ruleset allows nothing else — a pull request
 * armed with another method would sit there refusing to merge.
 */
export const armAutoMerge = async (
  api: ApiContext,
  nodeId: string,
): Promise<Result<undefined, string>> =>
  graphql(
    api,
    dedent`
      mutation ($id: ID!) {
        enablePullRequestAutoMerge(
          input: { pullRequestId: $id, mergeMethod: SQUASH }
        ) {
          clientMutationId
        }
      }
    `,
    { id: nodeId },
  );

const readRefName = async (
  command: string,
): Promise<Result<string, string>> => {
  const read = await git(command);

  if (Result.isErr(read)) return Result.err(`${command} failed: ${read.value}`);

  const name = read.value.trim();

  return isSafeRefName(name)
    ? Result.ok(name)
    : Result.err(`unexpected branch name: ${JSON.stringify(name)}`);
};

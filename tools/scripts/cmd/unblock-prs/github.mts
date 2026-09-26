/** Everything that shells out to `gh` or `git`, and nothing that decides. */

import {
  describeSetAside,
  SET_ASIDE_CONTEXT,
  SKIP_CI_LABEL,
  type SetAside,
} from 'pr-report-core';
import { Json, Result } from 'ts-data-forge';
import * as t from 'ts-fortress';
import { $ } from 'ts-repo-utils';
import { projectRootPath } from '../../project-root-path.mjs';
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
  /** Where the status's "Details" leads; GitHub shows no link without one. */
  targetUrl: string | undefined,
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
      ...(targetUrl === undefined
        ? []
        : [`-f ${sh(`target_url=${targetUrl}`)}`]),
    ].join(' '),
  );

  return Result.isErr(posted) ? posted : Result.ok(undefined);
};

const SHA = /^[0-9a-f]{40}$/u;

const STATUSES_ROUTE = 'repos/{owner}/{repo}/statuses';

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

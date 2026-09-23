/** Everything that shells out to `gh` or `git`, and nothing that decides. */

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

export const remoteSha = async (
  branch: string,
): Promise<Result<string, string>> => {
  const listed = await git(`git ls-remote --heads origin ${sh(branch)}`);

  if (Result.isErr(listed)) return listed;

  const sha = listed.value.trim().split(/\s+/u, 1)[0];

  return sha === undefined || sha === ''
    ? Result.err(`origin has no branch named ${branch}`)
    : Result.ok(sha);
};

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

  if (Result.isErr(parsed)) return Result.err(`invalid JSON: ${parsed.value}`);

  const validated = schema.validate(parsed.value);

  return Result.isErr(validated)
    ? Result.err(t.validationErrorsToMessages(validated.value).join('\n'))
    : Result.ok(validated.value);
};

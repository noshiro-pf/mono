/** Everything that shells out to `gh` or `git`, and nothing that decides. */

import { Num, Result } from 'ts-data-forge';
import { git, parseJson } from '../unblock-prs/github.mjs';
import { isSafeRefName, sh } from '../unblock-prs/util.mjs';
import {
  PR_JSON_FIELDS,
  PullRequestListSchema,
  PullRequestSchema,
  type PullRequest,
} from './types.mjs';

/**
 * `gh` is authenticated, the repository answers, and the branch about to be
 * pushed is not the branch everything targets.
 */
export const preflight = async (): Promise<
  Result<Readonly<{ branch: string; defaultBranch: string }>, string>
> => {
  const auth = await git('gh auth status');

  if (Result.isErr(auth)) {
    return Result.err(`gh is not authenticated:\n${auth.value}`);
  }

  const branch = await readRefName('git rev-parse --abbrev-ref HEAD');

  if (Result.isErr(branch)) return branch;

  const defaultBranch = await readRefName(
    'gh repo view --json defaultBranchRef --jq .defaultBranchRef.name',
  );

  if (Result.isErr(defaultBranch)) return defaultBranch;

  if (branch.value === defaultBranch.value) {
    return Result.err(
      `the current branch is ${branch.value}, which is what pull requests target; make a branch first`,
    );
  }

  if (branch.value === 'HEAD') {
    return Result.err('HEAD is detached; check a branch out first');
  }

  return Result.ok({
    branch: branch.value,
    defaultBranch: defaultBranch.value,
  });
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

/** Pushes and sets the upstream, which is what makes `gh pr create` work. */
export const pushBranch = async (
  branch: string,
): Promise<Result<undefined, string>> => {
  const pushed = await git(`git push -u origin ${sh(branch)}`);

  return Result.isErr(pushed) ? pushed : Result.ok(undefined);
};

/**
 * The open pull request for this branch, or `undefined`. Asked by head branch
 * rather than by the branch name alone, because `gh pr view <branch>` also
 * finds a merged one and this command must not mistake that for its own.
 */
export const findOpenPullRequest = async (
  branch: string,
): Promise<Result<PullRequest | undefined, string>> => {
  const listed = await git(
    `gh pr list --head ${sh(branch)} --state open --limit 1 --json ${PR_JSON_FIELDS}`,
  );

  if (Result.isErr(listed)) return listed;

  const parsed = parseJson(listed.value, PullRequestListSchema);

  if (Result.isErr(parsed)) return parsed;

  // `noUncheckedIndexedAccess` makes this `PullRequest | undefined`, which
  // is the answer: there is one open pull request for the branch, or none.
  return Result.ok(parsed.value[0]);
};

export const viewPullRequest = async (
  prNumber: number,
): Promise<Result<PullRequest, string>> => {
  const viewed = await git(`gh pr view ${prNumber} --json ${PR_JSON_FIELDS}`);

  if (Result.isErr(viewed)) return viewed;

  return parseJson(viewed.value, PullRequestSchema);
};

/**
 * Creates it ready for review — never a draft, because a draft cannot be
 * armed and arming is the next step.
 *
 * The body is quoted with `sh` and passed as one argument rather than written
 * to a temporary file: single-quoting is what protects the backticks, dollars
 * and newlines a description is made of, and it is the same quoting every
 * other call here relies on. A file would only move the problem, and leave
 * one behind on a failure.
 */
export const createPullRequest = async ({
  branch,
  base,
  title,
  body,
}: Readonly<{
  branch: string;
  base: string;
  title: string;
  body: string;
}>): Promise<Result<number, string>> => {
  const created = await git(
    [
      'gh pr create',
      `--base ${sh(base)}`,
      `--head ${sh(branch)}`,
      `--title ${sh(title)}`,
      `--body ${sh(body)}`,
    ].join(' '),
  );

  if (Result.isErr(created)) return created;

  return numberFromUrl(created.value);
};

export const addLabel = async (
  prNumber: number,
  label: string,
): Promise<Result<undefined, string>> => {
  const edited = await git(`gh pr edit ${prNumber} --add-label ${sh(label)}`);

  return Result.isErr(edited) ? edited : Result.ok(undefined);
};

export const markReady = async (
  prNumber: number,
): Promise<Result<undefined, string>> => {
  const ready = await git(`gh pr ready ${prNumber}`);

  return Result.isErr(ready) ? ready : Result.ok(undefined);
};

/**
 * Squash, because the `main` ruleset allows nothing else — a pull request
 * armed with another method would sit there refusing to merge.
 */
export const armAutoMerge = async (
  prNumber: number,
): Promise<Result<undefined, string>> => {
  const armed = await git(`gh pr merge --auto --squash ${prNumber}`);

  return Result.isErr(armed) ? armed : Result.ok(undefined);
};

/** `gh pr create` prints the URL it made; the number is its last segment. */
const numberFromUrl = (output: string): Result<number, string> => {
  const match = /\/pull\/(\d+)\s*$/u.exec(output.trim());

  const digits = match?.[1];

  const unreadable = Result.err(
    `cannot read the pull request number from: ${output.trim()}`,
  );

  if (digits === undefined) return unreadable;

  const parsed = Num.safeParseInt(digits);

  return Result.isErr(parsed) ? unreadable : Result.ok(parsed.value);
};

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

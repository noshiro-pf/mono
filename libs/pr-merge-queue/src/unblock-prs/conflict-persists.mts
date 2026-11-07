/**
 * Whether a pull request set aside `rebase-failed` still conflicts now that the
 * default branch has moved.
 *
 * A move used to end every such set-aside, since the commit it conflicted with
 * may have gone with it. On a busy default branch that handed the pull request
 * back to the worker between every two moves: it tried the same rebase, hit the
 * same conflict and set it aside again, and in between nobody could claim it.
 * So the worker asks first, and only a conflict that is gone, or that it can
 * resolve by itself, ends the set-aside.
 *
 * Only the pull request's own commits count. A layer stacked on it is carried
 * along once it moves, and a layer that cannot be says so without being set
 * aside, so it has no conflict here to keep.
 */

import { spawnSync } from 'node:child_process';
import { Arr, Result } from 'ts-data-forge';
import { git, sh } from '../lib/index.mjs';
import type { RegenerateConfig } from './config.mjs';
import { planRegeneration } from './regenerate.mjs';
import type { OwnSetAsideComment, PullRequest } from './types.mjs';
import { lastLines } from './util.mjs';

/**
 * The files `head` conflicts in when replayed on `onto`, or nothing when it does
 * not, with no worktree. It does what `git rebase onto` would: each commit not
 * already on `onto` by its patch, merged with its parent as the merge base, onto
 * the result of the one before. A merge of the two tips would be wrong for a
 * branch whose earlier commits reached `onto` by a squash. It knows nothing of
 * the merged layer the worker's own rebase starts from (`--onto`), so a layer
 * moved off one can read as conflicting when the rebase would not; that errs
 * towards the skill, and the retry box asks for the rebase.
 *
 * What it leaves behind is commit objects nothing refers to, which git prunes.
 */
export const conflictsOnTip = async (
  onto: string,
  head: string,
  cwd?: string,
): Promise<Result<readonly string[], string>> => {
  const listed = await git(
    `git rev-list --reverse --no-merges --right-only --cherry-pick ${sh(`${onto}...${head}`)}`,
    cwd,
  );

  if (Result.isErr(listed)) {
    return listed;
  }

  const commits = listed.value.split('\n').filter((line) => line !== '');

  let mut_current = onto;

  for (const commit of commits) {
    const picked = pick(`${commit}^`, mut_current, commit, cwd);

    if (Result.isErr(picked)) {
      return picked;
    }

    if (picked.value.kind === 'conflict') {
      return Result.ok(picked.value.files);
    }

    const replayed = await git(
      `git -c user.name=unblock-prs -c user.email=unblock-prs@invalid commit-tree ${sh(picked.value.tree)} -p ${sh(mut_current)} -m replay`,
      cwd,
    );

    if (Result.isErr(replayed)) {
      return replayed;
    }

    mut_current = replayed.value.trim();
  }

  return Result.ok([]);
};

/**
 * Whether a conflict in `files` keeps a pull request set aside: none of it gone,
 * and not all of it files the worker writes again by itself (`regenerate.mts`),
 * which it can only find out by rebasing.
 */
export const whetherConflictStays = (
  files: readonly string[],
  regenerate: RegenerateConfig | undefined,
): boolean =>
  Arr.isNonEmpty(files) &&
  (regenerate === undefined ||
    Result.isErr(planRegeneration(files, regenerate)));

/**
 * The pull requests whose `rebase-failed` comment names another base than
 * `baseSha` and that still conflict, with the files. Asks nothing of one
 * already recorded against `baseSha`, a head that has moved, a retry a person
 * asked for or a stacked layer. Whatever cannot be told is left out, so that the
 * pull request is tried again, as it was before anything asked.
 */
export const stillConflicted = async ({
  comments,
  pullRequests,
  baseSha,
  defaultBranch,
  regenerate,
  fetchLatest = fetchBranches,
  conflicts = conflictsOnTip,
  log,
}: Readonly<{
  comments: ReadonlyMap<number, OwnSetAsideComment>;
  pullRequests: readonly PullRequest[];
  baseSha: string;
  defaultBranch: string;
  regenerate: RegenerateConfig | undefined;
  fetchLatest?: (
    branches: readonly string[],
  ) => Promise<Result<unknown, string>>;
  conflicts?: (
    onto: string,
    head: string,
  ) => Promise<Result<readonly string[], string>>;
  log: (message: string) => void;
}>): Promise<ReadonlyMap<number, readonly string[]>> => {
  const asked = pullRequests.filter((pr) => {
    const says = comments.get(pr.number)?.says;

    return (
      says?.kind === 'standing' &&
      !says.retry &&
      says.setAside.reason === 'rebase-failed' &&
      says.setAside.headSha === pr.headRefOid &&
      says.setAside.baseSha !== baseSha &&
      pr.baseRefName === defaultBranch
    );
  });

  if (Arr.isEmpty(asked)) {
    return new Map<number, readonly string[]>();
  }

  const fetched = await fetchLatest(
    Arr.toUnshifted(defaultBranch)(asked.map((pr) => pr.headRefName)),
  );

  if (Result.isErr(fetched)) {
    log(
      `Cannot fetch to see what still conflicts, so it is tried again: ${lastLines(fetched.value, 2)}`,
    );

    return new Map<number, readonly string[]>();
  }

  const mut_found = new Map<number, readonly string[]>();

  for (const pr of asked) {
    const files = await conflicts(baseSha, pr.headRefOid);

    if (Result.isErr(files)) {
      log(
        `#${pr.number}: cannot tell whether it still conflicts, so it is tried again: ${lastLines(files.value, 2)}`,
      );
    } else if (whetherConflictStays(files.value, regenerate)) {
      mut_found.set(pr.number, files.value);
    }
  }

  return mut_found;
};

type Picked = Readonly<
  | { kind: 'conflict'; files: readonly string[] }
  | { kind: 'clean'; tree: string }
>;

/**
 * One cherry-pick by `git merge-tree`. It exits 1 on a conflict and prints the
 * paths on stdout after the tree id, which a failed `git()` does not keep, so it
 * is run directly: an argument vector, no shell.
 */
const pick = (
  base: string,
  onto: string,
  commit: string,
  cwd: string | undefined,
): Result<Picked, string> => {
  const picked = spawnSync(
    'git',
    [
      'merge-tree',
      '--write-tree',
      '--name-only',
      '--no-messages',
      `--merge-base=${base}`,
      onto,
      commit,
    ],
    {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      ...(cwd === undefined ? {} : { cwd }),
    },
  );

  // Git could not be started, or wrote more than `maxBuffer`: no stdout to read.
  if (picked.error !== undefined) {
    return Result.err(picked.error.message);
  }

  const [tree = '', ...files] = picked.stdout.split('\n');

  return picked.status === 0
    ? Result.ok({ kind: 'clean', tree: tree.trim() })
    : picked.status === 1
      ? Result.ok({
          kind: 'conflict',
          files: Arr.uniq(files.filter((line) => line !== '')),
        })
      : Result.err(picked.stderr.trim());
};

const fetchBranches = async (
  branches: readonly string[],
): Promise<Result<unknown, string>> =>
  git(`git fetch --quiet origin ${branches.map(sh).join(' ')}`);

/**
 * Moving branches with git (`spec/worker.md`): a push leased against the head
 * the snapshot saw, and a layer carried along onto the head the one below it
 * moved to, rebased in a throwaway worktree so that the checkout this runs from
 * is never touched.
 *
 * git is run without a shell, so a branch name is passed as it is; v1's refusal
 * of names it would not hand a shell has nothing left to guard.
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Result, unknownToString } from 'ts-data-forge';
import { resolveByRegenerating, type Regeneration } from './regenerate.mjs';
import { git, gitExitCode } from './run.mjs';

/**
 * Where git runs: `cwd`, a clone whose `origin` is the repository, and
 * `worktreeRoot`, where throwaway worktrees go (the state root,
 * `spec/conventions.md` "Local state").
 */
export type GitPlace = Readonly<{ cwd: string; worktreeRoot: string }>;

/**
 * Whether `head` still conflicts with `tip`, the commits the snapshot read, by
 * `git merge-tree`, which writes nothing a checkout sees: what keeps a
 * `rebase-failed` standing once its base moved (`spec/worker.md`, "Settle
 * comments"). A three-way merge of the two, not a replay of each commit: one
 * that merges cleanly is tried again, and a rebase that still conflicts sets it
 * aside anew. Judged at the snapshot's commits rather than at `origin`'s now, so
 * what the record says is of the commits it names; a head `origin` no longer
 * serves is an error, and the record stands until a later cycle.
 */
export const conflictsWithTip = async (
  cwd: string,
  head: string,
  tip: string,
): Promise<Result<boolean, string>> => {
  const fetched = await fetchCommits(cwd, [head, tip]);

  if (Result.isErr(fetched)) {
    return fetched;
  }

  const merged = await gitExitCode(cwd, [
    'merge-tree',
    '--write-tree',
    '--name-only',
    '--no-messages',
    tip,
    head,
  ]);

  return Result.isErr(merged)
    ? merged
    : merged.value === 0
      ? Result.ok(false)
      : merged.value === 1
        ? Result.ok(true)
        : Result.err(`git merge-tree exited with ${merged.value}`);
};

/** The head of `branch` on `origin` now, by `git ls-remote`. */
export const remoteHead = async (
  cwd: string,
  branch: string,
): Promise<Result<string, string>> => {
  const listed = await git(cwd, [
    'ls-remote',
    'origin',
    `refs/heads/${branch}`,
  ]);

  if (Result.isErr(listed)) {
    return listed;
  }

  const sha = listed.value
    .split('\n')
    .map((line) => line.split('\t'))
    .find(([, ref]) => ref === `refs/heads/${branch}`)?.[0];

  return sha === undefined
    ? Result.err(`origin has no branch named ${branch}`)
    : Result.ok(sha);
};

/**
 * Force-pushes `sha` to `branch`, leased against `lease`: `pushed` when it
 * landed (a push that answered with an error but left the branch at `sha` did),
 * `moved` when the lease lost to someone else's push, an error when the push
 * was refused, or when whether it landed cannot be read.
 */
export const pushLeased = async (
  cwd: string,
  push: Readonly<{ branch: string; sha: string; lease: string }>,
): Promise<Result<'moved' | 'pushed', string>> => {
  const { branch, sha, lease } = push;

  // The lease names the head the snapshot saw, not the remote-tracking ref: a
  // bare `--force-with-lease` compares against whatever the last fetch left,
  // which is exactly the race this is meant to lose safely.
  const pushed = await git(cwd, [
    'push',
    `--force-with-lease=refs/heads/${branch}:${lease}`,
    'origin',
    `${sha}:refs/heads/${branch}`,
  ]);

  if (Result.isOk(pushed)) {
    return Result.ok('pushed');
  }

  // A lease that lost is someone else pushing meanwhile, which is no failure of
  // the pull request's; a push whose answer was lost may have landed.
  const now = await remoteHead(cwd, branch);

  if (Result.isErr(now)) {
    return Result.err(
      `${pushed.value}; reading ${branch} on origin after it failed too (${now.value}), so whether it is at ${sha} now is unknown`,
    );
  }

  const verdict = failedPushVerdict(now.value, push);

  return verdict === 'refused' ? Result.err(pushed.value) : Result.ok(verdict);
};

/**
 * What a push that answered with an error did, by the head `origin` has now:
 * landed after all (its own `sha`: the answer was lost), lost to another writer
 * (neither), or refused (still the `lease`).
 */
export const failedPushVerdict = (
  now: string,
  { sha, lease }: Readonly<{ sha: string; lease: string }>,
): 'moved' | 'pushed' | 'refused' =>
  now === sha ? 'pushed' : now === lease ? 'refused' : 'moved';

/**
 * Rebases `branch`, at `head` on `origin`, `--onto` `onto` from `upstream` (the
 * head it was stacked on) in a throwaway worktree, and pushes the result leased
 * against `head`. `moved` when the branch is no longer at `head`; an error when
 * it does not contain `upstream` (which commits are its own cannot be told),
 * when the rebase conflicts, or when every commit was already in `onto`.
 */
export const rebaseOntoAndPush = async (
  place: GitPlace,
  layer: Readonly<{
    number: number;
    branch: string;
    head: string;
    onto: string;
    upstream: string;
  }>,
): Promise<Result<RebaseOutcome, string>> => {
  const { cwd } = place;

  // The fetch first: asked of `origin` after it, a head that matches is one the
  // fetch brought, which the worktree is made at.
  const fetched = await git(cwd, [
    'fetch',
    '--quiet',
    'origin',
    `refs/heads/${layer.branch}`,
  ]);

  if (Result.isErr(fetched)) {
    return fetched;
  }

  // Asked of `origin` rather than read from `FETCH_HEAD`, which another fetch
  // in this clone (the worker's) may have written meanwhile.
  const at = await remoteHead(cwd, layer.branch);

  if (Result.isErr(at)) {
    return at;
  }

  if (at.value !== layer.head) {
    return Result.ok({ kind: 'moved' });
  }

  return withWorktree(
    place,
    'restack',
    layer.number,
    layer.head,
    async (worktree) => rebaseInWorktree(cwd, worktree, layer),
  );
};

/**
 * Rebases pull request `pr`'s branch, at `head` on `origin`, onto the tip of
 * `base` in a throwaway worktree, and pushes it leased against `head`
 * (`spec/worker.md`, "Picking"). `parent`, for a pull request moved off a
 * merged parent that it still contains, is rebased `--onto` that parent's
 * squash commit from the head it merged at instead: only its own commits are
 * replayed, and the tip is reached on a later rebase. A conflict only in files
 * `regeneration` writes is resolved by writing them again
 * ({@link resolveByRegenerating}), judged by the `CODEOWNERS` at the tip just
 * read; any other is the pull request's, with what a set-aside says of it.
 */
export const rebaseOnTipAndPush = async (
  place: GitPlace,
  pr: Readonly<{
    number: number;
    branch: string;
    head: string;
    base: string;
    parent: Readonly<{ head: string; mergeCommit: string }> | undefined;
  }>,
  regeneration: Regeneration | undefined,
): Promise<Result<TipRebaseOutcome, string>> => {
  const { cwd } = place;

  const [at, tip] = await Promise.all([
    remoteHead(cwd, pr.branch),
    remoteHead(cwd, pr.base),
  ]);

  if (Result.isErr(at)) {
    return at;
  }

  if (Result.isErr(tip)) {
    return tip;
  }

  if (at.value !== pr.head) {
    return Result.ok({ kind: 'moved' });
  }

  const fetched = await fetchCommits(cwd, [pr.head, tip.value]);

  // A head pushed over since it was listed may be one `origin` no longer
  // serves: that is the branch moving, not a failure.
  if (Result.isErr(fetched)) {
    const now = await remoteHead(cwd, pr.branch);

    return Result.isOk(now) && now.value !== pr.head
      ? Result.ok({ kind: 'moved' })
      : fetched;
  }

  return withWorktree<TipRebaseOutcome>(
    place,
    'restack',
    pr.number,
    pr.head,
    async (worktree) => {
      const onto = pr.parent?.mergeCommit ?? tip.value;

      const rebased = await git(
        worktree,
        Arr.toUnshifted('rebase')(
          pr.parent === undefined ? [onto] : ['--onto', onto, pr.parent.head],
        ),
      );

      const regenerated = Result.isOk(rebased)
        ? Result.ok<readonly string[]>([])
        : await resolveByRegenerating(
            worktree,
            regeneration,
            {
              sha: onto,
              name:
                pr.parent === undefined
                  ? pr.base
                  : `the merged parent's squash commit ${onto.slice(0, 10)}`,
            },
            rebased.value,
            tip.value,
            { upstream: pr.parent?.head ?? onto, head: pr.head },
          );

      if (Result.isErr(regenerated)) {
        return regenerated.value.ofPullRequest
          ? Result.ok({ kind: 'conflict', detail: regenerated.value.detail })
          : Result.err(regenerated.value.detail);
      }

      const head = await git(worktree, ['rev-parse', 'HEAD']);

      if (Result.isErr(head)) {
        return head;
      }

      const sha = head.value.trim();

      if (sha === pr.head) {
        return Result.ok({ kind: 'unchanged' });
      }

      if (sha === onto) {
        return Result.ok({ kind: 'already-in-base' });
      }

      const pushed = await pushLeased(cwd, {
        branch: pr.branch,
        sha,
        lease: pr.head,
      });

      return Result.map(pushed, (outcome) =>
        outcome === 'moved'
          ? ({ kind: 'moved' } as const)
          : ({
              kind: 'pushed',
              head: sha,
              onto,
              regenerated: regenerated.value,
            } as const),
      );
    },
  );
};

/**
 * Whether the local `branch` at `cwd` ever had `sha`: an ancestor of it, or a
 * commit it has been at (its reflog, not `HEAD`'s, which a commit only looked
 * at is in too). What `--force-if-includes` asks before a forced push, so that
 * a push not built on is not overwritten: an amend descends from neither, but
 * the head it replaced is in the reflog. Like that option, it does not know a
 * head amended detached and only then given the branch, which it refuses; the
 * refusal says to fetch and put the amend on it.
 */
export const branchHad = async (
  cwd: string,
  branch: string,
  sha: string,
): Promise<Result<boolean, string>> => {
  // Exits 1 when it is not, and 128 when the commit is not here at all.
  const ancestor = await git(cwd, [
    'merge-base',
    '--is-ancestor',
    sha,
    `refs/heads/${branch}`,
  ]);

  if (Result.isOk(ancestor)) {
    return Result.ok(true);
  }

  const reflog = await git(cwd, [
    'reflog',
    'show',
    '--format=%H',
    `refs/heads/${branch}`,
  ]);

  if (Result.isErr(reflog)) {
    return reflog;
  }

  // No reflog at all (`core.logAllRefUpdates` off, or every entry expired) is
  // not knowing, not a push someone else made. An entry expired alone among
  // others cannot be told from one never written; the refusal names it.
  return reflog.value.trim() === ''
    ? Result.err(`refs/heads/${branch} has no reflog to tell from`)
    : Result.ok(reflog.value.split('\n').includes(sha));
};

/**
 * Removes the worktrees {@link withWorktree} made under `worktreeRoot` untouched
 * for {@link STALE_WORKTREE_MS} that this clone registered, or that none did: a
 * rebase takes seconds and an install minutes, so such a one is a run killed
 * midway. Another clone's (the root is shared, across machines and containers
 * too) is that clone's to sweep, even when its record cannot be seen from here,
 * since it alone can tell that its run is gone. Judged by age, not by process: a
 * process id says nothing across machines. Only names {@link withWorktree}
 * makes are touched, so v1's `rebase-pr-<n>` and `auto-fix-pr-<n>` are not.
 */
export const sweepStaleWorktrees = async (
  cwd: string,
  worktreeRoot: string,
  nowEpochMs: number,
): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- the state root
  const names = await Result.fromPromise(fs.readdir(worktreeRoot));

  if (Result.isErr(names)) {
    return;
  }

  const old = await Promise.all(
    names.value
      .filter((name) => WORKTREE_NAME.test(name))
      .map(async (name) => {
        const dir = path.join(worktreeRoot, name);

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the state root
        const stat = await Result.fromPromise(fs.stat(dir));

        return Result.isOk(stat) &&
          nowEpochMs - stat.value.mtimeMs > STALE_WORKTREE_MS
          ? dir
          : undefined;
      }),
  ).then((dirs) => dirs.filter((dir) => dir !== undefined));

  // Asked of git only when there is something to judge: the usual case is not.
  if (!Arr.isNonEmpty(old)) {
    return;
  }

  // A worktree whose record cannot be seen from here is left, though its clone
  // may be deleted: from here that looks the same as a live clone on another
  // machine, and removing a live worktree is worse than leaving a stale one for
  // a person.
  const ownRecords = await ownWorktreeRecords(cwd);

  const stale = await Promise.all(
    old.map(async (dir) =>
      (await sweepable(dir, ownRecords)) ? dir : undefined,
    ),
  ).then((dirs) => dirs.filter((dir) => dir !== undefined));

  if (!Arr.isNonEmpty(stale)) {
    return;
  }

  // A directory that cannot be removed is tried again at the next sweep.
  await Promise.all(
    stale.map(async (dir) =>
      Result.fromPromise(fs.rm(dir, { recursive: true, force: true })),
    ),
  );

  await git(cwd, ['worktree', 'prune']);
};

/**
 * Runs `run` in a throwaway worktree at `head`, removed after. A directory of
 * its own: the worker, or another clone, may be rebasing a pull request of the
 * same number. One a run killed midway leaves is swept once stale
 * ({@link sweepStaleWorktrees}).
 */
export const withWorktree = async <A,>(
  place: GitPlace,
  purpose: WorktreePurpose,
  number: number,
  head: string,
  run: (worktree: string) => Promise<Result<A, string>>,
): Promise<Result<A, string>> => {
  const { cwd, worktreeRoot } = place;

  const made = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the state root
    fs
      .mkdir(worktreeRoot, { recursive: true })
      .then(async () =>
        fs.mkdtemp(path.join(worktreeRoot, `${purpose}-pr-${number}-`)),
      ),
  );

  if (Result.isErr(made)) {
    return Result.err(
      `cannot make a worktree under ${worktreeRoot}: ${unknownToString(made.value)}`,
    );
  }

  const dir = made.value;

  const added = await git(cwd, ['worktree', 'add', '--detach', dir, head]);

  if (Result.isErr(added)) {
    await removeWorktree(cwd, dir);

    return added;
  }

  const result = await run(dir);

  await removeWorktree(cwd, dir);

  return result;
};

/**
 * Fetches those of `shas` the clone lacks from `origin`, by themselves: a tip
 * learned by `git ls-remote`, or a commit the snapshot read. Fetched by branch
 * instead, a tip that moved meanwhile is a commit the clone lacks. No ref is
 * written, `FETCH_HEAD` included, so fetches run side by side in one clone do
 * not contend for a ref's lock. The fetches by branch elsewhere (Auto-fix, a
 * restack, building layers) only compare the branch with a head already known,
 * which a later move cannot take from the clone, and run one step at a time;
 * those that read a remote-tracking ref (Auto-fix, building layers) name it.
 */
export const fetchCommits = async (
  cwd: string,
  shas: readonly string[],
): Promise<Result<unknown, string>> => {
  const present = await Promise.all(
    shas.map(async (sha) =>
      Result.isOk(
        await git(cwd, ['cat-file', '-e', [sha, '^{commit}'].join('')]),
      ),
    ),
  );

  const missing = shas.filter((_, index) => present[index] !== true);

  return Arr.isNonEmpty(missing)
    ? git(cwd, [
        'fetch',
        '--quiet',
        '--no-write-fetch-head',
        'origin',
        ...missing,
      ])
    : Result.ok(undefined);
};

/**
 * How long a restack worktree is left before it counts as a killed run's: far
 * past a rebase and a push, hung ones included.
 */
export const STALE_WORKTREE_MS = 24 * 60 * 60_000;

/** What {@link rebaseOntoAndPush} did: pushed `head`, or found it moved. */
export type RebaseOutcome = Readonly<
  { kind: 'pushed'; head: string } | { kind: 'moved' }
>;

/**
 * What {@link rebaseOnTipAndPush} did: pushed `head`, built on `onto`; found the
 * branch moved; found it on the tip already; found every commit already in the
 * base; or met a conflict, with what a set-aside says of it.
 */
export type TipRebaseOutcome = Readonly<
  | {
      kind: 'pushed';
      head: string;
      onto: string;
      /** The files a conflict in was resolved by regenerating them. */
      regenerated: readonly string[];
    }
  | { kind: 'moved' }
  | { kind: 'unchanged' }
  | { kind: 'already-in-base' }
  | { kind: 'conflict'; detail: string }
>;

/** What a worktree is made for, which names it. */
export type WorktreePurpose =
  'auto-fix' | 'regenerate' | 'restack' | 'speculate';

/**
 * A name `fs.mkdtemp` makes in {@link withWorktree}: the purpose, the number,
 * then six characters.
 */
const WORKTREE_NAME =
  /^(?:auto-fix|regenerate|restack|speculate)-pr-\d+-[\w-]{6}$/u;

const rebaseInWorktree = async (
  cwd: string,
  worktree: string,
  layer: Readonly<{
    branch: string;
    head: string;
    onto: string;
    upstream: string;
  }>,
): Promise<Result<RebaseOutcome, string>> => {
  const contains = await git(worktree, [
    'merge-base',
    '--is-ancestor',
    layer.upstream,
    'HEAD',
  ]);

  if (Result.isErr(contains)) {
    return Result.err(
      `it does not contain ${layer.upstream.slice(0, 10)}, the head it was stacked on, so which commits are its own cannot be told`,
    );
  }

  const rebased = await git(worktree, [
    'rebase',
    '--onto',
    layer.onto,
    layer.upstream,
  ]);

  if (Result.isErr(rebased)) {
    await git(worktree, ['rebase', '--abort']);

    return Result.err(`the rebase onto ${layer.onto.slice(0, 10)} conflicted`);
  }

  const [head, onto] = await Promise.all([
    git(worktree, ['rev-parse', 'HEAD']),
    git(worktree, ['rev-parse', layer.onto]),
  ]);

  if (Result.isErr(head)) {
    return head;
  }

  const sha = head.value.trim();

  if (Result.isOk(onto) && onto.value.trim() === sha) {
    return Result.err(
      `every commit is already in ${layer.onto.slice(0, 10)}; nothing is left to push`,
    );
  }

  const pushed = await pushLeased(cwd, {
    branch: layer.branch,
    sha,
    lease: layer.head,
  });

  return Result.map(pushed, (outcome) =>
    outcome === 'moved'
      ? ({ kind: 'moved' } as const)
      : ({ kind: 'pushed', head: sha } as const),
  );
};

/**
 * Where this clone keeps its worktrees' records (`<git dir>/worktrees`, which
 * need not exist), under the git directory's real path; `undefined` when git
 * cannot say, and then only worktrees no clone registered are swept.
 */
const ownWorktreeRecords = async (cwd: string): Promise<string | undefined> => {
  const commonDir = await git(cwd, ['rev-parse', '--git-common-dir']);

  if (Result.isErr(commonDir)) {
    return undefined;
  }

  const real = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- this clone's git directory
    fs.realpath(path.resolve(cwd, commonDir.value.trim())),
  );

  return Result.isOk(real) ? path.join(real.value, 'worktrees') : undefined;
};

/**
 * Whether the worktree at `dir` may be swept: it has no `.git` (no clone
 * registered it), or its `.git` reads `gitdir: <path>` (absolute, or relative
 * to `dir`) naming a record under `ownRecords`. Anything else, an unreadable
 * record included, is left.
 */
const sweepable = async (
  dir: string,
  ownRecords: string | undefined,
): Promise<boolean> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the state root
  const entries = await Result.fromPromise(fs.readdir(dir));

  if (Result.isErr(entries)) {
    return false;
  }

  if (!entries.value.includes('.git')) {
    return true;
  }

  if (ownRecords === undefined) {
    return false;
  }

  const link = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the state root
    fs.readFile(path.join(dir, '.git'), 'utf8'),
  );

  const named = Result.isOk(link)
    ? /^gitdir: (?<record>.+)$/u.exec(link.value.trim())?.groups?.['record']
    : undefined;

  if (named === undefined) {
    return false;
  }

  const record = await Result.fromPromise(
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- the record a worktree under the state root names
    fs.realpath(path.resolve(dir, named)),
  );

  return Result.isOk(record) && path.dirname(record.value) === ownRecords;
};

/**
 * Removes `worktree`, and the directory should git not have registered it;
 * each step fails harmlessly when there is nothing to remove.
 */
const removeWorktree = async (cwd: string, worktree: string): Promise<void> => {
  await git(cwd, ['worktree', 'remove', '--force', worktree]);

  await Result.fromPromise(fs.rm(worktree, { recursive: true, force: true }));

  await git(cwd, ['worktree', 'prune']);
};

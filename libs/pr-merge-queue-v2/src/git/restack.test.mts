import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import {
  gitOk,
  makeRepository,
  setCommitter,
  type GitRepository,
} from '../../test/index.mjs';
import {
  branchHad,
  failedPushVerdict,
  pushLeased,
  STALE_WORKTREE_MS,
  sweepStaleWorktrees,
} from './git.mjs';
import { restack, restackLines, type RestackLayer } from './restack.mjs';

/** `a` on `main`, `b` on `a`, `c` on `b`, each one commit, pushed. */
const stackOf = async (
  repository: GitRepository,
  /** The file `b` commits to; `a`'s, to make the restack conflict. */
  bFile = 'b.txt',
): Promise<Readonly<{ base: string; a: string; b: string; c: string }>> => {
  const { cwd } = repository.place;

  const base = await repository.headOf('main');

  const a = await repository.commit('a.txt', 'a\n', 'a');

  const b = await repository.commit(bFile, 'b\n', 'b');

  const c = await repository.commit('c.txt', 'c\n', 'c');

  await Promise.all([
    repository.push(a, 'a'),
    repository.push(b, 'b'),
    repository.push(c, 'c'),
  ]);

  await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

  return { base, a, b, c };
};

/** A new head for `a`: its change made again, as a fix replaces a commit. */
const fixA = async (repository: GitRepository): Promise<string> =>
  repository.commit('a.txt', 'a, fixed\n', 'a, fixed');

const layer = (
  number: number,
  headRef: string,
  headSha: string,
  baseRef: string,
): RestackLayer =>
  ({ number, headRef, headSha, baseRef, fromFork: false }) as const;

/** The names in a directory under the temporary one. */
const namesIn = async (dir: string): Promise<readonly string[]> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the temporary directory
  fs.readdir(dir);

describe(restack, () => {
  test('carries every layer onto the new head of the one below', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { a, b, c } = await stackOf(repository);

    const fixed = await fixA(repository);

    assert.deepStrictEqual(
      await pushLeased(repository.place.cwd, {
        branch: 'a',
        sha: fixed,
        lease: a,
      }),
      Result.ok('pushed'),
    );

    const outcomes = await restack(
      repository.place,
      { branch: 'a', from: a, to: fixed },
      [layer(2, 'b', b, 'a'), layer(3, 'c', c, 'b')],
    );

    const [newB, newC] = await Promise.all([
      repository.headOf('b'),
      repository.headOf('c'),
    ]);

    const parents = await Promise.all(
      [newB, newC].map(async (sha) =>
        gitOk(repository.place.cwd, ['rev-parse', `${sha}^`]),
      ),
    );

    assert.deepStrictEqual(outcomes, [
      { number: 2, kind: 'restacked', head: newB },
      { number: 3, kind: 'restacked', head: newC },
    ]);

    assert.deepStrictEqual(parents, [fixed, newB]);

    // Each rebase's worktree is gone, from disk and from the clone's list.
    assert.deepStrictEqual(await namesIn(repository.place.worktreeRoot), []);

    assert.strictEqual(
      await gitOk(repository.place.cwd, ['worktree', 'list']).then(
        (listed) => listed.split('\n').length,
      ),
      1,
    );
  });

  test('leaves a layer that conflicts, and everything on it', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    // `b` writes the file the fix of `a` writes too.
    const { a, b, c } = await stackOf(repository, 'a.txt');

    const fixed = await fixA(repository);

    await repository.push(fixed, 'a');

    const outcomes = await restack(
      repository.place,
      { branch: 'a', from: a, to: fixed },
      [layer(2, 'b', b, 'a'), layer(3, 'c', c, 'b')],
    );

    const heads = await Promise.all([
      repository.headOf('b'),
      repository.headOf('c'),
    ]);

    assert.deepStrictEqual(restackLines(outcomes), [
      `#2: not restacked — the rebase onto ${fixed.slice(0, 10)} conflicted.`,
      '#3: not restacked — the layer it is on, b, did not move.',
    ]);

    assert.deepStrictEqual(heads, [b, c]);
  });

  test('leaves a layer someone else moved, and a fork’s', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { a, b, c } = await stackOf(repository);

    const fixed = await fixA(repository);

    await repository.push(fixed, 'a');

    // Someone else pushes `b` meanwhile.
    await repository.push(c, 'b');

    const outcomes = await restack(
      repository.place,
      { branch: 'a', from: a, to: fixed },
      [layer(2, 'b', b, 'a'), { ...layer(4, 'd', c, 'a'), fromFork: true }],
    );

    assert.deepStrictEqual(restackLines(outcomes), [
      '#2: not restacked — its branch moved since it was read, so someone else is moving it.',
      '#4: not restacked — its branch is in a fork.',
    ]);
  });
});

describe(pushLeased, () => {
  test('is moved when the lease lost to another push', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { a, b } = await stackOf(repository);

    const fixed = await fixA(repository);

    // Someone else pushes `a` first.
    await repository.push(b, 'a');

    const pushed = await pushLeased(repository.place.cwd, {
      branch: 'a',
      sha: fixed,
      lease: a,
    });

    const head = await repository.headOf('a');

    assert.deepStrictEqual(pushed, Result.ok('moved'));

    assert.strictEqual(head, b);
  });
});

describe(sweepStaleWorktrees, () => {
  test('removes the stale restack worktrees of this clone and of none, and nothing else', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd, worktreeRoot } = repository.place;

    const base = await repository.headOf('main');

    const { origin } = repository;

    const live = path.join(path.dirname(worktreeRoot), 'live');

    const gone = path.join(path.dirname(worktreeRoot), 'gone');

    await Promise.all(
      [live, gone].map(async (clone) =>
        gitOk(cwd, ['clone', '--quiet', origin, clone]),
      ),
    );

    // This clone's, v1's, another tool's; another live clone's; a clone's gone.
    for (const [clone, name] of [
      [cwd, 'restack-pr-9-aB3_x-'],
      [cwd, 'rebase-pr-9'],
      [cwd, 'other-x'],
      [live, 'restack-pr-11-abcdef'],
      [gone, 'restack-pr-12-abcdef'],
    ] as const) {
      // One after another: each edits the worktree records of its clone.
      // eslint-disable-next-line no-await-in-loop
      await gitOk(clone, [
        'worktree',
        'add',
        '--detach',
        path.join(worktreeRoot, name),
        base,
      ]);
    }

    await fs.rm(gone, { recursive: true, force: true });

    // One a run killed before registering.
    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the temporary directory
    await fs.mkdir(path.join(worktreeRoot, 'restack-pr-10-zzzzzz'));

    // Not yet stale: kept.
    await sweepStaleWorktrees(cwd, worktreeRoot, Date.now());

    const kept = await namesIn(worktreeRoot);

    await sweepStaleWorktrees(
      cwd,
      worktreeRoot,
      Date.now() + STALE_WORKTREE_MS + 60_000,
    );

    const swept = await namesIn(worktreeRoot);

    const listed = await Promise.all(
      [cwd, live].map(async (clone) =>
        gitOk(clone, ['worktree', 'list']).then(
          (lines) => lines.split('\n').length,
        ),
      ),
    );

    // A clone gone is not provably gone from here: its worktree is left.
    assert.deepStrictEqual(
      [kept.toSorted(), swept.toSorted(), listed],
      [
        [
          'other-x',
          'rebase-pr-9',
          'restack-pr-10-zzzzzz',
          'restack-pr-11-abcdef',
          'restack-pr-12-abcdef',
          'restack-pr-9-aB3_x-',
        ],
        [
          'other-x',
          'rebase-pr-9',
          'restack-pr-11-abcdef',
          'restack-pr-12-abcdef',
        ],
        [3, 2],
      ],
    );
  });
});

describe(branchHad, () => {
  test('is an ancestor, or a commit the branch has been at, but not one only fetched or checked out', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd, worktreeRoot } = repository.place;

    const { base, a } = await stackOf(repository);

    // A local `a`, amended: the old head is in its reflog, not an ancestor.
    await gitOk(cwd, ['checkout', '--quiet', '-B', 'a', a]);

    await gitOk(cwd, ['commit', '--quiet', '--amend', '-m', 'a, amended']);

    // Someone else's push to `a`, fetched and looked at, never on the branch.
    const other = path.join(path.dirname(worktreeRoot), 'other');

    await gitOk(cwd, ['clone', '--quiet', repository.origin, other]);

    await setCommitter(other);

    await gitOk(other, ['checkout', '--quiet', '--detach', a]);

    await gitOk(other, ['commit', '--quiet', '--allow-empty', '-m', 'theirs']);

    const theirs = await gitOk(other, ['rev-parse', 'HEAD']);

    await gitOk(other, [
      'push',
      '--quiet',
      '--force',
      'origin',
      'HEAD:refs/heads/a',
    ]);

    await gitOk(cwd, ['fetch', '--quiet', 'origin', 'a']);

    // Left looking at it: HEAD is theirs, the branch never was.
    await gitOk(cwd, ['checkout', '--quiet', '--detach', 'FETCH_HEAD']);

    const results = await Promise.all(
      [base, a, theirs, 'f'.repeat(40)].map(async (sha) =>
        branchHad(cwd, 'a', sha),
      ),
    );

    assert.deepStrictEqual(results, [
      Result.ok(true),
      Result.ok(true),
      Result.ok(false),
      Result.ok(false),
    ]);

    // With no reflog left, an amended head cannot be told from theirs.
    await gitOk(cwd, ['reflog', 'expire', '--expire=all', 'refs/heads/a']);

    assert.isTrue(Result.isErr(await branchHad(cwd, 'a', theirs)));
  });
});

describe(failedPushVerdict, () => {
  test('reads a failed push by the head origin has now', () => {
    const push = { sha: 'a'.repeat(40), lease: 'b'.repeat(40) } as const;

    assert.deepStrictEqual(
      [push.sha, push.lease, 'c'.repeat(40)].map((now) =>
        failedPushVerdict(now, push),
      ),
      ['pushed', 'refused', 'moved'],
    );
  });
});

// cspell:ignore unstub

import { Result } from 'ts-data-forge';
import {
  gitOk,
  makeRepository,
  type GitRepository,
} from '../../test/index.mjs';
import {
  conflictsWithTip,
  rebaseOnTipAndPush,
  type TipRebaseOutcome,
} from './git.mjs';
import type { Regeneration } from './regenerate.mjs';

/** A branch `pr` with one commit to `file`, and `main` moved on beside it. */
const behindMain = async (
  repository: GitRepository,
  file: string,
): Promise<Readonly<{ head: string; tip: string }>> => {
  const { cwd } = repository.place;

  const base = await repository.headOf('main');

  const head = await repository.commit(file, 'pr\n', 'pr');

  await repository.push(head, 'pr');

  await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

  const tip = await repository.commit('main.txt', 'main\n', 'main moved');

  await repository.push(tip, 'main');

  return { head, tip };
};

const rebase = async (
  repository: GitRepository,
  head: string,
  parent: Readonly<{ head: string; mergeCommit: string }> | undefined,
  regeneration?: Regeneration,
): Promise<Result<TipRebaseOutcome, string>> =>
  rebaseOnTipAndPush(
    repository.place,
    {
      number: 1,
      branch: 'pr',
      head,
      base: 'main',
      parent,
    },
    regeneration,
  );

/**
 * `generated` (`gen.txt`) written from `source` (`src.txt`) and `main.txt` by
 * `run`, added on both `pr` (with `source`, in one commit, or two when
 * `commits` says so) and `main` (with `main.txt`), so the rebase conflicts in it
 * alone.
 */
const generatedConflict = async (
  repository: GitRepository,
  {
    generated = 'gen.txt',
    source = 'src.txt',
    commits = 1,
  }: Readonly<{ generated?: string; source?: string; commits?: 1 | 2 }> = {},
): Promise<Readonly<{ head: string; tip: string }>> => {
  const { cwd } = repository.place;

  const base = await repository.headOf('main');

  await repository.commit(source, 'pr\n', 'pr source');

  await repository.commit(generated, 'pr\n', 'pr');

  if (commits === 1) {
    await gitOk(cwd, ['reset', '--quiet', '--soft', base]);

    await gitOk(cwd, ['commit', '--quiet', '-m', 'pr']);
  }

  const head = await gitOk(cwd, ['rev-parse', 'HEAD']);

  await repository.push(head, 'pr');

  await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

  await repository.commit('main.txt', 'main\n', 'main source');

  const tip = await repository.commit(generated, 'main\n', 'main (#7)');

  await repository.push(tip, 'main');

  return { head, tip };
};

const regenerating = (
  run: string,
  before: readonly string[] = [],
  path: RegExp = /^gen\.txt$/u,
): Regeneration =>
  ({
    config: { before, generators: [{ path, run }] },
    log: () => {},
    stopRequested: () => false,
  }) as const;

describe(rebaseOnTipAndPush, () => {
  test('rebases onto the tip and pushes', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head, tip } = await behindMain(repository, 'pr.txt');

    const outcome = await rebase(repository, head, undefined);

    assert.isTrue(Result.isOk(outcome));

    const pushed = await repository.headOf('pr');

    assert.deepStrictEqual(
      outcome,
      Result.ok({ kind: 'pushed', head: pushed, onto: tip, regenerated: [] }),
    );

    assert.notStrictEqual(pushed, head);
  });

  test('says the branch moved when it is not at the head given', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    await behindMain(repository, 'pr.txt');

    assert.deepStrictEqual(
      await rebase(repository, 'f'.repeat(40), undefined),
      Result.ok({ kind: 'moved' }),
    );
  });

  test('names the conflicting files, and leaves the branch alone', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await behindMain(repository, 'main.txt');

    assert.deepStrictEqual(
      await rebase(repository, head, undefined),
      Result.ok({
        kind: 'conflict',
        detail: 'conflicts with main in `main.txt`',
      }),
    );

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('resolves a conflict only in generated files by regenerating them', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head, tip } = await generatedConflict(repository);

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('cat src.txt main.txt > gen.txt'),
    );

    const pushed = await repository.headOf('pr');

    assert.deepStrictEqual(
      outcome,
      Result.ok({
        kind: 'pushed',
        head: pushed,
        onto: tip,
        regenerated: ['gen.txt'],
      }),
    );

    assert.strictEqual(
      await gitOk(repository.origin, ['show', `${pushed}:gen.txt`]),
      'pr\nmain',
    );

    assert.strictEqual(
      await gitOk(repository.origin, [
        'rev-list',
        '--count',
        `${tip}..${pushed}`,
      ]),
      '1',
    );
  });

  test('judges the regenerated files by the CODEOWNERS at the tip it read, not at a stale ref', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    const { head, tip } = await generatedConflict(repository);

    const owned = await repository.commit(
      '.github/CODEOWNERS',
      'gen.txt @owner\n',
      'own gen.txt',
    );

    await repository.push(owned, 'main');

    // The remote-tracking ref left where the last fetch put it.
    await gitOk(cwd, ['update-ref', 'refs/remotes/origin/main', tip]);

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('cat src.txt main.txt > gen.txt'),
    );

    assert.isTrue(
      Result.isOk(outcome) &&
        outcome.value.kind === 'conflict' &&
        outcome.value.detail.includes('CODEOWNERS gives owners'),
    );
  });

  test('reads a generated path with pattern characters as itself', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    // `g[x].txt` read as a pattern matches `gx.txt`, which the pull request
    // changed, so the base's version given back would go unnoticed.
    const { head } = await generatedConflict(repository, {
      generated: 'g[x].txt',
      source: 'gx.txt',
    });

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating("cp main.txt 'g[x].txt'", [], /^g\[x\]\.txt$/u),
    );

    assert.isTrue(
      Result.isOk(outcome) &&
        outcome.value.kind === 'conflict' &&
        outcome.value.detail.includes("gave back main's version"),
    );
  });

  test('refuses a branch of two commits, though taking the base side empties one', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await generatedConflict(repository, { commits: 2 });

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('cat src.txt main.txt > gen.txt'),
    );

    assert.isTrue(
      Result.isOk(outcome) &&
        outcome.value.kind === 'conflict' &&
        outcome.value.detail.includes('the branch has 2 commits on main'),
    );

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('counts no commit of the branch that main already has by its patch', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    const base = await repository.headOf('main');

    await repository.commit('other.txt', 'other\n', 'other');

    await repository.commit('src.txt', 'pr\n', 'pr source');

    await repository.commit('gen.txt', 'pr\n', 'pr');

    // Two commits: `other`, then the source and the generated file together.
    const other = await gitOk(cwd, ['rev-parse', 'HEAD~2']);

    await gitOk(cwd, ['reset', '--quiet', '--soft', other]);

    await gitOk(cwd, ['commit', '--quiet', '-m', 'pr']);

    const head = await gitOk(cwd, ['rev-parse', 'HEAD']);

    await repository.push(head, 'pr');

    await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

    // `other` picked onto main under another message.
    await repository.commit('other.txt', 'other\n', 'other (#8)');

    await repository.commit('main.txt', 'main\n', 'main source');

    const tip = await repository.commit('gen.txt', 'main\n', 'main (#7)');

    await repository.push(tip, 'main');

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('cat src.txt main.txt > gen.txt'),
    );

    assert.deepStrictEqual(
      Result.map(outcome, (value) =>
        value.kind === 'pushed' ? value.regenerated : value.kind,
      ),
      Result.ok(['gen.txt']),
    );
  });

  test('gives both reasons when every commit of a longer branch is emptied', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    const base = await repository.headOf('main');

    await repository.commit('gen.txt', 'pr\n', 'pr');

    const head = await repository.commit('gen2.txt', 'pr\n', 'pr again');

    await repository.push(head, 'pr');

    await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

    await repository.commit('gen.txt', 'main\n', 'main');

    const tip = await repository.commit('gen2.txt', 'main\n', 'main again');

    await repository.push(tip, 'main');

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('true', [], /^gen2?\.txt$/u),
    );

    assert.isTrue(
      Result.isOk(outcome) &&
        outcome.value.kind === 'conflict' &&
        outcome.value.detail.includes('the branch has 2 commits on main') &&
        outcome.value.detail.includes('empties every one'),
    );

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('rebases as it is pinned to, whatever the clone configures', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await generatedConflict(repository, { commits: 2 });

    // The apply backend stops on a commit a resolution empties, rather than
    // dropping it, which would read as the environment's failure.
    await gitOk(repository.place.cwd, ['config', 'rebase.backend', 'apply']);

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('cat src.txt main.txt > gen.txt'),
    );

    assert.isTrue(
      Result.isOk(outcome) &&
        outcome.value.kind === 'conflict' &&
        outcome.value.detail.includes('the branch has 2 commits on main'),
    );

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('applies no resolution the clone recorded, and sets the conflict aside', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    const { head, tip } = await behindMain(repository, 'main.txt');

    for (const [key, value] of [
      ['rerere.enabled', 'true'],
      ['rerere.autoUpdate', 'true'],
    ] as const) {
      // eslint-disable-next-line no-await-in-loop -- each writes the clone's config
      await gitOk(cwd, ['config', key, value]);
    }

    // The same conflict resolved by hand once in the clone, which records it;
    // with no editor waited on, whatever the environment names.
    vi.stubEnv('GIT_EDITOR', 'true');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    await gitOk(cwd, ['checkout', '--quiet', '--detach', head]);

    await gitOk(cwd, ['rebase', tip]).catch(() => undefined);

    assert.strictEqual(
      await gitOk(cwd, ['diff', '--name-only', '--diff-filter=U']),
      'main.txt',
    );

    await gitOk(cwd, ['checkout', '--theirs', '--', 'main.txt']);

    await gitOk(cwd, ['add', 'main.txt']);

    await gitOk(cwd, ['rebase', '--continue']);

    const outcome = await rebase(repository, head, undefined);

    assert.deepStrictEqual(
      Result.map(outcome, ({ kind }) => kind),
      Result.ok('conflict'),
    );
  });

  test('waits on no editor the environment names when it continues', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await generatedConflict(repository);

    vi.stubEnv('GIT_EDITOR', 'false');

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('cat src.txt main.txt > gen.txt'),
    );

    assert.deepStrictEqual(
      Result.map(outcome, ({ kind }) => kind),
      Result.ok('pushed'),
    );
  });

  test('regenerates a conflicted file whose path is not ASCII', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await generatedConflict(repository, {
      generated: '生成.txt',
    });

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('cat src.txt main.txt > 生成.txt', [], /^生成\.txt$/u),
    );

    assert.isTrue(Result.isOk(outcome) && outcome.value.kind === 'pushed');

    assert.deepStrictEqual(
      Result.map(outcome, (value) =>
        value.kind === 'pushed' ? value.regenerated : [],
      ),
      Result.ok(['生成.txt']),
    );
  });

  test('fails, rather than setting aside, a rebase that stops on no file', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await behindMain(repository, 'pr.txt');

    // Every commit the rebase replays is refused for an empty name, so it stops
    // on its first one with nothing unmerged. The environment's own identity,
    // which would win over the clone's, is taken away meanwhile.
    for (const name of [
      'GIT_AUTHOR_NAME',
      'GIT_COMMITTER_NAME',
      'GIT_AUTHOR_EMAIL',
      'GIT_COMMITTER_EMAIL',
    ]) {
      vi.stubEnv(name, undefined);
    }

    onTestFinished(() => {
      vi.unstubAllEnvs();
    });

    await gitOk(repository.place.cwd, ['config', 'user.name', '']);

    const outcome = await rebase(repository, head, undefined);

    assert.isTrue(Result.isErr(outcome));

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('fails, rather than setting aside, a rebase onto a commit the clone lacks', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await behindMain(repository, 'pr.txt');

    const outcome = await rebase(repository, head, {
      head,
      mergeCommit: 'e'.repeat(40),
    });

    assert.isTrue(Result.isErr(outcome));

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('names what changed the file on the base when nothing regenerates it', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await generatedConflict(repository);

    assert.deepStrictEqual(
      await rebase(repository, head, undefined),
      Result.ok({
        kind: 'conflict',
        detail: 'conflicts with main in `gen.txt` (changed there by #7)',
      }),
    );

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('refuses a generator that gives back the base side', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await generatedConflict(repository);

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('cp main.txt gen.txt'),
    );

    assert.isTrue(
      Result.isOk(outcome) &&
        outcome.value.kind === 'conflict' &&
        outcome.value.detail.includes("gave back main's version"),
    );

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('fails, rather than setting aside, when a step before the generators fails', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { head } = await generatedConflict(repository);

    const outcome = await rebase(
      repository,
      head,
      undefined,
      regenerating('cat src.txt main.txt > gen.txt', ['exit 1']),
    );

    assert.isTrue(Result.isErr(outcome));

    assert.strictEqual(await repository.headOf('pr'), head);
  });

  test('says unchanged for a branch already on the tip', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const head = await repository.commit('pr.txt', 'pr\n', 'pr');

    await repository.push(head, 'pr');

    assert.deepStrictEqual(
      await rebase(repository, head, undefined),
      Result.ok({ kind: 'unchanged' }),
    );
  });

  test('says already-in-base when every commit is in the tip', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    const base = await repository.headOf('main');

    const head = await repository.commit('pr.txt', 'pr\n', 'pr');

    await repository.push(head, 'pr');

    await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

    // The same change landed on main under another commit.
    const tip = await repository.commit('pr.txt', 'pr\n', 'squashed');

    await repository.push(tip, 'main');

    assert.deepStrictEqual(
      await rebase(repository, head, undefined),
      Result.ok({ kind: 'already-in-base' }),
    );
  });

  test('replays only the commits since a merged parent', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    const base = await repository.headOf('main');

    const parent = await repository.commit('parent.txt', 'parent\n', 'parent');

    const head = await repository.commit('pr.txt', 'pr\n', 'pr');

    await repository.push(head, 'pr');

    await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

    // The parent squashed onto main, with a different message.
    const tip = await repository.commit(
      'parent.txt',
      'parent\n',
      'parent (#9)',
    );

    await repository.push(tip, 'main');

    const outcome = await rebase(repository, head, {
      head: parent,
      mergeCommit: tip,
    });

    assert.isTrue(Result.isOk(outcome) && outcome.value.kind === 'pushed');

    const pushed = await repository.headOf('pr');

    assert.strictEqual(
      await gitOk(repository.origin, ['rev-parse', `${pushed}^`]),
      tip,
    );
  });

  test('regenerates a conflict with a merged parent, counting only its own commit', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    await repository.commit('main.txt', 'main\n', 'main source');

    const base = await repository.commit('gen.txt', 'base\n', 'generated');

    await repository.push(base, 'main');

    const parent = await repository.commit('parent.txt', 'parent\n', 'parent');

    await repository.commit('src.txt', 'pr\n', 'pr source');

    await repository.commit('gen.txt', 'pr\n', 'pr');

    await gitOk(cwd, ['reset', '--quiet', '--soft', parent]);

    await gitOk(cwd, ['commit', '--quiet', '-m', 'pr']);

    const head = await gitOk(cwd, ['rev-parse', 'HEAD']);

    await repository.push(head, 'pr');

    await gitOk(cwd, ['checkout', '--quiet', '--detach', base]);

    // The parent squashed onto main with the generated file written again, in
    // one commit no patch of the branch's equals.
    await repository.commit('parent.txt', 'parent\n', 'parent source');

    await repository.commit('gen.txt', 'main\n', 'generated');

    await gitOk(cwd, ['reset', '--quiet', '--soft', base]);

    await gitOk(cwd, ['commit', '--quiet', '-m', 'parent (#9)']);

    const squash = await gitOk(cwd, ['rev-parse', 'HEAD']);

    await repository.push(squash, 'main');

    const outcome = await rebase(
      repository,
      head,
      { head: parent, mergeCommit: squash },
      regenerating('cat src.txt main.txt > gen.txt'),
    );

    assert.deepStrictEqual(
      Result.map(outcome, (value) =>
        value.kind === 'pushed' ? value.regenerated : value.kind,
      ),
      Result.ok(['gen.txt']),
    );
  });
});

describe(conflictsWithTip, () => {
  test('tells a branch that still conflicts with the tip from one that does not', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const conflicting = await behindMain(repository, 'main.txt');

    assert.deepStrictEqual(
      await conflictsWithTip(
        repository.place.cwd,
        conflicting.head,
        conflicting.tip,
      ),
      Result.ok(true),
    );

    const clean = await makeRepository();

    onTestFinished(clean.dispose);

    const apart = await behindMain(clean, 'pr.txt');

    assert.deepStrictEqual(
      await conflictsWithTip(clean.place.cwd, apart.head, apart.tip),
      Result.ok(false),
    );
  });

  test('fails for a head origin does not have', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { tip } = await behindMain(repository, 'pr.txt');

    assert.isTrue(
      Result.isErr(
        await conflictsWithTip(repository.place.cwd, 'f'.repeat(40), tip),
      ),
    );
  });
});

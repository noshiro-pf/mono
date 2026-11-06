import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { git } from '../lib/index.mjs';
import type { RegenerateConfig } from './config.mjs';
import { planRegeneration, resolveByRegenerating } from './regenerate.mjs';

const CONFIG: RegenerateConfig = {
  before: ['pnpm install --frozen-lockfile'],
  generators: [
    {
      path: /^docs\/package-dependencies\.md$/u,
      run: 'pnpm run gen:deps-graph',
    },
    {
      path: /^((?:apps|libs)\/[^/]+)\/src\/.*(?<=\/)index\.mts$/u,
      run: 'pnpm --dir $1 run gen:index',
    },
  ],
} as const;

describe(planRegeneration, () => {
  test('runs the generator of each conflicted file, each command once', () => {
    const plan = planRegeneration(
      [
        'docs/package-dependencies.md',
        'libs/a/src/index.mts',
        'libs/a/src/b/index.mts',
        'apps/c d/src/index.mts',
      ],
      CONFIG,
    );

    assert.isTrue(Result.isOk(plan));

    assert.deepStrictEqual(plan.value, [
      'pnpm run gen:deps-graph',
      "pnpm --dir 'libs/a' run gen:index",
      "pnpm --dir 'apps/c d' run gen:index",
    ]);
  });

  test('names the conflicted files no generator writes', () => {
    const plan = planRegeneration(
      ['docs/package-dependencies.md', 'libs/a/src/x.mts', 'README.md'],
      CONFIG,
    );

    assert.isTrue(Result.isErr(plan));

    assert.deepStrictEqual(plan.value, ['libs/a/src/x.mts', 'README.md']);
  });

  test('plans nothing for nothing conflicted', () => {
    assert.deepStrictEqual(planRegeneration([], CONFIG), Result.ok([]));
  });
});

describe(resolveByRegenerating, () => {
  test('takes main’s side, generates the file again and amends it', async () => {
    const { dir, output } = await conflictedRebase(false);

    const resolved = await resolveByRegenerating(
      dir,
      generating('cat a.txt b.txt > gen.txt'),
      'main',
      output,
    );

    assert.deepStrictEqual(resolved, Result.ok(['gen.txt']));

    assert.strictEqual(await read(dir, 'gen.txt'), 'A\nb\n');

    const parent = await git('git rev-parse HEAD~1 main', dir);

    assert.isTrue(Result.isOk(parent));

    const [first, second] = parent.value.trim().split('\n', 2);

    assert.strictEqual(first, second);

    await fs.rm(dir, { recursive: true });
  });

  test('stops when the generator gives main’s version back', async () => {
    const { dir, output } = await conflictedRebase(false);

    const resolved = await resolveByRegenerating(
      dir,
      generating('cp a.txt gen.txt'),
      'main',
      output,
    );

    assert.isTrue(Result.isErr(resolved));

    expect(resolved.value.detail).toContain(
      "generating gen.txt again gave back main's version",
    );

    assert.isTrue(resolved.value.ofPullRequest);

    await fs.rm(dir, { recursive: true });
  });

  test('aborts, naming what could have been generated, beside a hand-written conflict', async () => {
    const { dir, output } = await conflictedRebase(true);

    const resolved = await resolveByRegenerating(
      dir,
      generating('cat a.txt b.txt > gen.txt'),
      'main',
      output,
    );

    assert.deepStrictEqual(
      resolved,
      Result.err({
        detail:
          'conflicts with main in a.txt, gen.txt; only gen.txt could be generated again',
        ofPullRequest: true,
      }),
    );

    const head = await git('git rev-parse --abbrev-ref HEAD', dir);

    assert.deepStrictEqual(
      Result.map(head, (name) => name.trim()),
      Result.ok('pr'),
    );

    await fs.rm(dir, { recursive: true });
  });

  test('leaves a failed install to the next cycle, not the pull request', async () => {
    const { dir, output } = await conflictedRebase(false);

    const resolved = await resolveByRegenerating(
      dir,
      { ...generating('cat a.txt b.txt > gen.txt'), before: ['false'] },
      'main',
      output,
    );

    assert.isTrue(Result.isErr(resolved));

    assert.isFalse(resolved.value.ofPullRequest);

    expect(resolved.value.detail).toContain('`false` failed');

    await fs.rm(dir, { recursive: true });
  });

  test('refuses a branch of several commits', async () => {
    const { dir } = await conflictedRebase(false);

    assert.isTrue(Result.isOk(await git('git rebase --abort', dir)));

    assert.isTrue(
      Result.isOk(
        await git(
          String.raw`printf 'c\n' > c.txt && git add c.txt && git commit --quiet -m second`,
          dir,
        ),
      ),
    );

    const rebased = await git('git rebase main', dir);

    assert.isTrue(Result.isErr(rebased));

    const resolved = await resolveByRegenerating(
      dir,
      generating('cat a.txt b.txt > gen.txt'),
      'main',
      rebased.value,
    );

    assert.isTrue(Result.isErr(resolved));

    expect(resolved.value.detail).toContain('not one commit');

    await fs.rm(dir, { recursive: true });
  });

  test('says so when the commit changed nothing but the generated file', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'regenerate-'));

    for (const step of [
      'git init --quiet --initial-branch=main',
      'git config user.email t@example.com && git config user.name t',
      String.raw`printf 'a\n' > gen.txt && git add --all && git commit --quiet -m base`,
      String.raw`git checkout --quiet -b pr && printf 'pr\n' > gen.txt && git commit --quiet -am pr`,
      String.raw`git checkout --quiet main && printf 'main\n' > gen.txt && git commit --quiet -am main`,
      'git checkout --quiet pr',
    ]) {
      assert.isTrue(Result.isOk(await git(step, dir)));
    }

    const rebased = await git('git rebase main', dir);

    assert.isTrue(Result.isErr(rebased));

    const resolved = await resolveByRegenerating(
      dir,
      generating('cat gen.txt > /dev/null'),
      'main',
      rebased.value,
    );

    assert.isTrue(Result.isErr(resolved));

    expect(resolved.value.detail).toContain('leaves it empty');

    await fs.rm(dir, { recursive: true });
  });

  test('aborts and names the conflict when nothing is regenerated', async () => {
    const { dir, output } = await conflictedRebase(false);

    const resolved = await resolveByRegenerating(
      dir,
      undefined,
      'main',
      output,
    );

    assert.deepStrictEqual(
      resolved,
      Result.err({
        detail: 'conflicts with main in gen.txt',
        ofPullRequest: true,
      }),
    );

    await fs.rm(dir, { recursive: true });
  });
});

/**
 * A repository whose `gen.txt` is generated from `a.txt` and `b.txt`; the
 * branch `pr` adds `b.txt`, and `main` then changes `a.txt`, so that rebasing
 * `pr` onto `main` conflicts in `gen.txt` alone, or also in `a.txt` when `pr`
 * changes it too. Resolves to the directory, checked out at `pr` and stopped in
 * the conflicted rebase, and what the rebase printed.
 */
const conflictedRebase = async (
  prChangesA: boolean,
): Promise<Readonly<{ dir: string; output: string }>> => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'regenerate-'));

  const steps = [
    'git init --quiet --initial-branch=main',
    'git config user.email t@example.com && git config user.name t',
    String.raw`printf 'a\n' > a.txt && cp a.txt gen.txt`,
    'git add --all && git commit --quiet -m base',
    'git checkout --quiet -b pr',
    String.raw`printf 'b\n' > b.txt && cat a.txt b.txt > gen.txt`,
    ...(prChangesA
      ? ([String.raw`printf 'pr\n' > a.txt`] as const)
      : ([] as const)),
    'git add --all && git commit --quiet -m pr',
    'git checkout --quiet main',
    String.raw`printf 'A\n' > a.txt && cp a.txt gen.txt`,
    'git add --all && git commit --quiet -m main',
    'git checkout --quiet pr',
  ] as const;

  for (const step of steps) {
    assert.isTrue(Result.isOk(await git(step, dir)));
  }

  const rebased = await git('git rebase main', dir);

  assert.isTrue(Result.isErr(rebased));

  return { dir, output: rebased.value };
};

const read = async (dir: string, file: string): Promise<string> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFile(path.join(dir, file), 'utf8');

const generating = (run: string): RegenerateConfig =>
  ({
    before: [],
    generators: [{ path: /^gen\.txt$/u, run }],
  }) as const;

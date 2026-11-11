import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr, Obj, Result } from 'ts-data-forge';
import { gitOk, makeRepository } from '../../test/index.mjs';
import { git, gitEnv } from './run.mjs';
import { shell } from './shell.mjs';

describe(git, () => {
  test.each([
    { name: 'alone', options: [] },
    // `-c` writes the same variable the pins are in.
    { name: 'after a `-c` of its own', options: ['-c', 'core.abbrev=12'] },
  ] as const)(
    'rebases with the clone configuration pinned ($name)',
    async ({ options }) => {
      const repository = await makeRepository();

      try {
        const { cwd } = repository.place;

        await gitOk(cwd, ['config', 'rebase.updateRefs', 'true']);

        await gitOk(cwd, ['checkout', '--quiet', '-b', 'feature']);

        const first = await repository.commit('a.txt', 'a\n', 'a');

        await gitOk(cwd, ['branch', 'marker', first]);

        await repository.commit('b.txt', 'b\n', 'b');

        await gitOk(cwd, ['checkout', '--quiet', 'main']);

        await repository.commit('main.txt', 'main\n', 'main');

        await gitOk(cwd, ['checkout', '--quiet', 'feature']);

        assert.isTrue(
          Result.isOk(
            await git(cwd, [...options, 'rebase', '--quiet', 'main']),
          ),
        );

        // `rebase.updateRefs` would have moved the branch along.
        assert.strictEqual(await gitOk(cwd, ['rev-parse', 'marker']), first);
      } finally {
        await repository.dispose();
      }
    },
  );

  test.each([
    { name: 'as the clone configures it', pinned: false },
    { name: 'pinned', pinned: true },
  ] as const)(
    'records a stopped cherry-pick in the shared cache only $name',
    async ({ pinned }) => {
      const repository = await makeRepository();

      try {
        const { cwd } = repository.place;

        await gitOk(cwd, ['config', 'rerere.enabled', 'true']);

        await gitOk(cwd, ['checkout', '--quiet', '-b', 'feature']);

        const picked = await repository.commit('base.txt', 'feature\n', 'f');

        await gitOk(cwd, ['checkout', '--quiet', 'main']);

        await repository.commit('base.txt', 'main\n', 'main');

        const args = ['cherry-pick', '--no-commit', picked] as const;

        // The clone's own, in an environment that pins nothing, beside the
        // package's.
        const stopped = pinned
          ? await git(cwd, args)
          : await Result.fromPromise(gitOk(cwd, args, unpinned()));

        assert.isTrue(Result.isErr(stopped));

        const cache = path.resolve(
          cwd,
          await gitOk(cwd, ['rev-parse', '--git-path', 'rr-cache']),
        );

        // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the temporary directory
        const entries = await fs.readdir(cache).catch(() => []);

        assert.strictEqual(Arr.isNonEmpty(entries), !pinned);
      } finally {
        await repository.dispose();
      }
    },
  );
});

describe(gitEnv, () => {
  test('appends the pins to what `-c` gave, so that they win', () => {
    assert.strictEqual(
      gitEnv({ GIT_CONFIG_PARAMETERS: "'rerere.enabled=true'" })[
        'GIT_CONFIG_PARAMETERS'
      ],
      "'rerere.enabled=true' 'rebase.backend=merge' 'rebase.rebaseMerges=false' 'rebase.updateRefs=false' 'rerere.enabled=false'",
    );
  });

  test('wins over an inherited `-c`', async () => {
    const repository = await makeRepository();

    try {
      assert.strictEqual(
        await gitOk(
          repository.place.cwd,
          ['config', '--get', 'rerere.enabled'],
          gitEnv({
            ...unpinned(),
            GIT_CONFIG_PARAMETERS: "'rerere.enabled=true'",
          }),
        ),
        'false',
      );
    } finally {
      await repository.dispose();
    }
  });

  test('reaches a configured shell line', async () => {
    const repository = await makeRepository();

    try {
      await gitOk(repository.place.cwd, ['config', 'rerere.enabled', 'true']);

      assert.deepStrictEqual(
        await shell(repository.place.cwd, 'git config --get rerere.enabled'),
        Result.ok('false\n'),
      );
    } finally {
      await repository.dispose();
    }
  });
});

/** This process's environment without any configuration given through it. */
const unpinned = (): NodeJS.ProcessEnv =>
  Obj.filter(process.env, (_value, key) => !key.startsWith('GIT_CONFIG_'));

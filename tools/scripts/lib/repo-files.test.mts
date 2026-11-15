// cspell:ignore qiita unstub

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { runFile } from './child-process.mjs';
import {
  hasPath,
  isRepositoryProse,
  isSitePage,
  listCheckoutFiles,
  readRootPackageScripts,
  toTree,
} from './repo-files.mjs';

describe(readRootPackageScripts, () => {
  test("reads the root package.json's scripts", async () => {
    const scripts = await readRootPackageScripts();

    assert.isTrue(Result.isOk(scripts));

    assert.isString(scripts.value['check:root:test']);
  });
});

/** Runs `body` in a new, empty git repository, removed afterwards. */
const inRepository = async (
  body: (
    helpers: Readonly<{
      root: string;
      write: (file: string, text?: string) => void;
      git: (args: readonly string[]) => Promise<number | null>;
    }>,
  ) => Promise<void>,
): Promise<void> => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'checkout-files-'));

  try {
    const write = (file: string, text: string = file): void => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.writeFileSync(path.join(root, file), text);
    };

    const git = async (args: readonly string[]): Promise<number | null> => {
      const result = await runFile(
        'git',
        ['-c', 'user.name=t', '-c', 'user.email=t@example.com', ...args],
        { cwd: root },
      );

      return result.status;
    };

    assert.strictEqual(await git(['init', '--quiet']), 0);

    await body({ root, write, git });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
};

describe(listCheckoutFiles, () => {
  test('lists what git does not ignore and is a file on disk', async () => {
    await inRepository(async ({ root, write, git }) => {
      write('.gitignore', '*.log\nworktrees/\n');

      for (const file of [
        'a.txt',
        'sub/b.txt',
        'sub/sparse.txt',
        'sub/kept.txt',
        'gone.txt',
        'swap.txt',
        'was-dir/x.txt',
        '.github/w.yml',
      ]) {
        write(file);
      }

      write('kept.log');

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.symlinkSync('sub', path.join(root, 'dir-link'));

      assert.strictEqual(await git(['add', '.']), 0);

      assert.strictEqual(await git(['add', '--force', 'kept.log']), 0);

      // Deleted, and left out of the working tree as a sparse checkout does.
      fs.rmSync(path.join(root, 'gone.txt'));

      assert.strictEqual(
        await git([
          'update-index',
          '--skip-worktree',
          'sub/sparse.txt',
          'sub/kept.txt',
        ]),
        0,
      );

      fs.rmSync(path.join(root, 'sub/sparse.txt'));

      // A tracked file replaced by a directory, and a directory by a file.
      fs.rmSync(path.join(root, 'swap.txt'));

      write('swap.txt/inner.txt');

      fs.rmSync(path.join(root, 'was-dir'), { recursive: true });

      write('was-dir');

      // Links to nothing: one dangling, one leading round to itself.
      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.symlinkSync('missing.txt', path.join(root, 'dangling'));

      // eslint-disable-next-line security/detect-non-literal-fs-filename -- a temporary fixture.
      fs.symlinkSync('loop', path.join(root, 'loop'));

      // Untracked and not ignored, then ignored by name and by directory.
      for (const file of ['new.txt', 'debug.log', 'worktrees/w/a.txt']) {
        write(file);
      }

      const listed = await listCheckoutFiles({ root });

      assert.isTrue(Result.isOk(listed));

      assert.deepStrictEqual(listed.value, [
        '.github/w.yml',
        '.gitignore',
        'a.txt',
        'kept.log',
        'new.txt',
        'sub/b.txt',
        'sub/kept.txt',
        'swap.txt/inner.txt',
        'was-dir',
      ]);

      const inSub = await listCheckoutFiles({
        select: (file) => file.startsWith('sub/'),
        root,
      });

      assert.isTrue(Result.isOk(inSub));

      assert.deepStrictEqual(inSub.value, ['sub/b.txt', 'sub/kept.txt']);
    });
  });

  test('lists an unmerged path once', async () => {
    await inRepository(async ({ root, write, git }) => {
      write('a.txt', 'base');

      assert.strictEqual(await git(['add', '.']), 0);

      assert.strictEqual(await git(['commit', '--quiet', '-m', 'base']), 0);

      assert.strictEqual(await git(['checkout', '--quiet', '-b', 'other']), 0);

      write('a.txt', 'other');

      assert.strictEqual(await git(['commit', '--quiet', '-am', 'other']), 0);

      assert.strictEqual(await git(['checkout', '--quiet', '-']), 0);

      write('a.txt', 'this');

      assert.strictEqual(await git(['commit', '--quiet', '-am', 'this']), 0);

      // The merge stops at the conflict, with a.txt in three stages.
      assert.notStrictEqual(await git(['merge', '--quiet', 'other']), 0);

      const listed = await listCheckoutFiles({ root });

      assert.isTrue(Result.isOk(listed));

      assert.deepStrictEqual(listed.value, ['a.txt']);
    });
  });

  test('fails with what git says outside a repository', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'checkout-files-'));

    // git stops looking for a repository above the temporary directory, and
    // says why in English.
    vi.stubEnv('GIT_CEILING_DIRECTORIES', path.dirname(root));

    vi.stubEnv('LC_ALL', 'C');

    try {
      const listed = await listCheckoutFiles({ root });

      assert.isTrue(Result.isErr(listed));

      assert.isTrue(
        listed.value.startsWith('Failed to list the files of the checkout: '),
      );

      assert.include(listed.value, 'not a git repository');
    } finally {
      vi.unstubAllEnvs();

      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  test("lists the repository's own files by default", async () => {
    const listed = await listCheckoutFiles();

    assert.isTrue(Result.isOk(listed));

    assert.include(listed.value, 'package.json');
  });
});

describe('toTree and hasPath', () => {
  const tree = toTree(['libs/pkg/src/a.mts', 'README.md']);

  test('has every tracked file and every directory that holds one', () => {
    assert.deepStrictEqual(
      ['libs', 'libs/pkg', 'libs/pkg/src', 'libs/pkg/src/a.mts'].filter(
        (p) => !hasPath(tree, p),
      ),
      [],
    );

    assert.isTrue(hasPath(tree, 'README.md'));
  });

  test('has nothing else, a prefix of a name included', () => {
    assert.deepStrictEqual(
      ['libs/pkg/src/a', 'libs/pk', 'libs/pkg/', ''].filter((p) =>
        hasPath(tree, p),
      ),
      [],
    );
  });
});

describe('isRepositoryProse', () => {
  test('reads the Markdown the repository keeps up to date', () => {
    assert.deepStrictEqual(
      [
        'CLAUDE.md',
        'docs/checks-over-fixes.md',
        'libs/synstate/README.md',
        'apps/synstate-docs/src/content/docs/index.mdx',
        '.github/workflows/README.md',
        'repo-settings/README.md',
        'languages/sumi/docs/decisions.md',
        'tools/configs/README.md',
        'strict-lib/README.md',
      ].filter((p) => !isRepositoryProse(p)),
      [],
    );
  });

  test('leaves out what is not Markdown', () => {
    assert.isFalse(isRepositoryProse('docs/a.mts'));

    assert.isFalse(isRepositoryProse('README.txt'));
  });

  test('leaves out history, records and what is never edited', () => {
    assert.deepStrictEqual(
      [
        'libs/synstate/CHANGELOG.md',
        'libs/eslint-config-typed/docs/reports/a.md',
        'libs/ts-fortress/documents/implementation/update-reports/a.md',
        'libs/ts-fortress/documents/implementation/prompts/a.md',
        'strict-lib/docs/work-log/2026-05-17-a.md',
        'libs/ts-type-forge/design-docs/length-constrained-array-report.md',
        'strict-lib/v7.0/output/lib/README.md',
        'docs/json-spec/a.md',
        'docs/rust_book/a.md',
        'docs/typescript_book/a.md',
        'docs/blog/a.md',
        'docs/qiita/a.md',
        'docs/marp-slides/a/b.md',
        'docs/reveal-slides/a/b.md',
        'docs/monorepo-consolidation.md',
        'experimental/packages/a/README.md',
        'articles/a.md',
        'books/a/b.md',
      ].filter(isRepositoryProse),
      [],
    );
  });

  test('reads a document merely named like a record directory', () => {
    assert.isTrue(isRepositoryProse('docs/reports.md'));
  });
});

describe('isSitePage', () => {
  test('is Markdown under an app’s src/', () => {
    assert.isTrue(isSitePage('apps/synstate-docs/src/content/docs/a.md'));

    assert.isTrue(isSitePage('apps/profile/src/assets/biography.mdx'));

    assert.isFalse(isSitePage('apps/synstate-docs/README.md'));

    assert.isFalse(isSitePage('libs/synstate/src/a.md'));
  });
});

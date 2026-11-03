import * as fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { $ } from './exec-async.mjs';
import { checkShouldRun, checkShouldRunTypeChecks } from './should-run.mjs';

describe('should-run', () => {
  /**
   * Creates a repository with one commit holding `deletedFiles`, then writes
   * `changedFiles` and deletes `deletedFiles` on top of it (staged, not
   * committed, which `git diff <base>` reports all the same), and runs `check`
   * from the repository root.
   *
   * Each file holds its own path by default, so git pairs no deleted file with
   * an added one as a rename; a test that wants a rename passes a `contentOf`
   * that gives them the same content.
   */
  const withChangedFiles = async <T,>(
    changedFiles: readonly string[],
    check: (repoRoot: string) => Promise<T>,
    deletedFiles: readonly string[] = [],
    contentOf: (file: string) => string = (file) => `${file}\n`,
  ): Promise<T> => {
    const repoPath = await fs.mkdtemp(path.join(tmpdir(), 'should-run-'));

    const originalCwd = process.cwd();

    try {
      process.chdir(repoPath);

      await $(
        [
          'git init --initial-branch=main',
          'git config user.name "Test User"',
          'git config user.email "test@example.com"',
          // The machine running the tests may sign commits by default, which
          // needs a key this repository does not have.
          'git config commit.gpgsign false',
        ].join(' && '),
        { silent: true },
      );

      await writeFiles(repoPath, deletedFiles, contentOf);

      await $(
        'git add --all && git commit --allow-empty -m "initial commit" --no-verify',
        { silent: true },
      );

      await Promise.all(
        deletedFiles.map(async (file) => fs.rm(path.join(repoPath, file))),
      );

      await writeFiles(repoPath, changedFiles, contentOf);

      await $('git add --all', { silent: true });

      return await check(repoPath);
    } finally {
      process.chdir(originalCwd);

      await fs.rm(repoPath, { recursive: true, force: true });
    }
  };

  const writeFiles = async (
    repoPath: string,
    files: readonly string[],
    contentOf: (file: string) => string,
  ): Promise<void> => {
    await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(repoPath, file);

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        await fs.writeFile(filePath, contentOf(file));
      }),
    );
  };

  describe(checkShouldRun, () => {
    test('should report false when every changed file is ignored', async () => {
      const result = await withChangedFiles(
        ['experimental/a/b.mts', 'experimental/c.md'],
        async () =>
          checkShouldRun({
            pathsIgnore: ['experimental/'],
            baseBranch: 'HEAD',
          }),
      );

      assert.isFalse(result);
    });

    test('should report true when one changed file is not ignored', async () => {
      const result = await withChangedFiles(
        ['experimental/a/b.mts', 'libs/x/src/a.mts'],
        async () =>
          checkShouldRun({
            pathsIgnore: ['experimental/'],
            baseBranch: 'HEAD',
          }),
      );

      assert.isTrue(result);
    });

    test('should report true when nothing is ignored', async () => {
      const result = await withChangedFiles(['experimental/a.mts'], async () =>
        checkShouldRun({ baseBranch: 'HEAD' }),
      );

      assert.isTrue(result);
    });

    test('should report false when nothing changed', async () => {
      const result = await withChangedFiles([], async () =>
        checkShouldRun({ pathsIgnore: ['experimental/'], baseBranch: 'HEAD' }),
      );

      assert.isFalse(result);
    });

    test('should match patterns against repository-relative paths', async () => {
      // Every pattern kind at once: an exact file name, a directory prefix, an
      // extension glob, and a glob with a wildcard segment. All four are
      // relative to the repository root, so a file outside `docs/` is not
      // ignored by the `docs/` pattern even though its own path contains it.
      const result = await withChangedFiles(
        ['LICENSE', 'docs/a.yml', 'a/b.md', 'libs/x/docs/note.yml'],
        async () =>
          checkShouldRun({
            pathsIgnore: ['LICENSE', 'docs/', '**.md', 'libs/*/docs/**'],
            baseBranch: 'HEAD',
          }),
      );

      assert.isFalse(result);
    });

    test('should not ignore a file that only shares a prefix with a directory pattern', async () => {
      const result = await withChangedFiles(['docs-site/a.yml'], async () =>
        checkShouldRun({ pathsIgnore: ['docs/'], baseBranch: 'HEAD' }),
      );

      assert.isTrue(result);
    });

    test('should match dotfiles', async () => {
      const result = await withChangedFiles(
        ['.changeset/happy-pandas-sing.md', '.editorconfig'],
        async () =>
          checkShouldRun({
            pathsIgnore: ['**.md', '.editorconfig'],
            baseBranch: 'HEAD',
          }),
      );

      assert.isFalse(result);
    });

    test('should report true when the diff only deletes a file', async () => {
      // A deletion is a change the gated step has to see: whatever still
      // imports the deleted module no longer builds.
      const result = await withChangedFiles(
        [],
        async () =>
          checkShouldRun({
            pathsIgnore: ['experimental/'],
            baseBranch: 'HEAD',
          }),
        ['libs/x/src/foo.mts'],
      );

      assert.isTrue(result);
    });

    test('should report true when a file is deleted beside an ignored change', async () => {
      const result = await withChangedFiles(
        ['README.md'],
        async () =>
          checkShouldRun({ pathsIgnore: ['**.md'], baseBranch: 'HEAD' }),
        ['libs/x/src/foo.mts'],
      );

      assert.isTrue(result);
    });

    test('should report true when a file is moved into an ignored directory', async () => {
      // The same content in both files, so git pairs the deleted source with
      // the added destination as a rename.
      const result = await withChangedFiles(
        ['docs/foo.mts'],
        async () =>
          checkShouldRun({ pathsIgnore: ['docs/'], baseBranch: 'HEAD' }),
        ['libs/x/src/foo.mts'],
        () => 'export const foo = 1;\n',
      );

      assert.isTrue(result);
    });

    test('should read a deleted file with a non-ASCII name as it is on disk', async () => {
      // Quoted and escaped as git prints it without `-z`, the name would no
      // longer match `docs/` and the step would run.
      const result = await withChangedFiles(
        [],
        async () =>
          checkShouldRun({ pathsIgnore: ['docs/'], baseBranch: 'HEAD' }),
        ['docs/日本語.yml'],
      );

      assert.isFalse(result);
    });

    test('should match a deleted file against the ignored patterns', async () => {
      const result = await withChangedFiles(
        ['README.md'],
        async () =>
          checkShouldRun({
            pathsIgnore: ['docs/', '**.md'],
            baseBranch: 'HEAD',
          }),
        ['docs/old.yml', 'docs/日本語.yml'],
      );

      assert.isFalse(result);
    });

    test('should write the result to GITHUB_OUTPUT', async () => {
      const contents = await withChangedFiles(
        ['experimental/a.mts'],
        async (repoPath) => {
          const outputPath = path.join(repoPath, 'github-output.txt');

          vi.stubEnv('GITHUB_OUTPUT', outputPath);

          try {
            await checkShouldRun({
              pathsIgnore: ['experimental/'],
              baseBranch: 'HEAD',
            });

            // eslint-disable-next-line security/detect-non-literal-fs-filename
            return await fs.readFile(outputPath, 'utf8');
          } finally {
            vi.unstubAllEnvs();
          }
        },
      );

      assert.strictEqual(contents, 'should_run=false\n');
    });
  });

  describe(checkShouldRunTypeChecks, () => {
    test('should ignore documentation and tooling configuration by default', async () => {
      const result = await withChangedFiles(
        ['README.md', 'LICENSE', 'docs/design.md', '.prettierrc', 'notes.txt'],
        async () => checkShouldRunTypeChecks({ baseBranch: 'HEAD' }),
      );

      assert.isFalse(result);
    });

    test('should report true when a source file changed', async () => {
      const result = await withChangedFiles(
        ['README.md', 'libs/x/src/a.mts'],
        async () => checkShouldRunTypeChecks({ baseBranch: 'HEAD' }),
      );

      assert.isTrue(result);
    });

    test('should report true when the diff only deletes a source file', async () => {
      const result = await withChangedFiles(
        [],
        async () => checkShouldRunTypeChecks({ baseBranch: 'HEAD' }),
        ['libs/x/src/a.mts'],
      );

      assert.isTrue(result);
    });

    test('should replace the default ignore list when pathsIgnore is given', async () => {
      const result = await withChangedFiles(['README.md'], async () =>
        checkShouldRunTypeChecks({
          pathsIgnore: ['experimental/'],
          baseBranch: 'HEAD',
        }),
      );

      assert.isTrue(result);
    });
  });
});

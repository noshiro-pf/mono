import dedent from 'dedent';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { defineImportProbe } from './eslint-import-probe.mjs';

describe(defineImportProbe, () => {
  test('returns the lines no-restricted-imports reports, and only those', async () => {
    await withPackage(async (packageRoot) => {
      const probe = defineImportProbe({
        packageRoot,
        sourcePath: 'src/a.mjs',
      });

      const lines = await probe(dedent`
        import { a } from 'allowed';
        import { b } from 'refused';
      `);

      assert.deepStrictEqual(lines, [2]);
    });
  }, 60_000);

  test('lints under the path given, which the config globs decide by', async () => {
    await withPackage(async (packageRoot) => {
      const probe = defineImportProbe({
        packageRoot,
        sourcePath: 'src/a.mjs',
      });

      const lines = await probe("import { b } from 'refused';", 'other.mjs');

      assert.deepStrictEqual(lines, []);
    });
  }, 60_000);

  test('throws on a probe that does not parse', async () => {
    await withPackage(async (packageRoot) => {
      const probe = defineImportProbe({
        packageRoot,
        sourcePath: 'src/a.mjs',
      });

      await expect(probe("import { b from 'refused';")).rejects.toThrow(
        /was not linted:\n {2}1:\d+ Parsing error/u,
      );
    });
  }, 60_000);

  test('throws on a path an existing file occupies', async () => {
    await withPackage(async (packageRoot) => {
      // A path the config lints, so that only the existence check refuses it.
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(path.join(packageRoot, 'src'));

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(path.join(packageRoot, 'src/existing.mjs'), '');

      const probe = defineImportProbe({
        packageRoot,
        sourcePath: 'src/existing.mjs',
      });

      await expect(probe("import { b } from 'refused';")).rejects.toThrow(
        /src\/existing\.mjs exists; name one where nothing does/u,
      );
    });
  }, 60_000);

  test('lints under an existing path listed in existingPaths', async () => {
    await withPackage(async (packageRoot) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(path.join(packageRoot, 'src'));

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(path.join(packageRoot, 'src/existing.mjs'), '');

      const probe = defineImportProbe({
        packageRoot,
        sourcePath: 'src/a.mjs',
        existingPaths: ['src/existing.mjs'],
      });

      const lines = await probe(
        "import { b } from 'refused';",
        'src/existing.mjs',
      );

      assert.deepStrictEqual(lines, [1]);
    });
  }, 60_000);

  test('throws on a path listed in existingPaths where nothing is', async () => {
    await withPackage(async (packageRoot) => {
      const probe = defineImportProbe({
        packageRoot,
        sourcePath: 'src/a.mjs',
        existingPaths: ['src/gone.mjs'],
      });

      await expect(
        probe("import { b } from 'refused';", 'src/gone.mjs'),
      ).rejects.toThrow(
        /src\/gone\.mjs is in existingPaths and does not exist/u,
      );
    });
  }, 60_000);

  test('throws on a path the config ignores', async () => {
    await withPackage(async (packageRoot) => {
      const probe = defineImportProbe({
        packageRoot,
        sourcePath: 'src/ignored/a.mjs',
      });

      await expect(probe("import { b } from 'refused';")).rejects.toThrow(
        /was not linted:\n {2}File ignored/u,
      );
    });
  }, 60_000);
});

/** Runs `run` in a package of its own, so that no package's real config is read. */
const withPackage = async (
  run: (packageRoot: string) => Promise<void>,
): Promise<void> => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'eslint-import-probe-'));

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(
      path.join(root, 'eslint.config.mjs'),
      dedent`
        export default [
          { ignores: ['src/ignored/**'] },
          {
            files: ['src/**'],
            rules: {
              'no-restricted-imports': ['error', 'refused'],
              'no-unused-vars': 'error',
            },
          },
        ];
      `,
    );

    await run(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
};

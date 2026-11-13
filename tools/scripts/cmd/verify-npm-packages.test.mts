import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  findOrphanedSmokeSources,
  generatedFilesGlob,
  publishablePackagesOf,
  refreshPublishedChecks,
  removeStaleProjects,
  spacesToPrune,
  writeCheckCopy,
} from './verify-npm-packages.mjs';

describe(removeStaleProjects, () => {
  test('removes the project of a package that is no longer checked', async () => {
    const { spaceDir, packagesDir } = await makeSpace(['kept', 'gone']);

    const removed = await removeStaleProjects(spaceDir, ['kept']);

    assert.deepStrictEqual(removed, ['gone']);

    assert.deepStrictEqual(await listNames(packagesDir), ['kept']);
  });

  test('keeps every project of a package it is told about', async () => {
    const { spaceDir, packagesDir } = await makeSpace(['a', 'b']);

    const removed = await removeStaleProjects(spaceDir, ['a', 'b', 'c']);

    assert.deepStrictEqual(removed, []);

    assert.deepStrictEqual(await listNames(packagesDir), ['a', 'b']);
  });

  test('removes a stray file as well as a directory', async () => {
    const { spaceDir, packagesDir } = await makeSpace(['a']);

    await writeEmptyJson(path.join(packagesDir, 'stray.json'));

    const removed = await removeStaleProjects(spaceDir, ['a']);

    assert.deepStrictEqual(removed, ['stray.json']);

    assert.deepStrictEqual(await listNames(packagesDir), ['a']);
  });

  test('looks inside the directory of a scope it is told about', async () => {
    const { spaceDir, packagesDir } = await makeSpace([
      '@scope/kept',
      '@scope/gone',
      '@other/gone',
    ]);

    const removed = await removeStaleProjects(spaceDir, ['@scope/kept']);

    assert.deepStrictEqual(removed, ['@other/gone', '@scope/gone']);

    assert.deepStrictEqual(await listNames(packagesDir), ['@scope']);

    assert.deepStrictEqual(await listNames(path.join(packagesDir, '@scope')), [
      'kept',
    ]);
  });

  test('removes a scope directory left with no project', async () => {
    const { spaceDir, packagesDir } = await makeSpace(['@scope/gone', 'kept']);

    const removed = await removeStaleProjects(spaceDir, ['@scope/new', 'kept']);

    assert.deepStrictEqual(removed, ['@scope/gone']);

    assert.deepStrictEqual(await listNames(packagesDir), ['kept']);
  });

  test('names the projects of a scope no package is in, not the scope', async () => {
    const { spaceDir, packagesDir } = await makeSpace([
      '@old/x',
      '@old/y',
      'kept',
    ]);

    const removed = await removeStaleProjects(spaceDir, ['kept']);

    assert.deepStrictEqual(removed, ['@old/x', '@old/y']);

    assert.deepStrictEqual(await listNames(packagesDir), ['kept']);
  });

  test('leaves a scope directory that holds no project, known or not', async () => {
    const { spaceDir, packagesDir } = await makeSpace(['kept']);

    for (const scope of ['@scope', '@old']) {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.mkdir(path.join(packagesDir, scope));
    }

    const removed = await removeStaleProjects(spaceDir, ['@scope/new', 'kept']);

    assert.deepStrictEqual(removed, []);

    assert.deepStrictEqual(await listNames(packagesDir), [
      '@old',
      '@scope',
      'kept',
    ]);
  });

  test('removes a stray file whose name starts like a scope', async () => {
    const { spaceDir, packagesDir } = await makeSpace(['kept']);

    await writeEmptyJson(path.join(packagesDir, '@stray'));

    const removed = await removeStaleProjects(spaceDir, ['kept']);

    assert.deepStrictEqual(removed, ['@stray']);

    assert.deepStrictEqual(await listNames(packagesDir), ['kept']);
  });

  test('fails rather than removing nothing when packages/ cannot be read', async () => {
    const { spaceDir, packagesDir } = await makeSpace([]);

    // A file where the directory should be: `readdir` fails with `ENOTDIR`.
    await writeEmptyJson(packagesDir);

    await expect(removeStaleProjects(spaceDir, ['a'])).rejects.toThrow(
      /ENOTDIR/u,
    );
  });

  test('does nothing when the space has no packages directory yet', async () => {
    const { spaceDir } = await makeSpace([]);

    assert.deepStrictEqual(await removeStaleProjects(spaceDir, ['a']), []);
  });
});

describe(spacesToPrune, () => {
  test('a local run prunes both spaces, the local one first', () => {
    assert.deepStrictEqual(spacesToPrune('local'), ['local', 'published']);
  });

  test('a published run prunes only its own space, never local', () => {
    assert.deepStrictEqual(spacesToPrune('published'), ['published']);
  });
});

describe(publishablePackagesOf, () => {
  test('keeps the packages not marked private, sorted by name', () => {
    const result = publishablePackagesOf([
      workspacePackage('b', {}),
      workspacePackage('hidden', { private: true }),
      workspacePackage('a', { private: false }),
    ]);

    assert.isTrue(Result.isOk(result));

    assert.deepStrictEqual(
      result.value.map(({ name }) => name),
      ['a', 'b'],
    );
  });

  test('fails when the workspace holds no publishable package', () => {
    const result = publishablePackagesOf([
      workspacePackage('hidden', { private: true }),
    ]);

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, 'No publishable package');
  });

  test('refuses a scoped package, naming what does not support one (#4035)', () => {
    const result = publishablePackagesOf([
      workspacePackage('a', {}),
      workspacePackage('@scope/b', {}),
      workspacePackage('@scope/hidden', { private: true }),
    ]);

    assert.isTrue(Result.isErr(result));

    assert.include(result.value, '@scope/b');

    assert.notInclude(result.value, '@scope/hidden');

    for (const place of ['packAll', 'smokeFileName', 'pnpm-update.yml']) {
      assert.include(result.value, place);
    }
  });
});

describe(writeCheckCopy, () => {
  test('leaves the check a published project already has', async () => {
    const file = path.join(await makeTempDir(), 'pkg.mjs');

    await writeText(file, 'committed\n');

    await writeCheckCopy('published', file, 'current\n');

    assert.strictEqual(await readText(file), 'committed\n');
  });

  test('writes the check of a published project that has none', async () => {
    const file = path.join(await makeTempDir(), 'pkg.mjs');

    await writeCheckCopy('published', file, 'current\n');

    assert.strictEqual(await readText(file), 'current\n');
  });

  test('overwrites the check of a local project', async () => {
    const file = path.join(await makeTempDir(), 'pkg.mjs');

    await writeText(file, 'committed\n');

    await writeCheckCopy('local', file, 'current\n');

    assert.strictEqual(await readText(file), 'current\n');
  });

  test('fails rather than overwriting a check it cannot look at', async () => {
    const notADirectory = path.join(await makeTempDir(), 'file');

    await writeText(notADirectory, '');

    // `ENOTDIR`, which is not the file being absent — and from the look at the
    // file, not from a write that went ahead and failed the same way.
    await expect(
      writeCheckCopy(
        'published',
        path.join(notADirectory, 'pkg.mjs'),
        'current\n',
      ),
    ).rejects.toThrow(/ENOTDIR: not a directory, access/u);
  });
});

describe(generatedFilesGlob, () => {
  test('formats every file a local generation writes', () => {
    assert.strictEqual(
      generatedFilesGlob('local', '/space'),
      '/space/**/*.{json,mjs,mts,yaml}',
    );
  });

  test("leaves a published project's check out of what is formatted", () => {
    assert.strictEqual(
      generatedFilesGlob('published', '/space'),
      '/space/**/*.{json,yaml}',
    );
  });
});

describe(refreshPublishedChecks, () => {
  test('replaces the copy with a new check that passes', async () => {
    const { spaceDir, smokeDir, copy } = await makeCheck('pkg', {
      committed: 'committed\n',
      current: 'current\n',
    });

    const mut_ran: string[] = [];

    const kept = await refreshPublishedChecks(spaceDir, [pkgNamed('pkg')], {
      smokeDir,
      runCheck: async (_, pkg) => {
        mut_ran.push(`${pkg.name}: ${await readText(copy)}`);

        return Result.ok(undefined);
      },
    });

    assert.deepStrictEqual(kept, []);

    // The check that ran is the new one, in the project's own file.
    assert.deepStrictEqual(mut_ran, ['pkg: current\n']);

    assert.strictEqual(await readText(copy), 'current\n');
  });

  test('leaves the committed bytes when the new check fails', async () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => {});

    onTestFinished(() => {
      info.mockRestore();
    });

    const { spaceDir, smokeDir, copy } = await makeCheck('pkg', {
      committed: 'committed\n',
      current: 'current\n',
    });

    const mut_ran: string[] = [];

    const kept = await refreshPublishedChecks(spaceDir, [pkgNamed('pkg')], {
      smokeDir,
      runCheck: async () => {
        mut_ran.push(await readText(copy));

        return Result.err('does not provide an export named x');
      },
    });

    assert.deepStrictEqual(kept, ['pkg']);

    assert.deepStrictEqual(mut_ran, ['current\n']);

    assert.strictEqual(await readText(copy), 'committed\n');

    // What the check reported is printed with the notice, for whoever reads why
    // the copy stays behind.
    expect(info).toHaveBeenCalledWith(
      expect.stringMatching(
        /kept the committed check of pkg.*\n\s+does not provide an export named x$/u,
      ),
    );
  });

  test('leaves the committed bytes when running the new check throws', async () => {
    const { spaceDir, smokeDir, copy } = await makeCheck('pkg', {
      committed: 'committed\n',
      current: 'current\n',
    });

    await expect(
      refreshPublishedChecks(spaceDir, [pkgNamed('pkg')], {
        smokeDir,
        // Thrown before any promise exists, which a handler on the returned
        // promise alone would miss.
        runCheck: () => {
          throw new Error('spawn failed');
        },
      }),
    ).rejects.toThrow('spawn failed');

    assert.strictEqual(await readText(copy), 'committed\n');
  });

  test('does not run a check that is already the one under smoke/', async () => {
    const { spaceDir, smokeDir, copy } = await makeCheck('pkg', {
      committed: 'same\n',
      current: 'same\n',
    });

    const mut_ran: string[] = [];

    const kept = await refreshPublishedChecks(spaceDir, [pkgNamed('pkg')], {
      smokeDir,
      runCheck: (_, pkg) => {
        mut_ran.push(pkg.name);

        return Promise.resolve(Result.ok(undefined));
      },
    });

    assert.deepStrictEqual(kept, []);

    assert.deepStrictEqual(mut_ran, []);

    assert.strictEqual(await readText(copy), 'same\n');
  });

  test('reads the one check the strict standard libraries share', async () => {
    const spaceDir = await makeTempDir();

    const smokeDir = await makeTempDir();

    const copy = path.join(
      spaceDir,
      'packages',
      'strict-ts-lib-v7.0',
      'strict-ts-lib-v7.0.mts',
    );

    await writeText(copy, 'committed\n');

    await writeText(path.join(smokeDir, 'strict-ts-lib.mts'), 'current\n');

    const kept = await refreshPublishedChecks(
      spaceDir,
      [pkgNamed('strict-ts-lib-v7.0')],
      { smokeDir, runCheck: () => Promise.resolve(Result.ok(undefined)) },
    );

    assert.deepStrictEqual(kept, []);

    assert.strictEqual(await readText(copy), 'current\n');
  });
});

const pkgNamed = (
  name: string,
): Readonly<{ name: string; path: string; manifest: null }> =>
  ({ name, path: '', manifest: null }) as const;

const makeTempDir = async (): Promise<string> => {
  const dir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'verify-npm-packages-test-'),
  );

  onTestFinished(async () => {
    await fs.rm(dir, { recursive: true, force: true });
  });

  return dir;
};

const writeText = async (file: string, content: string): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(path.dirname(file), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(file, content);
};

/** A published project holding `committed`, and a `smoke/` holding `current`. */
const makeCheck = async (
  name: string,
  { committed, current }: Readonly<{ committed: string; current: string }>,
): Promise<Readonly<{ spaceDir: string; smokeDir: string; copy: string }>> => {
  const spaceDir = await makeTempDir();

  const smokeDir = await makeTempDir();

  const copy = path.join(spaceDir, 'packages', name, `${name}.mjs`);

  await writeText(copy, committed);

  await writeText(path.join(smokeDir, `${name}.mjs`), current);

  return { spaceDir, smokeDir, copy };
};

const readText = (file: string): Promise<string> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readFile(file, 'utf8');

const workspacePackage = (
  name: string,
  packageJson: ReadonlyRecord<string, boolean>,
): Parameters<typeof publishablePackagesOf>[0][number] =>
  ({
    name,
    path: `/workspace/${name}`,
    packageJson,
    dependencies: {},
  }) as const;

const writeEmptyJson = async (file: string): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(file, '{}\n');
};

/** A space whose `packages/` holds one project directory per name, if any. */
const makeSpace = async (
  projects: readonly string[],
): Promise<Readonly<{ spaceDir: string; packagesDir: string }>> => {
  const spaceDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'verify-npm-packages-test-'),
  );

  onTestFinished(async () => {
    await fs.rm(spaceDir, { recursive: true, force: true });
  });

  const packagesDir = path.join(spaceDir, 'packages');

  for (const name of projects) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.mkdir(path.join(packagesDir, name), { recursive: true });

    await writeEmptyJson(path.join(packagesDir, name, 'package.json'));
  }

  return { spaceDir, packagesDir };
};

const listNames = async (dir: string): Promise<readonly string[]> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const names = await fs.readdir(dir);

  return names.toSorted();
};

describe(findOrphanedSmokeSources, () => {
  test('names a check no publishable package uses, and nothing else', () => {
    assert.deepStrictEqual(
      findOrphanedSmokeSources(
        [
          'ts-data-forge.mjs',
          'old-name.mjs',
          'strict-ts-lib.mts',
          'ts-type-forge.mts',
          'README.md',
        ],
        ['ts-data-forge', 'strict-ts-lib-v7.0', 'ts-type-forge'],
      ),
      ['old-name.mjs'],
    );
  });

  test('names the shared strict-lib check when no strict-lib package is left', () => {
    assert.deepStrictEqual(
      findOrphanedSmokeSources(['strict-ts-lib.mts'], ['ts-data-forge']),
      ['strict-ts-lib.mts'],
    );
  });
});

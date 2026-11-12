import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import type { ReadonlyRecord } from 'ts-type-forge';
import {
  findOrphanedSmokeSources,
  publishablePackagesOf,
  removeStaleProjects,
  spacesToPrune,
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
});

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

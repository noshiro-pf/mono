import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { removeStaleProjects } from './verify-npm-packages.mjs';

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

    assert.deepStrictEqual(removed, ['@other', '@scope/gone']);

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

  test('removes nothing when told about no package at all', async () => {
    const { spaceDir, packagesDir } = await makeSpace(['a']);

    assert.deepStrictEqual(await removeStaleProjects(spaceDir, []), []);

    assert.deepStrictEqual(await listNames(packagesDir), ['a']);
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

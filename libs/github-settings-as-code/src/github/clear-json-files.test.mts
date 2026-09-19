import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { clearJsonFilesIn } from './clear-json-files.mjs';

const makeDir = async (): Promise<string> =>
  fs.mkdtemp(path.join(os.tmpdir(), 'clear-json-files-'));

/** 途中のディレクトリごと作って書く。入れ子の fixture もこれで用意する。 */
const write = async (filePath: string, content: string): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(filePath, content);
};

const namesIn = async (dir: string): Promise<readonly string[]> =>
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  fs.readdir(dir).then((names) => names.toSorted());

describe(clearJsonFilesIn, () => {
  test('removes the json files directly under the directory', async () => {
    const dir = await makeDir();

    await write(path.join(dir, 'main.json'), '{}');

    await write(path.join(dir, 'release.json'), '{}');

    await clearJsonFilesIn(dir);

    assert.deepStrictEqual(await namesIn(dir), []);
  });

  test('keeps a file that is not json, so a README beside the declarations survives', async () => {
    const dir = await makeDir();

    await write(path.join(dir, 'settings.json'), '{}');

    await write(path.join(dir, 'README.md'), '# notes');

    await clearJsonFilesIn(dir);

    assert.deepStrictEqual(await namesIn(dir), ['README.md']);
  });

  test('does not descend into a subdirectory', async () => {
    const dir = await makeDir();

    await write(path.join(dir, 'nested', 'deep.json'), '{}');

    await clearJsonFilesIn(dir);

    assert.deepStrictEqual(await namesIn(dir), ['nested']);

    assert.deepStrictEqual(await namesIn(path.join(dir, 'nested')), [
      'deep.json',
    ]);
  });

  test('creates the directory when it does not exist', async () => {
    const dir = path.join(await makeDir(), 'not-yet');

    await clearJsonFilesIn(dir);

    assert.deepStrictEqual(await namesIn(dir), []);
  });

  test('is a no-op on a directory holding no json', async () => {
    const dir = await makeDir();

    await write(path.join(dir, 'README.md'), '# notes');

    await clearJsonFilesIn(dir);

    assert.deepStrictEqual(await namesIn(dir), ['README.md']);
  });
});

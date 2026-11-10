import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { listJsonFilesIn } from './list-json-files.mjs';

const makeDir = async (): Promise<string> =>
  fs.mkdtemp(path.join(os.tmpdir(), 'list-json-files-'));

/** 途中のディレクトリごと作って書く。入れ子の fixture もこれで用意する。 */
const write = async (filePath: string, content: string): Promise<void> => {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(filePath, content);
};

describe(listJsonFilesIn, () => {
  test('lists the json files directly under the directory, and nothing beside them', async () => {
    const dir = await makeDir();

    await write(path.join(dir, 'main.json'), '{}');

    await write(path.join(dir, 'release.json'), '{}');

    await write(path.join(dir, 'README.md'), '# notes');

    await write(path.join(dir, 'nested', 'deep.json'), '{}');

    const files = await listJsonFilesIn(dir);

    assert.deepStrictEqual(files.toSorted(), [
      path.join(dir, 'main.json'),
      path.join(dir, 'release.json'),
    ]);
  });

  test('is empty for a directory holding no json', async () => {
    const dir = await makeDir();

    await write(path.join(dir, 'README.md'), '# notes');

    assert.deepStrictEqual(await listJsonFilesIn(dir), []);
  });

  test('is empty for a directory that does not exist', async () => {
    const dir = await makeDir();

    assert.deepStrictEqual(await listJsonFilesIn(path.join(dir, 'absent')), []);
  });

  test('still throws for a path that is a file', async () => {
    const dir = await makeDir();

    await write(path.join(dir, 'file.json'), '{}');

    await expect(listJsonFilesIn(path.join(dir, 'file.json'))).rejects.toThrow(
      'ENOTDIR',
    );
  });
});

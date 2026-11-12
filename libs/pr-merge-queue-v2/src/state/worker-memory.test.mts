import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import { readTextFile } from './files.mjs';
import { replaceFile, workerMemoryPath } from './worker-memory.mjs';

describe(replaceFile, () => {
  test('writes the file whole, making its directory, and leaves no temporary file', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'mq-v2-memory-'));

    onTestFinished(async () => {
      await fs.rm(root, { recursive: true, force: true });
    });

    const file = workerMemoryPath(root, { owner: 'o', name: 'n' });

    assert.deepStrictEqual(
      await replaceFile(file, 'one'),
      Result.ok(undefined),
    );

    assert.deepStrictEqual(
      await replaceFile(file, 'two'),
      Result.ok(undefined),
    );

    assert.deepStrictEqual(await readTextFile(file), Result.ok('two'));

    // eslint-disable-next-line security/detect-non-literal-fs-filename -- under the temporary directory
    assert.deepStrictEqual(await fs.readdir(path.dirname(file)), ['n.json']);
  });
});

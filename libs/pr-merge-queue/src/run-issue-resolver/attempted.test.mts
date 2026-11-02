import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import { Result } from 'ts-data-forge';
import {
  attemptedFile,
  attemptedRecorder,
  loadAttempted,
  recordAttempted,
} from './attempted.mjs';

/** Runs `run` with a directory of its own, then removes it. */
const withDir = async (run: (dir: string) => Promise<void>): Promise<void> => {
  const made = await fs.mkdtemp(path.join(os.tmpdir(), 'attempted-'));

  await run(made).finally(() => fs.rm(made, { recursive: true, force: true }));
};

describe(attemptedFile, () => {
  test('names the repository, a directory per owner', () => {
    assert.strictEqual(
      attemptedFile('/state', { owner: 'o', name: 'r' }),
      '/state/run-issue-resolver/o/r.json',
    );
  });
});

describe(loadAttempted, () => {
  test('reads no file as nothing attempted', async () => {
    await withDir(async (dir) => {
      const loaded = await loadAttempted(path.join(dir, 'none.json'));

      assert.deepStrictEqual(
        Result.unwrapOkOr(loaded, undefined),
        new Map<number, string | undefined>(),
      );
    });
  });

  test('reads back what was recorded, an unread state included', async () => {
    await withDir(async (dir) => {
      const file = path.join(dir, 'nested', 'attempted.json');

      assert.isTrue(
        Result.isOk(await recordAttempted(file, 12, '2026-10-15T00:00:00Z')),
      );

      // As another run of the command would, knowing nothing of #12.
      const recorded = await recordAttempted(file, 7, undefined);

      const expected = new Map<number, string | undefined>([
        [12, '2026-10-15T00:00:00Z'],
        [7, undefined],
      ]);

      assert.deepStrictEqual(Result.unwrapOkOr(recorded, undefined), expected);

      assert.deepStrictEqual(
        Result.unwrapOkOr(await loadAttempted(file), undefined),
        expected,
      );
    });
  });

  test('refuses a path it cannot reach, rather than reading it as none', async () => {
    await withDir(async (dir) => {
      const blocker = path.join(dir, 'file');

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(blocker, '');

      // Under a file, not a directory: ENOTDIR rather than ENOENT.
      const loaded = await loadAttempted(path.join(blocker, 'attempted.json'));

      assert.isTrue(Result.isErr(loaded));

      assert.include(Result.unwrapErrOr(loaded, ''), 'remove the file');
    });
  });

  test('refuses a file it cannot read, and says how to start over', async () => {
    await withDir(async (dir) => {
      const file = path.join(dir, 'attempted.json');

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(file, '{"attempted": {"12": 3}}');

      const loaded = await loadAttempted(file);

      assert.isTrue(Result.isErr(loaded));

      assert.include(Result.unwrapErrOr(loaded, ''), 'remove the file');
    });
  });
});

describe(attemptedRecorder, () => {
  test('keeps every issue recorded at once, writing one after another', async () => {
    await withDir(async (dir) => {
      const file = path.join(dir, 'attempted.json');

      const record = attemptedRecorder(file);

      const written = await Promise.all([
        record(1, '2026-10-01T00:00:00Z'),
        record(2, undefined),
        record(3, '2026-10-03T00:00:00Z'),
      ]);

      assert.isTrue(written.every(Result.isOk));

      assert.deepStrictEqual(
        Result.unwrapOkOr(await loadAttempted(file), undefined),
        new Map<number, string | undefined>([
          [1, '2026-10-01T00:00:00Z'],
          [2, undefined],
          [3, '2026-10-03T00:00:00Z'],
        ]),
      );
    });
  });

  test('goes on after a write that failed', async () => {
    await withDir(async (dir) => {
      const blocker = path.join(dir, 'file');

      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await fs.writeFile(blocker, '');

      const record = attemptedRecorder(path.join(blocker, 'attempted.json'));

      const [first, second] = await Promise.all([
        record(1, undefined),
        record(2, undefined),
      ]);

      assert.isTrue(Result.isErr(first));

      assert.isTrue(Result.isErr(second));
    });
  });
});

import { Result } from 'ts-data-forge';
import { makeRepository } from '../../test/index.mjs';
import {
  readReworkRecord,
  removeReworkRecord,
  writeReworkRecord,
} from './rework-record.mjs';

describe(readReworkRecord, () => {
  test('reads none, what was written, and none once removed', async () => {
    const repository = await makeRepository();

    onTestFinished(repository.dispose);

    const { cwd } = repository.place;

    const before = await readReworkRecord(cwd, 7);

    const written = await writeReworkRecord(cwd, 7, '2\n');

    const after = await readReworkRecord(cwd, 7);

    const removed = await removeReworkRecord(cwd, 7);

    const gone = await readReworkRecord(cwd, 7);

    assert.deepStrictEqual(
      [before, written, after, removed, gone],
      [
        Result.ok(undefined),
        Result.ok(undefined),
        Result.ok('2\n'),
        Result.ok(undefined),
        Result.ok(undefined),
      ],
    );
  });
});

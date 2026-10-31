import { initializeApp } from 'firebase/app';
import {
  doc,
  getFirestore,
  setDoc,
  writeBatch,
  type WriteBatch,
} from 'firebase/firestore';
import * as t from 'ts-fortress';
import {
  batchWrites,
  commitInBatches,
  MAX_BATCH_BYTES,
  MAX_BATCH_WRITES,
  putDoc,
  splitWrites,
  type BatchWrite,
  type DocTarget,
} from './firestore-io.mjs';

// Nothing here reaches a server: `setDoc` is replaced, and what it was handed
// is what is checked.
vi.mock(import('firebase/firestore'), async (importOriginal) => ({
  ...(await importOriginal()),
  setDoc: vi.fn(() => Promise.resolve()),
  writeBatch: vi.fn(),
}));

const firestore = getFirestore(
  initializeApp({ projectId: 'demo-task-manager-app' }, 'firestore-io-test'),
);

const ItemCodec = t.record({
  title: t.string(),
  point: t.record({ x: t.number(), y: t.number() }),
});

const item = (id: string): DocTarget<t.TypeOf<typeof ItemCodec>> =>
  ({
    ref: doc(firestore, 'items', id),
    codec: ItemCodec,
  }) as const;

const strayItem = {
  title: 'a',
  point: { x: 1, y: 2, z: 3 },
  note: 'x',
} as const;

const prunedItem = { title: 'a', point: { x: 1, y: 2 } } as const;

describe(putDoc, () => {
  test('writes what the codec describes, nothing more at any depth', async () => {
    await putDoc(item('a'), strayItem);

    const [ref, data] = vi.mocked(setDoc).mock.lastCall ?? [];

    assert.strictEqual(ref?.path, 'items/a');

    assert.deepStrictEqual(data, prunedItem);
  });
});

describe(batchWrites, () => {
  test('sets what the codec describes, and deletes, in order', () => {
    const writes = batchWrites((batch) => {
      batch.delete(item('gone').ref);

      batch.set(item('a'), strayItem);
    });

    assert.deepStrictEqual(
      writes.map((write) =>
        write.type === 'set'
          ? [write.type, write.ref.path, write.data]
          : [write.type, write.ref.path],
      ),
      [
        ['delete', 'items/gone'],
        ['set', 'items/a', prunedItem],
      ],
    );
  });
});

/** The batches committed, by their index, in the order committed. */
const mut_committed: { order: number[] } = { order: [] };

/** Each batch's writes, as the paths it set; the `fail`th commit rejects. */
const recordBatches = (fail?: number): readonly (readonly string[])[] => {
  const mut_batches: string[][] = [];

  mut_committed.order = [];

  vi.mocked(writeBatch).mockImplementation(() => {
    const mut_paths: string[] = [];

    const index = mut_batches.length;

    mut_batches.push(mut_paths);

    // Only what `commitInBatches` calls.
    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    return {
      set: (ref: Readonly<{ path: string }>) => {
        mut_paths.push(ref.path);
      },
      delete: (ref: Readonly<{ path: string }>) => {
        mut_paths.push(ref.path);
      },
      commit: () => {
        mut_committed.order.push(index);

        return index === fail
          ? Promise.reject(new Error('quota'))
          : Promise.resolve();
      },
    } as unknown as WriteBatch;
  });

  return mut_batches;
};

const writeMany = (count: number): Promise<void> =>
  commitInBatches(firestore, (batch) => {
    for (const id of Array.from({ length: count }, (_, i) => `i${i}`)) {
      batch.set(item(id), strayItem);
    }
  });

describe(commitInBatches, () => {
  test('commits one batch while the writes fit in one', async () => {
    const batches = recordBatches();

    await writeMany(MAX_BATCH_WRITES);

    assert.deepStrictEqual(
      batches.map((paths) => paths.length),
      [MAX_BATCH_WRITES],
    );
  });

  test('splits more writes than a batch takes, in order', async () => {
    const batches = recordBatches();

    await writeMany(MAX_BATCH_WRITES + 1);

    assert.deepStrictEqual(
      batches.map((paths) => paths.length),
      [MAX_BATCH_WRITES, 1],
    );

    assert.deepStrictEqual(batches[1], [`items/i${MAX_BATCH_WRITES}`]);
  });

  test('hands over every batch at once, and rejects when one fails', async () => {
    const batches = recordBatches(0);

    await expect(writeMany(MAX_BATCH_WRITES + 1)).rejects.toMatchObject({
      message: 'A batch was not written.',
      cause: new Error('quota'),
    });

    assert.strictEqual(batches.length, 2);

    // The second committed though the first failed: none waited.
    assert.deepStrictEqual(mut_committed.order, [0, 1]);
  });
});

// About a third of a batch's bytes each.
const large = (id: string): readonly BatchWrite[] =>
  batchWrites((batch) => {
    batch.set(item(id), {
      title: 'x'.repeat(MAX_BATCH_BYTES / 3),
      point: { x: 0, y: 0 },
    });
  });

describe(splitWrites, () => {
  test('splits by the bytes of the documents too', () => {
    const batches = splitWrites([
      ...large('a'),
      ...large('b'),
      ...large('c'),
      ...large('d'),
    ]);

    assert.deepStrictEqual(
      batches.map((writes) => writes.map(({ ref }) => ref.path)),
      [
        ['items/a', 'items/b'],
        ['items/c', 'items/d'],
      ],
    );
  });

  test('keeps a write larger than a batch on its own', () => {
    const huge = batchWrites((batch) => {
      batch.set(item('h'), {
        title: 'x'.repeat(MAX_BATCH_BYTES),
        point: { x: 0, y: 0 },
      });
    });

    assert.deepStrictEqual(
      splitWrites([...huge, ...large('a')]).map((writes) => writes.length),
      [1, 1],
    );
  });

  test('makes no batch of nothing', () => {
    assert.deepStrictEqual(splitWrites([]), []);
  });
});

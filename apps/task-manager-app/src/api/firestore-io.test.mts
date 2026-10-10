import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import * as t from 'ts-fortress';
import { batchWrites, putDoc, type DocTarget } from './firestore-io.mjs';

// Nothing here reaches a server: `setDoc` is replaced, and what it was
// handed is what is checked.
vi.mock(import('firebase/firestore'), async (importOriginal) => ({
  ...(await importOriginal()),
  setDoc: vi.fn(() => Promise.resolve()),
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

import type { NodeSize } from '../view-model/index.mjs';
import { createNodeSizeStore } from './node-size-store.mjs';

const setup = (
  initial: NodeSize,
): Readonly<{
  store: ReturnType<typeof createNodeSizeStore>;
  saved: readonly NodeSize[];
}> => {
  const mut_saved: NodeSize[] = [];

  const store = createNodeSizeStore({
    initial,
    save: (size) => {
      mut_saved.push(size);
    },
  });

  store.start();

  return { store, saved: mut_saved };
};

describe(createNodeSizeStore, () => {
  test('starts from the size read', () => {
    const { store } = setup('compact');

    assert.strictEqual(store.size.getSnapshot().value, 'compact');
  });

  test('saves every change', () => {
    const { store, saved } = setup('standard');

    store.set('compact');

    store.set('standard');

    assert.deepStrictEqual(saved, ['standard', 'compact', 'standard']);

    assert.strictEqual(store.size.getSnapshot().value, 'standard');
  });
});

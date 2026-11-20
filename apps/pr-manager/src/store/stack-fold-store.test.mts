import type { TreeNode } from 'pr-report-core';
import { createState } from 'synstate';
import { Optional } from 'ts-data-forge';
import { createStackFoldStore } from './stack-fold-store.mjs';

describe(createStackFoldStore, () => {
  test('starts with nothing folded, and folds and unfolds one at a time', () => {
    const { store } = setup();

    assert.deepStrictEqual(folded(store), []);

    store.toggle(7);

    store.toggle(3);

    assert.deepStrictEqual(folded(store), [3, 7]);

    store.toggle(7);

    assert.deepStrictEqual(folded(store), [3]);
  });

  test('folds the outermost layer of every stack the tree has now, and unfolds them all', () => {
    const { store, setRoots } = setup();

    setRoots([node(1, [node(2, [node(3)])]), node(4), node(5, [node(6)])]);

    store.foldAll();

    assert.deepStrictEqual(folded(store), [1, 5]);

    store.unfoldAll();

    assert.deepStrictEqual(folded(store), []);
  });
});

const setup = (): Readonly<{
  store: ReturnType<typeof createStackFoldStore>;
  setRoots: (next: readonly TreeNode[]) => void;
}> => {
  const [roots, setRoots] = createState<readonly TreeNode[]>([]);

  const [byNumber] = createState<ReadonlyMap<number, unknown>>(
    new Map([1, 2, 3, 4, 5, 6].map((number) => [number, number])),
  );

  return {
    store: createStackFoldStore({ roots, byNumber }),
    setRoots,
  };
};

const folded = (
  store: ReturnType<typeof createStackFoldStore>,
): readonly number[] => Optional.unwrap(store.folded.getSnapshot());

const node = (number: number, children: readonly TreeNode[] = []): TreeNode =>
  ({
    number,
    children,
    repeated: false,
  }) as const;

import { createState } from 'synstate';
import { Optional } from 'ts-data-forge';
import {
  foldChoicesFrom,
  type FoldChoice,
  type FoldNode,
} from '../domain/index.mjs';
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

    setRoots(STACKS);

    store.foldAll();

    assert.deepStrictEqual(shownFolded(store), [1, 5]);

    store.unfoldAll();

    assert.deepStrictEqual(folded(store), []);
  });

  test('a fold covers the layers below, so the next layer stays folded once the first merges', () => {
    const { store, setRoots } = setup();

    setRoots(STACKS);

    store.toggle(1);

    assert.deepStrictEqual(folded(store), [1, 2, 3]);

    setRoots([node(2, [node(3)]), node(4), node(5, [node(6)])]);

    assert.deepStrictEqual(shownFolded(store), [2]);

    store.toggle(2);

    assert.deepStrictEqual(shownFolded(store), []);
  });

  test('folds every stack to start with when asked to, and unfolds one the reader unfolds', () => {
    const { store, setRoots } = setup({ foldByDefault: true });

    setRoots(STACKS);

    assert.deepStrictEqual(folded(store), [1, 5]);

    store.toggle(5);

    assert.deepStrictEqual(folded(store), [1]);

    store.toggle(5);

    assert.deepStrictEqual(shownFolded(store), [1, 5]);
  });

  test('a stack appearing later starts folded too, and unfold all unfolds what is there', () => {
    const { store, setRoots } = setup({ foldByDefault: true });

    setRoots([node(1, [node(2)])]);

    store.unfoldAll();

    assert.deepStrictEqual(folded(store), []);

    setRoots([node(1, [node(2)]), node(5, [node(6)])]);

    assert.deepStrictEqual(folded(store), [5]);
  });

  test('fold all and unfold all keep no choice the default already makes', async () => {
    const { store, setRoots, stored, resolveLoad } = setup();

    setRoots(STACKS);

    store.start();

    resolveLoad([]);

    await settle();

    store.foldAll();

    assert.deepStrictEqual(
      stored().map(({ number }) => number),
      [6, 3, 2, 5, 1],
    );

    store.unfoldAll();

    assert.deepStrictEqual(stored(), []);
  });

  test('takes what was saved once it is read, and saves every change after, not before', async () => {
    const { store, stored, updates, resolveLoad, setRoots } = setup({
      foldByDefault: true,
    });

    setRoots(STACKS);

    store.start();

    resolveLoad([choice(1, false), choice(3, true)]);

    await settle();

    assert.strictEqual(updates(), 0);

    assert.deepStrictEqual(folded(store), [3, 5]);

    store.toggle(5);

    assert.deepStrictEqual(stored(), [
      choice(1, false),
      choice(3, true),
      choice(6, false),
      choice(5, false),
    ]);
  });

  test('a press made before what was saved is read is laid over it, and saved', async () => {
    const { store, stored, resolveLoad } = setup();

    store.start();

    store.toggle(3);

    resolveLoad([choice(3, false), choice(7, true)]);

    await settle();

    assert.deepStrictEqual(folded(store), [3, 7]);

    assert.deepStrictEqual(stored(), [choice(7, true), choice(3, true)]);
  });

  test('a change is applied to what is stored, so what another tab saved is kept', async () => {
    const { store, stored, setStored, resolveLoad } = setup();

    store.start();

    resolveLoad([]);

    await settle();

    setStored([choice(10, true)]);

    store.toggle(30);

    assert.deepStrictEqual(stored(), [choice(10, true), choice(30, true)]);
  });

  test('fold all before what was saved is read replaces it', async () => {
    const { store, resolveLoad, setRoots, stored } = setup();

    setRoots(STACKS);

    store.start();

    store.foldAll();

    resolveLoad([choice(4, true), choice(9, true)]);

    await settle();

    assert.deepStrictEqual(shownFolded(store), [1, 5]);

    assert.isFalse(stored().some(({ number }) => number === 9));
  });

  test('a database that cannot be read leaves the default, and changes are still saved', async () => {
    const { store, stored, rejectLoad } = setup();

    store.start();

    rejectLoad();

    await settle();

    assert.deepStrictEqual(folded(store), []);

    store.toggle(2);

    assert.deepStrictEqual(stored(), [choice(2, true)]);
  });

  test('forget drops the choices made, as a change in the Layout dialog asks', async () => {
    const { store, resolveLoad, setRoots, setFoldByDefault, stored } = setup();

    setRoots(STACKS);

    store.start();

    resolveLoad([choice(4, true)]);

    await settle();

    store.toggle(5);

    assert.deepStrictEqual(folded(store), [4, 5, 6]);

    setFoldByDefault(true);

    store.forget();

    assert.deepStrictEqual(folded(store), [1, 5]);

    assert.deepStrictEqual(stored(), []);
  });

  test('a default changed otherwise, as by a link or a reset, keeps the choices', () => {
    const { store, setRoots, setFoldByDefault } = setup({
      foldByDefault: true,
    });

    setRoots(STACKS);

    store.toggle(5);

    setFoldByDefault(false);

    setFoldByDefault(true);

    assert.deepStrictEqual(folded(store), [1]);
  });

  test('stopped before the read answers, it neither applies what was read nor saves', async () => {
    const { store, updates, resolveLoad } = setup();

    const stopStore = store.start();

    store.toggle(3);

    stopStore();

    resolveLoad([choice(5, true)]);

    await settle();

    assert.deepStrictEqual(folded(store), [3]);

    assert.strictEqual(updates(), 0);
  });
});

const setup = (
  options: Readonly<{ foldByDefault?: boolean }> = {},
): Readonly<{
  store: ReturnType<typeof createStackFoldStore>;
  setRoots: (next: readonly FoldNode[]) => void;
  setFoldByDefault: (next: boolean) => void;
  /** What the database holds now. */
  stored: () => readonly FoldChoice[];
  /** Stands for another tab saving. */
  setStored: (next: readonly FoldChoice[]) => void;
  updates: () => number;
  resolveLoad: (saved: unknown) => void;
  rejectLoad: () => void;
}> => {
  const [roots, setRoots] = createState<readonly FoldNode[]>([]);

  const [foldByDefault, setFoldByDefault] = createState(
    options.foldByDefault ?? false,
  );

  const mut_db: { stored: readonly FoldChoice[]; updates: number } = {
    stored: [],
    updates: 0,
  };

  const { promise, resolve, reject } = Promise.withResolvers<unknown>();

  return {
    store: createStackFoldStore({
      roots,
      foldByDefault,
      load: () => promise,
      update: (change) => {
        mut_db.updates += 1;

        mut_db.stored = change(mut_db.stored);
      },
    }),
    setRoots,
    setFoldByDefault,
    stored: () => mut_db.stored,
    setStored: (next) => {
      mut_db.stored = next;
    },
    updates: () => mut_db.updates,
    resolveLoad: (saved) => {
      // What the database held when it was read.
      mut_db.stored = foldChoicesFrom(saved);

      resolve(saved);
    },
    rejectLoad: () => {
      reject(new Error('blocked'));
    },
  };
};

const folded = (
  store: ReturnType<typeof createStackFoldStore>,
): readonly number[] => Optional.unwrap(store.folded.getSnapshot());

/** Of what is folded, what the merge order draws as a fold: a stack's top. */
const shownFolded = (
  store: ReturnType<typeof createStackFoldStore>,
): readonly number[] =>
  folded(store).filter((number) =>
    Optional.unwrap(store.foldable.getSnapshot()).includes(number),
  );

const choice = (number: number, isFolded: boolean): FoldChoice =>
  ({ number, folded: isFolded }) as const;

const settle = async (): Promise<void> => {
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

const node = (number: number, children: readonly FoldNode[] = []): FoldNode =>
  ({
    number,
    children,
    repeated: false,
  }) as const;

/** `1 ← 2 ← 3`, `4` alone, `5 ← 6`: "fold all" folds 1 and 5. */
const STACKS = [
  node(1, [node(2, [node(3)])]),
  node(4),
  node(5, [node(6)]),
] as const;

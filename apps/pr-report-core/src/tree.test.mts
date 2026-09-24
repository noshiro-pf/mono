import { buildMergeAfterForest } from './tree.mjs';

/** `[pull request number, what it declares it merges after]`. */
const forest = (
  declared: readonly (readonly [number, readonly number[]])[],
): ReturnType<typeof buildMergeAfterForest> =>
  buildMergeAfterForest(
    declared.map(([number, mergeAfter]) => ({ number, mergeAfter })),
  );

describe(buildMergeAfterForest, () => {
  test('a pull request with no declaration is a root of its own', () => {
    const { roots, cyclic } = forest([
      [1, []],
      [2, []],
    ]);

    assert.deepStrictEqual(
      roots.map((r) => r.number),
      [1, 2],
    );

    assert.deepStrictEqual(
      roots.map((r) => r.children.length),
      [0, 0],
    );

    assert.deepStrictEqual(Array.from(cyclic), []);
  });

  test('a declaration puts the dependent under what it waits for', () => {
    // `Merge-After: #1` on #2 means #1 merges first, so #1 is the parent.
    const { roots } = forest([
      [1, []],
      [2, [1]],
      [3, [2]],
    ]);

    assert.deepStrictEqual(
      roots.map((r) => r.number),
      [1],
    );

    const [root] = roots;

    assert.deepStrictEqual(
      root?.children.map((c) => c.number),
      [2],
    );

    assert.deepStrictEqual(
      root?.children[0]?.children.map((c) => c.number),
      [3],
    );
  });

  test('a number that names nothing open constrains nothing', () => {
    // #99 has merged or never existed: #2 is unblocked and stands as a root.
    const { roots } = forest([[2, [99]]]);

    assert.deepStrictEqual(
      roots.map((r) => r.number),
      [2],
    );
  });

  test('two parents list the pull request twice, expanded once', () => {
    const { roots } = forest([
      [1, []],
      [2, []],
      [3, [1, 2]],
      [4, [3]],
    ]);

    const under = (n: number): readonly TreeNodeLike[] =>
      roots.find((r) => r.number === n)?.children ?? [];

    assert.deepStrictEqual(
      under(1).map((c) => c.number),
      [3],
    );

    assert.deepStrictEqual(
      under(2).map((c) => c.number),
      [3],
    );

    // The subtree is drawn under the first parent only; the second is a
    // pointer, so a diamond does not double every branch below it.
    assert.deepStrictEqual(under(1)[0]?.repeated, false);

    assert.deepStrictEqual(
      under(1)[0]?.children.map((c) => c.number),
      [4],
    );

    assert.deepStrictEqual(under(2)[0]?.repeated, true);

    assert.deepStrictEqual(under(2)[0]?.children, []);
  });

  test('a cycle is reported, not drawn', () => {
    const { roots, cyclic } = forest([
      [1, [2]],
      [2, [1]],
      [3, []],
    ]);

    assert.deepStrictEqual(
      roots.map((r) => r.number),
      [3],
    );

    assert.deepStrictEqual(
      Array.from(cyclic).toSorted((a, b) => a - b),
      [1, 2],
    );
  });

  test('a pull request depending on itself is a cycle of one', () => {
    const { roots, cyclic } = forest([[1, [1]]]);

    assert.deepStrictEqual(roots, []);

    assert.deepStrictEqual(Array.from(cyclic), [1]);
  });
});

type TreeNodeLike = Readonly<{
  number: number;
  repeated: boolean;
  children: readonly TreeNodeLike[];
}>;

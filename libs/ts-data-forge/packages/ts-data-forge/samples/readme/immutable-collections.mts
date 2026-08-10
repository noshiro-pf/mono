import { Arr, IMap, ISet, Optional } from 'ts-data-forge';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test('main', () => {
    // IMap usage - immutable operations
    const originalMap = IMap.create<string, number>([]);

    const mapWithOne = originalMap.set('one', 1);

    const mapWithTwo = mapWithOne.set('two', 2);

    // Original map is unchanged
    assert.isTrue(originalMap.size === 0);

    assert.deepStrictEqual(mapWithTwo.get('one'), Optional.some(1));

    assert.isFalse(mapWithTwo.has('three'));

    // Using pipe for fluent updates
    const sequence = Arr.seq(10); // [0, 1, 2, ..., 9]

    const pairs = sequence.map(
      (i) => [i, i.toString()] as readonly [number, string],
    );

    const skipped = Arr.skip(pairs, 1); // [[1, "1"], ..., [9, "9"]]

    const idMap = IMap.create<number, string>(skipped);

    assert.isTrue(idMap.size === 9);

    // Efficient batch updates with withMutations
    const idMapUpdated = idMap.withMutations([
      { type: 'set', key: 99, value: '99' },
      { type: 'update', key: 5, updater: () => 'five' },
      { type: 'delete', key: 4 },
    ]);

    assert.isTrue(idMapUpdated.size === 9);

    // ISet usage
    const originalSet = ISet.create<number>([]);

    const setWithItems = originalSet.add(1).add(2).add(1); // Duplicate ignored

    assert.isTrue(originalSet.size === 0); // (unchanged)

    assert.isTrue(setWithItems.has(1));

    assert.isTrue(setWithItems.size === 2);

    // embed-sample-code-ignore-below
  });
}

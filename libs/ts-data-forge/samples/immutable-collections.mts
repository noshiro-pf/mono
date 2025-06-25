import { Arr, IMap, ISet, Optional } from 'ts-data-forge';

// IMap usage - immutable operations
const originalMap = IMap.create<string, number>([]);
const mapWithOne = originalMap.set('one', 1);
const mapWithTwo = mapWithOne.set('two', 2);

// Original map is unchanged
if (import.meta.vitest !== undefined) {
  expect(originalMap.size).toBe(0);
  expect(mapWithTwo.get('one')).toStrictEqual(Optional.some(1));

  expect(mapWithTwo.has('three')).toBe(false);
}

// Using pipe for fluent updates
const sequence = Arr.seq(10); // [0, 1, 2, ..., 9]
const pairs = sequence.map(
  (i) => [i, i.toString()] as readonly [number, string],
);
const skipped = Arr.skip(pairs, 1); // [ [1, "1"], ..., [9, "9"]]
const idMap = IMap.create<number, string>(skipped);

if (import.meta.vitest !== undefined) {
  expect(idMap.size).toBe(9);
}

// Efficient batch updates with withMutations
const idMapUpdated = idMap.withMutations([
  { type: 'set', key: 99, value: '99' },
  { type: 'update', key: 5, updater: () => 'five' },
  { type: 'delete', key: 4 },
]);

if (import.meta.vitest !== undefined) {
  expect(idMapUpdated.size).toBe(9);
}

// ISet usage
const originalSet = ISet.create<number>([]);
const setWithItems = originalSet.add(1).add(2).add(1); // Duplicate ignored

if (import.meta.vitest !== undefined) {
  expect(originalSet.size).toBe(0); // (unchanged)
  expect(setWithItems.has(1)).toBe(true);
  expect(setWithItems.size).toBe(2);
}

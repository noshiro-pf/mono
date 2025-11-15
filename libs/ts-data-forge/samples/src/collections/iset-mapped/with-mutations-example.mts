// Example: src/collections/iset-mapped.mts (withMutations)
import { ISetMapped } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; tag: string }>;

const toKey = (point: Point) => JSON.stringify(point);

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const fromKey = (key: string) => JSON.parse(key) as Point;

const base = ISetMapped.create<Point, string>(
  [
    { x: 1, tag: 'a' },
    { x: 2, tag: 'b' },
  ],
  toKey,
  fromKey,
);

const actions: readonly Readonly<
  { type: 'add'; key: Point } | { type: 'delete'; key: Point }
>[] = [
  { type: 'add', key: { x: 3, tag: 'c' } },
  { type: 'delete', key: { x: 1, tag: 'a' } },
];

const mutated = base.withMutations(actions);

assert.deepStrictEqual(Array.from(mutated), [
  { x: 2, tag: 'b' },
  { x: 3, tag: 'c' },
]);

assert.deepStrictEqual(Array.from(base), [
  { x: 1, tag: 'a' },
  { x: 2, tag: 'b' },
]);

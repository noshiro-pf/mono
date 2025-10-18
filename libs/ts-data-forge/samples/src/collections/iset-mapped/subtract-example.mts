// Example: src/collections/iset-mapped.mts (subtract)
import { ISetMapped } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; tag: string }>;

const toKey = (point: Point) => JSON.stringify(point);

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const fromKey = (key: string) => JSON.parse(key) as Point;

const left = ISetMapped.create<Point, string>(
  [
    { x: 1, tag: 'a' },
    { x: 2, tag: 'b' },
    { x: 3, tag: 'c' },
  ],
  toKey,
  fromKey,
);
const right = ISetMapped.create<Point, string>(
  [{ x: 2, tag: 'b' }],
  toKey,
  fromKey,
);

const difference = left.subtract(right);

assert.deepStrictEqual(Array.from(difference), [
  { x: 1, tag: 'a' },
  { x: 3, tag: 'c' },
]);

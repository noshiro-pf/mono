// Example: src/collections/iset-mapped.mts (ISetMapped.equal)
import { ISetMapped } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; tag: string }>;

const toKey = (point: Point) => JSON.stringify(point);

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const fromKey = (key: string) => JSON.parse(key) as Point;

const first = ISetMapped.create<Point, string>(
  [
    { x: 1, tag: 'a' },
    { x: 2, tag: 'b' },
  ],
  toKey,
  fromKey,
);

const second = ISetMapped.create<Point, string>(
  [
    { x: 2, tag: 'b' },
    { x: 1, tag: 'a' },
  ],
  toKey,
  fromKey,
);

const third = ISetMapped.create<Point, string>(
  [{ x: 3, tag: 'c' }],
  toKey,
  fromKey,
);

assert.ok(ISetMapped.equal(first, second));

assert.notOk(ISetMapped.equal(first, third));

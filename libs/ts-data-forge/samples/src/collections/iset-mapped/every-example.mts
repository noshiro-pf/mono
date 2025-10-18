// Example: src/collections/iset-mapped.mts (every)
import { ISetMapped } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; tag: string }>;

const toKey = (point: Point) => JSON.stringify(point);

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const fromKey = (key: string) => JSON.parse(key) as Point;

const set = ISetMapped.create<Point, string>(
  [
    { x: 2, tag: 'even' },
    { x: 4, tag: 'even' },
  ],
  toKey,
  fromKey,
);

const allEven = set.every((point) => point.x % 2 === 0);
const narrowed = set.every(
  (point): point is Readonly<{ x: 2 | 4; tag: 'even' }> => point.x % 2 === 0,
);

assert.ok(allEven);
assert.ok(narrowed);

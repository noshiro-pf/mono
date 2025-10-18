// Example: src/collections/iset-mapped.mts (isSupersetOf)
import { ISetMapped } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; tag: string }>;

const toKey = (point: Point) => JSON.stringify(point);

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const fromKey = (key: string) => JSON.parse(key) as Point;

const superset = ISetMapped.create<Point, string>(
  [
    { x: 1, tag: 'a' },
    { x: 2, tag: 'b' },
  ],
  toKey,
  fromKey,
);
const subset = ISetMapped.create<Point, string>(
  [{ x: 2, tag: 'b' }],
  toKey,
  fromKey,
);

assert.ok(superset.isSupersetOf(subset));
assert.notOk(subset.isSupersetOf(superset));

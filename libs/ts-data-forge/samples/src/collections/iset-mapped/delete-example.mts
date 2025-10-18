// Example: src/collections/iset-mapped.mts (delete)
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

const withoutSecond = base.delete({ x: 2, tag: 'b' });
const unchanged = base.delete({ x: 3, tag: 'c' });

assert.deepStrictEqual(Array.from(withoutSecond), [{ x: 1, tag: 'a' }]);
assert(unchanged === base);

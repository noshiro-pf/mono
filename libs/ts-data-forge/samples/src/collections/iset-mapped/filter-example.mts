// Example: src/collections/iset-mapped.mts (filter)
import { ISetMapped } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; tag: string }>;

const toKey = (point: Point) => JSON.stringify(point);

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const fromKey = (key: string) => JSON.parse(key) as Point;

const set = ISetMapped.create<Point, string>(
  [
    { x: 1, tag: 'a' },
    { x: 2, tag: 'b' },
    { x: 3, tag: 'c' },
  ],
  toKey,
  fromKey,
);

const evenPoints = set.filter((point) => point.x % 2 === 0);

assert.deepStrictEqual(Array.from(evenPoints), [{ x: 2, tag: 'b' }]);

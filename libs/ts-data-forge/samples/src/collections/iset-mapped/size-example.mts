// Example: src/collections/iset-mapped.mts (size)
import { ISetMapped } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; tag: string }>;

const toKey = (point: Point) => JSON.stringify(point);

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const fromKey = (key: string) => JSON.parse(key) as Point;

const points: readonly Point[] = [
  { x: 1, tag: 'a' },
  { x: 2, tag: 'b' },
];

const set = ISetMapped.create<Point, string>(points, toKey, fromKey);

assert(set.size === 2);

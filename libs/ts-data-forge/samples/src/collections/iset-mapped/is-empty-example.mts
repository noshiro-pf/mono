// Example: src/collections/iset-mapped.mts (isEmpty)
import { ISetMapped } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; tag: string }>;

const toKey = (point: Point) => JSON.stringify(point);

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const fromKey = (key: string) => JSON.parse(key) as Point;

const empty = ISetMapped.create<Point, string>([], toKey, fromKey);

const points = ISetMapped.create<Point, string>(
  [{ x: 1, tag: 'a' }],
  toKey,
  fromKey,
);

assert.ok(empty.isEmpty);

assert.notOk(points.isEmpty);

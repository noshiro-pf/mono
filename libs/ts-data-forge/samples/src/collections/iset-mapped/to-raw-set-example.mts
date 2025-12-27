// Example: src/collections/iset-mapped.mts (toRawSet)
import { isSet } from '@sindresorhus/is';
import { ISetMapped } from 'ts-data-forge';

// embed-sample-code-ignore-above
type Point = Readonly<{ x: number; tag: string }>;

const toKey = (point: Point) => JSON.stringify(point);

// eslint-disable-next-line total-functions/no-unsafe-type-assertion
const fromKey = (key: string) => JSON.parse(key) as Point;

const set = ISetMapped.create<Point, string>(
  [{ x: 1, tag: 'a' }],
  toKey,
  fromKey,
);

const raw = set.toRawSet();

assert.isTrue(isSet(raw));

assert.isTrue(raw.has(toKey({ x: 1, tag: 'a' })));

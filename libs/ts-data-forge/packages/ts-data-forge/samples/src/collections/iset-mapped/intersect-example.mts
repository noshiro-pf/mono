// Example: src/collections/iset-mapped.mts (intersect)
import { ISetMapped } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; tag: string }>;

    const toKey = (point: Point) => JSON.stringify(point);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const left = ISetMapped.create<Point, string>(
      [
        { x: 1, tag: 'a' },
        { x: 2, tag: 'b' },
      ],
      toKey,
      fromKey,
    );

    const right = ISetMapped.create<Point, string>(
      [{ x: 2, tag: 'b' }],
      toKey,
      fromKey,
    );

    const intersection = left.intersect(right);

    assert.deepStrictEqual(Array.from(intersection), [{ x: 2, tag: 'b' }]);

    // embed-sample-code-ignore-below
  });
}

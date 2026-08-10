// Example: src/collections/iset-mapped.mts (some)
import { ISetMapped } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; tag: string }>;

    const toKey = (point: Point) => JSON.stringify(point);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const set = ISetMapped.create<Point, string>(
      [
        { x: 1, tag: 'a' },
        { x: 5, tag: 'b' },
      ],
      toKey,
      fromKey,
    );

    assert.isTrue(set.some((point) => point.x > 4));

    assert.isFalse(set.some((point) => point.x > 10));

    // embed-sample-code-ignore-below
  });
}

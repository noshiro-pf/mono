// Example: src/collections/iset-mapped.mts (ISetMapped.diff)
import { ISetMapped } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; tag: string }>;

    const toKey = (point: Point) => JSON.stringify(point);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const previous = ISetMapped.create<Point, string>(
      [
        { x: 1, tag: 'a' },
        { x: 2, tag: 'b' },
      ],
      toKey,
      fromKey,
    );

    const current = ISetMapped.create<Point, string>(
      [
        { x: 2, tag: 'b' },
        { x: 3, tag: 'c' },
      ],
      toKey,
      fromKey,
    );

    const { added, deleted } = ISetMapped.diff(previous, current);

    assert.deepStrictEqual(Array.from(added), [{ x: 3, tag: 'c' }]);

    assert.deepStrictEqual(Array.from(deleted), [{ x: 1, tag: 'a' }]);

    // embed-sample-code-ignore-below
  });
}

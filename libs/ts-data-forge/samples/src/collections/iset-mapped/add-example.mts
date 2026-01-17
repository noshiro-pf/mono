// Example: src/collections/iset-mapped.mts (add)
import { ISetMapped } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; tag: string }>;

    const toKey = (point: Point) => JSON.stringify(point);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const base = ISetMapped.create<Point, string>(
      [{ x: 1, tag: 'a' }],
      toKey,
      fromKey,
    );

    const withNew = base.add({ x: 2, tag: 'b' });

    const unchanged = base.add({ x: 1, tag: 'a' });

    assert.deepStrictEqual(Array.from(withNew), [
      { x: 1, tag: 'a' },
      { x: 2, tag: 'b' },
    ]);

    assert.isTrue(unchanged === base);

    // embed-sample-code-ignore-below
  });
}

// Example: src/collections/imap-mapped.mts (map)
import { IMapMapped } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; y: number }>;

    const toKey = (p: Point) => JSON.stringify(p);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const map = IMapMapped.create<Point, number, string>(
      [
        [{ x: 0, y: 0 }, 1],
        [{ x: 1, y: 0 }, 2],
      ],
      toKey,
      fromKey,
    );

    const doubled = map.map((value) => value * 2);

    assert.deepStrictEqual(Array.from(doubled), [
      [{ x: 0, y: 0 }, 2],
      [{ x: 1, y: 0 }, 4],
    ]);

    // embed-sample-code-ignore-below
  });
}

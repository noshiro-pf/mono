// Example: src/collections/imap-mapped.mts (mapKeys)
import { IMapMapped } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; y: number }>;

    const toKey = (p: Point) => JSON.stringify(p);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const map = IMapMapped.create<Point, string, string>(
      [
        [{ x: 0, y: 0 }, 'origin'],
        [{ x: 1, y: 0 }, 'right'],
      ],
      toKey,
      fromKey,
    );

    const shifted = map.mapKeys((p) => ({ x: p.x + 10, y: p.y + 10 }));

    assert.deepStrictEqual(Array.from(shifted), [
      [{ x: 10, y: 10 }, 'origin'],
      [{ x: 11, y: 10 }, 'right'],
    ]);

    // embed-sample-code-ignore-below
  });
}

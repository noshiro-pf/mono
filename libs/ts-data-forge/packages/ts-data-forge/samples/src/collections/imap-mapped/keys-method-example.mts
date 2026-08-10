// Example: src/collections/imap-mapped.mts (keys)
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

    const keys = Array.from(map.keys());

    assert.deepStrictEqual(keys, [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]);

    // embed-sample-code-ignore-below
  });
}

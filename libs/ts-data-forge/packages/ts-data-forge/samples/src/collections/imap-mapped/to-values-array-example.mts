// Example: src/collections/imap-mapped.mts (toValuesArray)
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

    assert.deepStrictEqual(map.toValuesArray(), ['origin', 'right']);

    // embed-sample-code-ignore-below
  });
}

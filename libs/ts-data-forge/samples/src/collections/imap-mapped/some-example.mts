// Example: src/collections/imap-mapped.mts (some)
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
        [{ x: 0, y: 0 }, 3],
        [{ x: 1, y: 0 }, 7],
      ],
      toKey,
      fromKey,
    );

    assert.isTrue(map.some((value) => value > 5));

    assert.isFalse(map.some((value) => value > 10));

    // embed-sample-code-ignore-below
  });
}

// Example: src/collections/imap-mapped.mts (get)
import { IMapMapped, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; y: number }>;

    const toKey = (p: Point) => JSON.stringify(p);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const map = IMapMapped.create<Point, string, string>(
      [[{ x: 1, y: 2 }, 'A']],
      toKey,
      fromKey,
    );

    assert.deepStrictEqual(map.get({ x: 1, y: 2 }), Optional.some('A'));

    assert.deepStrictEqual(map.get({ x: 0, y: 0 }), Optional.none);

    // embed-sample-code-ignore-below
  });
}

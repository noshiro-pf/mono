// Example: src/collections/imap-mapped.mts (update)
import { IMapMapped, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; y: number }>;

    const toKey = (p: Point) => JSON.stringify(p);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const scores = IMapMapped.create<Point, number, string>(
      [
        [{ x: 0, y: 0 }, 10],
        [{ x: 1, y: 0 }, 8],
      ],
      toKey,
      fromKey,
    );

    const boosted = scores.update({ x: 0, y: 0 }, (value) => value + 5);

    const unchanged = scores.update({ x: 9, y: 9 }, (value) => value + 1);

    assert.deepStrictEqual(boosted.get({ x: 0, y: 0 }), Optional.some(15));

    assert.deepStrictEqual(scores.get({ x: 0, y: 0 }), Optional.some(10));

    assert.isTrue(unchanged === scores);

    // embed-sample-code-ignore-below
  });
}

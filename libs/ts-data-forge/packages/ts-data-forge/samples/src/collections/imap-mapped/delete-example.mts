// Example: src/collections/imap-mapped.mts (delete)
import { IMapMapped, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; y: number }>;

    const toKey = (p: Point) => JSON.stringify(p);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const original = IMapMapped.create<Point, string, string>(
      [
        [{ x: 0, y: 0 }, 'origin'],
        [{ x: 1, y: 0 }, 'right'],
      ],
      toKey,
      fromKey,
    );

    const withoutRight = original.delete({ x: 1, y: 0 });

    assert.deepStrictEqual(
      original.get({ x: 1, y: 0 }),
      Optional.some('right'),
    );

    assert.deepStrictEqual(withoutRight.get({ x: 1, y: 0 }), Optional.none);

    assert.isTrue(original.size === 2);

    assert.isTrue(withoutRight.size === 1);

    // embed-sample-code-ignore-below
  });
}

// Example: src/collections/imap-mapped.mts (set)
import { IMapMapped, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; y: number }>;

    const toKey = (p: Point) => JSON.stringify(p);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const base = IMapMapped.create<Point, string, string>(
      [[{ x: 0, y: 0 }, 'origin']],
      toKey,
      fromKey,
    );

    const updated = base.set({ x: 0, y: 0 }, 'home');

    const extended = base.set({ x: 1, y: 0 }, 'right');

    assert.deepStrictEqual(base.get({ x: 0, y: 0 }), Optional.some('origin'));

    assert.deepStrictEqual(updated.get({ x: 0, y: 0 }), Optional.some('home'));

    assert.deepStrictEqual(
      extended.get({ x: 1, y: 0 }),
      Optional.some('right'),
    );

    // embed-sample-code-ignore-below
  });
}

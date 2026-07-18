// Example: src/collections/imap-mapped.mts (equal)
import { IMapMapped } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; y: number }>;

    const toKey = (p: Point) => JSON.stringify(p);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const first = IMapMapped.create<Point, string, string>(
      [
        [{ x: 0, y: 0 }, 'origin'],
        [{ x: 1, y: 0 }, 'right'],
      ],
      toKey,
      fromKey,
    );

    const second = IMapMapped.create<Point, string, string>(
      [
        [{ x: 1, y: 0 }, 'right'],
        [{ x: 0, y: 0 }, 'origin'],
      ],
      toKey,
      fromKey,
    );

    const third = IMapMapped.create<Point, string, string>(
      [[{ x: 0, y: 0 }, 'different']],
      toKey,
      fromKey,
    );

    assert.isTrue(IMapMapped.equal(first, second));

    assert.isFalse(IMapMapped.equal(first, third));

    // embed-sample-code-ignore-below
  });
}

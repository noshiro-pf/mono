// Example: src/collections/imap-mapped.mts (toRawMap)
import { isMap } from '@sindresorhus/is';
import { IMapMapped } from 'ts-data-forge';

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

    const raw = map.toRawMap();

    assert.isTrue(isMap(raw));

    assert.isTrue(raw.get(toKey({ x: 1, y: 2 })) === 'A');

    // embed-sample-code-ignore-below
  });
}

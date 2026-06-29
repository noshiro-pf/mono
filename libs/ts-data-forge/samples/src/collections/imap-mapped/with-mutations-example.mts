// Example: src/collections/imap-mapped.mts (withMutations)
import { IMapMapped, Optional } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; y: number }>;

    const toKey = (p: Point) => JSON.stringify(p);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const base = IMapMapped.create<Point, string, string>(
      [
        [{ x: 0, y: 0 }, 'origin'],
        [{ x: 1, y: 0 }, 'right'],
      ],
      toKey,
      fromKey,
    );

    const mutated = base.withMutations([
      { type: 'set', key: { x: 2, y: 0 }, value: 'far' },
      { type: 'update', key: { x: 1, y: 0 }, updater: (v) => v.toUpperCase() },
      { type: 'delete', key: { x: 0, y: 0 } },
    ]);

    assert.deepStrictEqual(mutated.get({ x: 2, y: 0 }), Optional.some('far'));

    assert.deepStrictEqual(mutated.get({ x: 1, y: 0 }), Optional.some('RIGHT'));

    assert.deepStrictEqual(mutated.get({ x: 0, y: 0 }), Optional.none);

    assert.deepStrictEqual(base.get({ x: 1, y: 0 }), Optional.some('right'));

    // embed-sample-code-ignore-below
  });
}

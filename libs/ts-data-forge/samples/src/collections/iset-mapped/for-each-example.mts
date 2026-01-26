// Example: src/collections/iset-mapped.mts (forEach)
import { ISetMapped } from 'ts-data-forge';

if (import.meta.vitest !== undefined) {
  test('main', () => {
    // embed-sample-code-ignore-above
    type Point = Readonly<{ x: number; tag: string }>;

    const toKey = (point: Point) => JSON.stringify(point);

    // eslint-disable-next-line total-functions/no-unsafe-type-assertion
    const fromKey = (key: string) => JSON.parse(key) as Point;

    const set = ISetMapped.create<Point, string>(
      [
        { x: 1, tag: 'a' },
        { x: 2, tag: 'b' },
      ],
      toKey,
      fromKey,
    );

    const mut_collected: Point[] = [];

    for (const point of set) {
      mut_collected.push(point);
    }

    assert.deepStrictEqual(mut_collected, [
      { x: 1, tag: 'a' },
      { x: 2, tag: 'b' },
    ]);

    // embed-sample-code-ignore-below
  });
}

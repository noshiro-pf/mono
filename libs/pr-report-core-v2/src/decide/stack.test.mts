import { layersAbove, restackRefusal } from './stack.mjs';

const pr = (number: number, stackedOn?: number) =>
  ({ facts: { number }, stackedOn }) as const;

describe(layersAbove, () => {
  test('every layer above, however high, each after the one it is on', () => {
    assert.deepStrictEqual(
      layersAbove(
        [pr(1), pr(2, 1), pr(3, 2), pr(4, 1), pr(5), pr(6, 5)],
        1,
      ).map(({ facts }) => facts.number),
      [2, 4, 3],
    );
  });

  test('none above a pull request nothing is stacked on', () => {
    assert.deepStrictEqual(layersAbove([pr(1), pr(2, 1)], 2), []);
  });
});

describe(restackRefusal, () => {
  test("refuses a fork's branch alone", () => {
    assert.deepStrictEqual(
      [restackRefusal({ fromFork: true }), restackRefusal({ fromFork: false })],
      ['its branch is in a fork', undefined],
    );
  });
});

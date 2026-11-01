import { betaReduction1step } from './beta-reduction-1-step.mjs';

describe(betaReduction1step, () => {
  test('preserves the free a in ((lambda x.(lambda y.(a y))) y)', () => {
    assert.deepStrictEqual(
      betaReduction1step([['lambda', 'x', ['lambda', 'y', ['a', 'y']]], 'y']),
      ['lambda', 'y', ['a', 'y']],
    );
  });

  test('preserves the substituted y in ((lambda a.(lambda y.a)) y)', () => {
    assert.deepStrictEqual(
      betaReduction1step([['lambda', 'a', ['lambda', 'y', 'a']], 'y']),
      ['lambda', 'b', 'y'],
    );
  });
});

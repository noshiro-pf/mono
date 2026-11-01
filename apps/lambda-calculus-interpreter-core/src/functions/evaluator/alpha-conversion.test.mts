import { alphaConversion } from './alpha-conversion.mjs';

describe(alphaConversion, () => {
  test('renames a colliding nested binder before renaming the outer one', () => {
    assert.deepStrictEqual(
      alphaConversion('y', ['lambda', 'x', ['lambda', 'y', 'x']]),
      ['lambda', 'y', ['lambda', 'a', 'y']],
    );
  });

  test('handles another nested collision while choosing the replacement binder', () => {
    assert.deepStrictEqual(
      alphaConversion('a', [
        'lambda',
        'x',
        ['lambda', 'a', ['lambda', 'b', ['x', 'a']]],
      ]),
      ['lambda', 'a', ['lambda', 'b', ['lambda', 'c', ['a', 'b']]]],
    );
  });

  test('leaves a nested binder that shadows the old outer name unchanged', () => {
    assert.deepStrictEqual(
      alphaConversion('y', ['lambda', 'x', ['lambda', 'x', 'x']]),
      ['lambda', 'y', ['lambda', 'x', 'x']],
    );
  });

  test('renames applications while preserving other free variables', () => {
    assert.deepStrictEqual(
      alphaConversion('z', ['lambda', 'x', ['x', ['y', 'x']]]),
      ['lambda', 'z', ['z', ['y', 'z']]],
    );
  });
});

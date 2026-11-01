import { isAlphaEqual } from './is-alpha-equal.mjs';

describe(isAlphaEqual, () => {
  test('equates terms whose nested binders are swapped', () => {
    assert.isTrue(
      isAlphaEqual(
        ['lambda', 'x', ['lambda', 'y', ['x', 'y']]],
        ['lambda', 'y', ['lambda', 'x', ['y', 'x']]],
      ),
    );
  });

  test('tells apart terms whose nested binders are swapped in one body only', () => {
    assert.isFalse(
      isAlphaEqual(
        ['lambda', 'x', ['lambda', 'y', ['x', 'y']]],
        ['lambda', 'y', ['lambda', 'x', ['x', 'y']]],
      ),
    );
  });
});

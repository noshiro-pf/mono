import { isAlphaEqual } from './is-alpha-equal.mjs';
import { SUCC } from './parser/index.mjs';

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

  test('tells apart an identity and a constant whose free variable is the other binder', () => {
    assert.isFalse(isAlphaEqual(['lambda', 'x', 'x'], ['lambda', 'y', 'x']));

    assert.isFalse(isAlphaEqual(['lambda', 'y', 'x'], ['lambda', 'x', 'x']));
  });

  test('tells apart SUCC and a term that ignores its argument', () => {
    // λs.λs.λz.(s ((s s) z)) renames to SUCC's body only by capturing `s`.
    const lookAlike = [
      'lambda',
      's',
      ['lambda', 's', ['lambda', 'z', ['s', [['s', 's'], 'z']]]],
    ] as const;

    assert.isFalse(isAlphaEqual(lookAlike, SUCC));

    assert.isFalse(isAlphaEqual(SUCC, lookAlike));
  });

  test('equates terms that differ only in the names of their binders', () => {
    assert.isTrue(
      isAlphaEqual(SUCC, [
        'lambda',
        'm',
        ['lambda', 'f', ['lambda', 'x', ['f', [['m', 'f'], 'x']]]],
      ]),
    );

    assert.isTrue(isAlphaEqual(['lambda', 'x', 'y'], ['lambda', 'z', 'y']));
  });

  test('tells apart terms whose free variables differ', () => {
    assert.isFalse(isAlphaEqual(['lambda', 'x', 'y'], ['lambda', 'x', 'z']));

    assert.isFalse(isAlphaEqual('x', 'y'));
  });

  test('matches a variable to its innermost binder', () => {
    assert.isTrue(
      isAlphaEqual(
        ['lambda', 'x', ['lambda', 'x', 'x']],
        ['lambda', 'y', ['lambda', 'z', 'z']],
      ),
    );

    assert.isFalse(
      isAlphaEqual(
        ['lambda', 'x', ['lambda', 'x', 'x']],
        ['lambda', 'y', ['lambda', 'z', 'y']],
      ),
    );
  });
});

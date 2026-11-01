import { substitute } from './substitute.mjs';

describe(substitute, () => {
  test('leaves a term unchanged when the substituted variable is not free', () => {
    const term = ['lambda', 'y', ['a', 'y']] as const;

    assert.deepStrictEqual(substitute('y', 'x', term), term);
  });

  test('does not choose the variable being substituted as the new binder', () => {
    assert.deepStrictEqual(substitute('y', 'a', ['lambda', 'y', 'a']), [
      'lambda',
      'b',
      'y',
    ]);
  });

  test('keeps variables free in the body free after choosing a new binder', () => {
    assert.deepStrictEqual(
      substitute('y', 'x', ['lambda', 'y', [['x', 'a'], 'y']]),
      ['lambda', 'b', [['y', 'a'], 'b']],
    );
  });

  test('avoids capturing the renamed variable under a nested binder', () => {
    assert.deepStrictEqual(
      substitute('y', 'x', ['lambda', 'y', ['lambda', 'a', ['x', 'y']]]),
      ['lambda', 'a', ['lambda', 'b', ['y', 'a']]],
    );
  });

  test('stops at a binder that shadows the substituted variable', () => {
    const term = ['lambda', 'x', ['x', 'y']] as const;

    assert.deepStrictEqual(substitute('y', 'x', term), term);
  });

  test('substitutes both sides of an application without capturing either', () => {
    assert.deepStrictEqual(substitute('y', 'x', ['x', ['lambda', 'y', 'x']]), [
      'y',
      ['lambda', 'a', 'y'],
    ]);
  });
});

import { wrapperKindsTestedIn } from './check-ts-expression-wrappers.mjs';

describe(wrapperKindsTestedIn, () => {
  test('names each wrapper kind a module tests for', () => {
    assert.deepStrictEqual(
      wrapperKindsTestedIn(
        'ts.isParenthesizedExpression(e) || ts.isAsExpression(e) || ts.isNonNullExpression(e)',
      ),
      ['isParenthesizedExpression', 'isAsExpression', 'isNonNullExpression'],
    );
  });

  test('names none in a module that calls the helper', () => {
    assert.deepStrictEqual(
      wrapperKindsTestedIn('skipExpressionWrappers(e); ts.isIdentifier(e)'),
      [],
    );
  });
});

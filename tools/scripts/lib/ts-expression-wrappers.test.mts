import * as ts from 'typescript';
import {
  isExpressionWrapper,
  skipExpressionWrappers,
} from './ts-expression-wrappers.mjs';

/** The initializer of `const x = <text>;`. */
const initializerOf = (text: string): ts.Expression => {
  const sourceFile = ts.createSourceFile(
    'x.mts',
    `const x = ${text};`,
    ts.ScriptTarget.Latest,
    true,
  );

  const [statement] = sourceFile.statements;

  assert.isTrue(statement !== undefined && ts.isVariableStatement(statement));

  const initializer = statement.declarationList.declarations[0]?.initializer;

  assert.isTrue(initializer !== undefined);

  return initializer;
};

describe(skipExpressionWrappers, () => {
  test.each([
    ['parentheses', '(a)'],
    ['as', 'a as T'],
    ['satisfies', 'a satisfies T'],
    ['a non-null assertion', 'a!'],
    ['an angle-bracket assertion', '<T>a'],
    ['an instantiation expression', 'a<T>'],
    ['every wrapper, nested', '((<T>a<U>)! as T satisfies U)'],
  ])('sees through %s', (_, text) => {
    const inner = skipExpressionWrappers(initializerOf(text));

    assert.isTrue(ts.isIdentifier(inner));

    assert.strictEqual(inner.getText(), 'a');
  });

  test('stops at an expression that is no wrapper', () => {
    const inner = skipExpressionWrappers(initializerOf('(a.b as T)'));

    assert.isTrue(ts.isPropertyAccessExpression(inner));
  });
});

describe(isExpressionWrapper, () => {
  test('is false for a call, an identifier and a property access', () => {
    for (const text of ['f(a)', 'a', 'a.b']) {
      assert.isFalse(isExpressionWrapper(initializerOf(text)));
    }
  });
});

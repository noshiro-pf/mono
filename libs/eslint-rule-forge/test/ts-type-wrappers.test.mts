import { expectType } from 'ts-data-forge';
import type { DeepReadonly } from 'ts-type-forge';
import * as ts from 'typescript';
import {
  isTsTypeWrapper,
  skipTsTypeWrappers,
  type TsTypeWrapper,
} from '../src/index.mjs';

// The operand is typed readonly, for a readonly node as for a mutable one.
expectType<
  ReturnType<typeof skipTsTypeWrappers<ts.Expression>>,
  DeepReadonly<ts.Expression> | ts.Expression
>('=');

expectType<
  ReturnType<typeof skipTsTypeWrappers<DeepReadonly<ts.Expression>>>,
  DeepReadonly<ts.Expression>
>('=');

// `(a + b)!` is a `ts.LeftHandSideExpression` whose operand is not one.
expectType<
  ReturnType<typeof skipTsTypeWrappers<ts.LeftHandSideExpression>>,
  DeepReadonly<ts.Expression> | ts.LeftHandSideExpression
>('=');

// The guard narrows a readonly or a mutable node to either form of a wrapper.
expectType<
  typeof isTsTypeWrapper,
  (
    node: DeepReadonly<ts.Node>,
  ) => node is DeepReadonly<TsTypeWrapper> | TsTypeWrapper
>('=');

/** The initializer of `const probe = <expression>;`, parsed as TypeScript. */
const expressionOf = (code: string): ts.Expression => {
  const sourceFile = ts.createSourceFile(
    'probe.ts',
    `const probe = ${code};`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  const [statement] = sourceFile.statements;

  assert.isTrue(statement !== undefined && ts.isVariableStatement(statement));

  const initializer = statement.declarationList.declarations[0]?.initializer;

  assert.isDefined(initializer);

  return initializer;
};

describe(skipTsTypeWrappers, () => {
  test.each([
    ['x as A as B', 'x'],
    ['x!', 'x'],
    ['x satisfies A', 'x'],
    ['<A>x', 'x'],
    ['(x)', 'x'],
    ['((x as A) satisfies B)!', 'x'],
    ['(x as A)!.y', '(x as A)!.y'],
    ['f<A>', 'f<A>'],
    ['x', 'x'],
  ] as const)('%s gives %s', (code, inner) => {
    assert.strictEqual(skipTsTypeWrappers(expressionOf(code)).getText(), inner);
  });
});

describe(isTsTypeWrapper, () => {
  test.each([
    ['x as A', true],
    ['x!', true],
    ['x satisfies A', true],
    ['<A>x', true],
    ['(x)', true],
    ['x.y!.z', false],
    ['f(x as A)', false],
  ] as const)('%s: %s', (code, expected) => {
    assert.strictEqual(isTsTypeWrapper(expressionOf(code)), expected);
  });

  test('a parenthesized type is not one', () => {
    const sourceFile = ts.createSourceFile(
      'probe.ts',
      'type Probe = (A);',
      ts.ScriptTarget.Latest,
      true,
    );

    const [statement] = sourceFile.statements;

    assert.isTrue(
      statement !== undefined && ts.isTypeAliasDeclaration(statement),
    );

    assert.isTrue(ts.isParenthesizedTypeNode(statement.type));

    assert.isFalse(isTsTypeWrapper(statement.type));
  });
});

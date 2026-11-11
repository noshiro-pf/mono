import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  getArgumentText,
  mayHaveEffect,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { Arr, hasKey, isRecord } from 'ts-data-forge';
import {
  createVitestAssertFixer,
  getExpectOperands,
  getVitestReceiver,
} from './vitest-binding.mjs';

type MessageIds = 'useAssert' | 'useAssertMovingMessage';

type CallExpressionWithLegacyTypeParameters = TSESTree.CallExpression &
  Readonly<{
    typeParameters?: TSESTree.TSTypeParameterInstantiation;
  }>;

/**
 * The trade-off, measured in `assert-vs-expect-strict-equality.test.mts`:
 *
 * - `assert.deepStrictEqual: <T>(actual: T, expected: T) => void` binds both
 *   arguments to one type parameter, so a mismatched pair fails to compile.
 *   `toStrictEqual: <E>(expected: E) => void` leaves `E` unconstrained and
 *   type-checks nothing at all — a misspelled key in the expected object is a
 *   run-time failure there and a compile-time one here.
 * - In exchange, `toStrictEqual` compares prototypes and Vitest's
 *   `assert.deepStrictEqual` does not. The latter is Chai's `deepEqual` — the
 *   same function object, not merely an equivalent one — and not Node.js's
 *   `node:assert` function of that name, which does compare prototypes. A test
 *   that has to pin a class rather than a shape needs `assert.instanceOf`
 *   alongside the structural comparison.
 *
 * The compile-time check is preferred because it is the one that cannot be
 * recovered by adding a second assertion.
 *
 * The calls and the `expect` function are read through `as`, `satisfies`, `!`
 * and `<T>` (`expect(X)!.toStrictEqual(Y)`); `X` and `Y` keep theirs. `expect`
 * is Vitest's only (`getVitestReceiver`), and the fix names Vitest's `assert`
 * only (`createVitestAssertFixer`).
 *
 * `expect(X, message)` is reported too, and its message becomes the third
 * argument, `assert.deepStrictEqual(X, Y, message)`. That moves its evaluation
 * from before `Y` to after it, so the fix is written only when the order cannot
 * matter: either side is a literal, or neither has a side effect
 * (`mayHaveEffect`). Otherwise it is reported as `useAssertMovingMessage`, with
 * no fix.
 */
export const noExpectToStrictEqualRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow `expect(X).toStrictEqual(Y)` (and `expect(X, message)`) in favor of `assert.deepStrictEqual(X, Y)` (`assert.deepStrictEqual(X, Y, message)`), which constrains X and Y to a single type at compile time (`toStrictEqual` type-checks neither); note that it compares structure only, so pin a prototype with `assert.instanceOf`.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useAssert:
        "Use Vitest's `assert.deepStrictEqual(X, Y)` instead of `expect(X).toStrictEqual(Y)` (`assert.deepStrictEqual(X, Y, message)` for `expect(X, message)`).",
      useAssertMovingMessage:
        "Use Vitest's `assert.deepStrictEqual(X, Y, message)` instead of `expect(X, message).toStrictEqual(Y)`. Not fixed automatically: the message would then be evaluated after `Y`, and one of them may have an effect.",
    },
    defaultOptions: [],
  },
  create: (context) => {
    const sourceCode = context.sourceCode;

    const vitestAssertFix = createVitestAssertFixer(sourceCode);

    return {
      CallExpression: (node) => {
        const callee = skipTypeWrappers(node.callee);

        if (node.optional || !isToStrictEqualMember(callee)) {
          return;
        }

        const expectCall = skipTypeWrappers(callee.object);

        if (expectCall.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const expectReceiver = getVitestReceiver(
          sourceCode,
          expectCall.callee,
          'expect',
        );

        if (expectReceiver === undefined) {
          return;
        }

        const operands = getExpectOperands(expectCall);

        if (
          operands === undefined ||
          !Arr.isFixedLengthArray(1, node.arguments) ||
          node.arguments[0].type === AST_NODE_TYPES.SpreadElement
        ) {
          return;
        }

        const { actual: actualArgument, message: messageArgument } = operands;

        const expectedArgument = node.arguments[0];

        const actualText = getArgumentText(sourceCode, actualArgument);

        const expectedText = getArgumentText(sourceCode, expectedArgument);

        const typeArgumentText = getTypeArgumentText(node, sourceCode);

        const expectedWithCast =
          typeArgumentText === undefined
            ? expectedText
            : `(${expectedText}) as ${typeArgumentText}`;

        // `expect(X, message)` keeps its message as the third argument of
        // `assert.deepStrictEqual`, which evaluates it after `Y` rather than
        // before: fixed only when that order cannot matter.
        const isReorderSafe =
          messageArgument === undefined ||
          isStaticLiteral(messageArgument) ||
          isStaticLiteral(expectedArgument) ||
          (!mayHaveEffect(messageArgument, sourceCode) &&
            !mayHaveEffect(expectedArgument, sourceCode));

        const argumentsText = [
          actualText,
          expectedWithCast,
          ...(messageArgument === undefined
            ? []
            : [getArgumentText(sourceCode, messageArgument)]),
        ].join(', ');

        context.report({
          node,
          messageId: isReorderSafe ? 'useAssert' : 'useAssertMovingMessage',
          fix: isReorderSafe
            ? vitestAssertFix(
                node,
                expectReceiver,
                (assertName) =>
                  `${assertName}.deepStrictEqual(${argumentsText})`,
              )
            : null,
        });
      },
    };
  },
} as const;

/**
 * Whether `node`, through type wrappers, is a literal or a template literal
 * with no substitution: evaluating it reads and runs nothing, so its place in
 * the evaluation order cannot matter.
 */
const isStaticLiteral = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Node,
): boolean => {
  const unwrapped = skipTypeWrappers(node);

  return (
    unwrapped.type === AST_NODE_TYPES.Literal ||
    (unwrapped.type === AST_NODE_TYPES.TemplateLiteral &&
      Arr.isEmpty(unwrapped.expressions))
  );
};

/** Whether `callee`, with its type wrappers taken off, is `<x>.toStrictEqual`. */
const isToStrictEqualMember = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  callee: TSESTree.Expression,
): callee is TSESTree.MemberExpression =>
  callee.type === AST_NODE_TYPES.MemberExpression &&
  !callee.optional &&
  !callee.computed &&
  callee.property.type === AST_NODE_TYPES.Identifier &&
  callee.property.name === 'toStrictEqual';

const getModernTypeArguments = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): TSESTree.TSTypeParameterInstantiation | undefined =>
  isRecord(node) && hasKey(node, 'typeArguments')
    ? node.typeArguments
    : undefined;

const getLegacyTypeParameters = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
): TSESTree.TSTypeParameterInstantiation | undefined =>
  isRecord(node) && hasKey(node, 'typeParameters')
    ? // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      (node as CallExpressionWithLegacyTypeParameters).typeParameters
    : undefined;

const getTypeArgumentText = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.CallExpression,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): string | undefined => {
  const typeArguments =
    getModernTypeArguments(node) ?? getLegacyTypeParameters(node);

  if (typeArguments === undefined) {
    return undefined;
  }

  const rawText = sourceCode.getText(typeArguments).trim();

  if (rawText.length < 2) {
    return undefined;
  }

  const withoutAngles = rawText
    .replace(/^\s*</u, '')
    .replace(/>\s*$/u, '')
    .trim();

  return withoutAngles.length === 0 ? undefined : withoutAngles;
};

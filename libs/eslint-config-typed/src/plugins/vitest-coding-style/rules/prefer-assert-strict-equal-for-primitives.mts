import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isTypeWrapper, typeWrapperLayers } from 'eslint-rule-forge';
import { intersectionTypeParts, unionTypeParts } from 'tsutils';
import * as ts from 'typescript';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds =
  'preferStrictEqual' | 'preferStrictEqualForNumber' | 'replaceWithStrictEqual';

type Options = readonly [];

/**
 * `assert.deepStrictEqual(X, Y)` becomes `assert.strictEqual(X, Y)` when both
 * `X` and `Y` are primitives: a deep comparison has nothing to descend into,
 * and `strictEqual` says what the test means.
 *
 * The two are not the same comparison on numbers. Vitest's `deepStrictEqual`
 * is Chai's `deepEqual`, which treats `NaN` as equal to itself and `-0` as
 * unequal to `0`, while `strictEqual` is `===`. They disagree only when both
 * sides are `NaN`, or both are zeros, so the call is fixed when either side's
 * type rules that out — `assert.deepStrictEqual(n, 3)`, where `3` is neither —
 * and otherwise gets a suggestion, so that a test pinning `NaN` or `-0` is not
 * silently inverted. A number literal type `0` may hold `-0`.
 *
 * The receiver and the call are read through `as`, `satisfies`, `!` and `<T>`,
 * which the fix leaves in place. Each argument is a primitive only if the type
 * at every layer of its wrappers is one: `o as unknown as string` is still the
 * object `o` and is still compared deeply.
 */
export const preferAssertStrictEqualForPrimitivesRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer assert.strictEqual(X, Y) over assert.deepStrictEqual(X, Y) when X and Y are primitives (only a suggestion when both may be NaN or a zero, which the two compare differently).',
    },
    fixable: 'code',
    hasSuggestions: true,
    schema: [],
    messages: {
      preferStrictEqual:
        'Use assert.strictEqual(X, Y) instead of assert.deepStrictEqual(X, Y) for primitives.',
      preferStrictEqualForNumber:
        'Use assert.strictEqual(X, Y) instead of assert.deepStrictEqual(X, Y) for primitives. Both arguments here may be NaN or a zero, where they differ: deepStrictEqual treats NaN as equal to NaN and -0 as unequal to 0, strictEqual does the opposite.',
      replaceWithStrictEqual:
        'Replace with assert.strictEqual (changes the result for NaN and -0).',
    },
    defaultOptions: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    const typePartsOf = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      expression: TSESTree.Node,
    ): readonly ts.Type[] =>
      unionTypeParts(
        checker.getTypeAtLocation(
          parserServices.esTreeNodeToTSNodeMap.get(expression),
        ),
      );

    /**
     * How an argument is typed at every layer of its wrappers: `'other'` if
     * any layer may be a non-primitive, otherwise `'nan-or-zero'` if any layer
     * may be `NaN`, `0` or `-0`, otherwise `'primitive'`.
     */
    const classify = (
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      argument: TSESTree.Expression,
    ): 'nan-or-zero' | 'other' | 'primitive' => {
      const parts = typeWrapperLayers(argument).flatMap(typePartsOf);

      return !parts.every(isPrimitive)
        ? 'other'
        : parts.some(mayBeNaNOrZero)
          ? 'nan-or-zero'
          : 'primitive';
    };

    return {
      MemberExpression: (node) => {
        if (
          getVitestReceiver(context.sourceCode, node.object, 'assert') ===
            undefined ||
          node.property.type !== AST_NODE_TYPES.Identifier ||
          node.property.name !== 'deepStrictEqual'
        ) {
          return;
        }

        const call = callOf(node);

        if (call === undefined) {
          return;
        }

        const [actual, expected] = call.arguments;

        if (
          actual === undefined ||
          expected === undefined ||
          actual.type === AST_NODE_TYPES.SpreadElement ||
          expected.type === AST_NODE_TYPES.SpreadElement
        ) {
          return;
        }

        const classes = [classify(actual), classify(expected)] as const;

        if (classes.includes('other')) {
          return;
        }

        const { property } = node;

        // Only the method name is rewritten, so the receiver keeps whatever
        // it is called here.
        const fix = (fixer: TSESLint.RuleFixer): TSESLint.RuleFix =>
          fixer.replaceText(property, 'strictEqual');

        if (classes.every((c) => c === 'nan-or-zero')) {
          context.report({
            node,
            messageId: 'preferStrictEqualForNumber',
            suggest: [{ messageId: 'replaceWithStrictEqual', fix }],
          });
        } else {
          context.report({ node, messageId: 'preferStrictEqual', fix });
        }
      },
    };
  },
} as const;

/**
 * The call that calls `node`, looking through the type wrappers around it, or
 * `undefined` when `node` is not called.
 */
const callOf = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  node: TSESTree.Expression,
): TSESTree.CallExpression | undefined => {
  const { parent } = node;

  return isTypeWrapper(parent)
    ? callOf(parent)
    : parent.type === AST_NODE_TYPES.CallExpression && parent.callee === node
      ? parent
      : undefined;
};

/**
 * A union member is a primitive when it is one itself, or when it is an
 * intersection with a primitive in it — a branded `string & { __brand: 'Id' }`
 * is a string at run time.
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const isPrimitive = (type: ts.Type): boolean =>
  intersectionTypeParts(type).some(
    (part) => (part.flags & PRIMITIVE_FLAGS) !== 0,
  );

/**
 * Whether a union member may be `NaN`, `0` or `-0`: any number type but a
 * non-zero number literal (an enum member included).
 */
// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const mayBeNaNOrZero = (type: ts.Type): boolean =>
  intersectionTypeParts(type).some(
    (part) =>
      (part.flags & ts.TypeFlags.NumberLike) !== 0 &&
      (!part.isNumberLiteral() || part.value === 0),
  );

const PRIMITIVE_FLAGS: ts.TypeFlags =
  ts.TypeFlags.StringLike |
  ts.TypeFlags.NumberLike |
  ts.TypeFlags.BigIntLike |
  ts.TypeFlags.BooleanLike |
  ts.TypeFlags.ESSymbolLike |
  ts.TypeFlags.Null |
  ts.TypeFlags.Undefined |
  ts.TypeFlags.Void;

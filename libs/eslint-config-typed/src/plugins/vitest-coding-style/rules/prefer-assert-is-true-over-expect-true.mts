import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';
import { argumentText, withoutTypeWrappers } from './type-wrappers.mjs';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertIsTrueOverExpectTrue';

type Options = readonly [];

/**
 * `expect(X).toBe(true)` becomes `assert.isTrue(X)` when `X` is a boolean. The
 * calls, the `expect` function and the `true` are read through `as`,
 * `satisfies`, `!` and `<T>`; `X` keeps its wrappers, and its type is asked
 * with them, since that is the argument `assert.isTrue` receives.
 */
export const preferAssertIsTrueOverExpectTrueRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer assert.isTrue(X) over expect(X).toBe(true) (only if X is boolean)',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsTrueOverExpectTrue:
        'Use assert.isTrue(X) instead of expect(X).toBe(true)',
    },
  },
  defaultOptions: [],
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    return {
      CallExpression: (node) => {
        const callee = withoutTypeWrappers(node.callee);

        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const expectCall = withoutTypeWrappers(callee.object);

        const [rawExpected] = node.arguments;

        const expected =
          rawExpected === undefined ||
          rawExpected.type === AST_NODE_TYPES.SpreadElement
            ? rawExpected
            : withoutTypeWrappers(rawExpected);

        if (
          expectCall.type === AST_NODE_TYPES.CallExpression &&
          getVitestReceiver(context.sourceCode, expectCall.callee, 'expect') !==
            undefined &&
          callee.property.type === AST_NODE_TYPES.Identifier &&
          callee.property.name === 'toBe' &&
          Arr.isFixedLengthTuple(1, node.arguments) &&
          expected?.type === AST_NODE_TYPES.Literal &&
          expected.value === true
        ) {
          const arg = expectCall.arguments[0];

          if (arg !== undefined) {
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(arg);

            const type = checker.getTypeAtLocation(tsNode);

            const isBoolean = (type.flags & ts.TypeFlags.Boolean) !== 0;

            if (!isBoolean) {
              return;
            }
          }

          const argText =
            arg === undefined ? '' : argumentText(context.sourceCode.text, arg);

          context.report({
            node,
            messageId: 'preferAssertIsTrueOverExpectTrue',
            fix: (fixer) =>
              fixer.replaceText(node, `assert.isTrue(${argText})`),
          });
        }
      },
    };
  },
} as const;

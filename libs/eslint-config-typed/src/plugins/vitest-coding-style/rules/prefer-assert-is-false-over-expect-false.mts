import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
} from '@typescript-eslint/utils';
import {
  getArgumentText,
  skipTypeWrappers,
  typeWrapperLayers,
} from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';
import {
  createVitestAssertFixer,
  getExpectOperands,
  getVitestReceiver,
} from './vitest-binding.mjs';

type MessageIds = 'preferAssertIsFalseOverExpectFalse';

type Options = readonly [];

/**
 * `expect(X).toBe(false)` becomes `assert.isFalse(X)` when `X` is a boolean.
 * The calls, the `expect` function and the `false` are read through `as`,
 * `satisfies`, `!` and `<T>`; `X` keeps its wrappers, and is a boolean only if
 * the type at every layer of them is one: a widening `as` is the author saying
 * it may not be, and a narrowing one (`v as boolean` on an `unknown`, `flag!`)
 * does not make the value a boolean. The fix names Vitest's `assert` only
 * (`createVitestAssertFixer`).
 */
export const preferAssertIsFalseOverExpectFalseRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer assert.isFalse(X) over expect(X).toBe(false) (only if X is boolean)',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsFalseOverExpectFalse:
        "Use Vitest's assert.isFalse(X) instead of expect(X).toBe(false)",
    },
    defaultOptions: [],
  },
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    const vitestAssertFix = createVitestAssertFixer(context.sourceCode);

    return {
      CallExpression: (node) => {
        const callee = skipTypeWrappers(node.callee);

        if (callee.type !== AST_NODE_TYPES.MemberExpression) {
          return;
        }

        const expectCall = skipTypeWrappers(callee.object);

        const [rawExpected] = node.arguments;

        const expected =
          rawExpected === undefined ||
          rawExpected.type === AST_NODE_TYPES.SpreadElement
            ? rawExpected
            : skipTypeWrappers(rawExpected);

        // The syntax first: the scope lookup is paid only by a candidate.
        if (
          expectCall.type !== AST_NODE_TYPES.CallExpression ||
          callee.property.type !== AST_NODE_TYPES.Identifier ||
          callee.property.name !== 'toBe' ||
          !Arr.isFixedLengthTuple(1, node.arguments) ||
          expected?.type !== AST_NODE_TYPES.Literal ||
          expected.value !== false
        ) {
          return;
        }

        const expectReceiver = getVitestReceiver(
          context.sourceCode,
          expectCall.callee,
          'expect',
        );

        if (expectReceiver === undefined) {
          return;
        }

        const operands = getExpectOperands(expectCall);

        if (
          operands === undefined ||
          !typeWrapperLayers(operands.actual).every((layer) => {
            const type = checker.getTypeAtLocation(
              parserServices.esTreeNodeToTSNodeMap.get(layer),
            );

            return (type.flags & ts.TypeFlags.Boolean) !== 0;
          })
        ) {
          return;
        }

        // `expect(X, message)` keeps its message: `assert.is*` takes one too.
        const argText = [operands.actual, operands.message]
          .filter((a) => a !== undefined)
          .map((a) => getArgumentText(context.sourceCode, a))
          .join(', ');

        context.report({
          node,
          messageId: 'preferAssertIsFalseOverExpectFalse',
          fix: vitestAssertFix(
            node,
            expectReceiver,
            (assertName) => `${assertName}.isFalse(${argText})`,
          ),
        });
      },
    };
  },
} as const;

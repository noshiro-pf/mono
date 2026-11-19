import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { isCallee, isTypeWrapper } from 'eslint-rule-forge';
import { isBooleanOperand } from './boolean-operand.mjs';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertIsFalseOverAssertNotOk' | 'assertWhatIsMeant';

type Options = readonly [];

/**
 * `assert.isNotOk(X)` and `assert.notOk(X)` become `assert.isFalse(X)`. The
 * receiver and the call are read through `as`, `satisfies`, `!` and `<T>`,
 * which the fix leaves in place. An `X` that is not a boolean at every layer of
 * its type wrappers (`isBooleanOperand`) is reported without a fix, under a
 * message that asks for the assertion meant instead: `assert.isFalse` passes
 * for `false` alone.
 */
export const preferAssertIsFalseOverAssertNotOkRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer assert.isFalse(X) over assert.isNotOk(X), assert.notOk(X) (fixed only when X is boolean; type-aware).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsFalseOverAssertNotOk:
        'Use {{receiver}}.isFalse(X) instead of {{method}}(X).',
      assertWhatIsMeant:
        '{{method}}(X) asserts only that X is falsy, and X is not known to be a boolean, so {{receiver}}.isFalse(X) may fail on it. Assert what is meant: {{receiver}}.isUndefined(X), {{receiver}}.isNull(X), {{receiver}}.strictEqual(X, 0), …',
    },
    defaultOptions: [],
  },
  create: (context) => ({
    MemberExpression: (node) => {
      const receiver = getVitestReceiver(
        context.sourceCode,
        node.object,
        'assert',
      );

      if (
        receiver !== undefined &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        (node.property.name === 'isNotOk' || node.property.name === 'notOk') &&
        isCallee(node)
      ) {
        const { property } = node;

        const operand = callOfCallee(node)?.arguments[0];

        if (operand === undefined) {
          return;
        }

        const isBoolean = isBooleanOperand(context.sourceCode, operand);

        context.report({
          node,
          data: {
            method: `${receiver.identifier.name}.${property.name}`,
            receiver: receiver.identifier.name,
          },
          messageId: isBoolean
            ? 'preferAssertIsFalseOverAssertNotOk'
            : 'assertWhatIsMeant',
          fix: isBoolean
            ? (fixer) => fixer.replaceText(property, 'isFalse')
            : null,
        });
      }
    },
  }),
} as const;

/**
 * The call whose callee `node` is, through the type wrappers and an optional
 * chain around it, as `isCallee` reads it.
 */
const callOfCallee = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- the call it returns, read from the mutable parent, has its argument passed to isBooleanOperand, which takes a mutable node
  node: TSESTree.Node,
): TSESTree.CallExpression | undefined => {
  const { parent } = node;

  return parent === undefined
    ? undefined
    : isTypeWrapper(parent) || parent.type === AST_NODE_TYPES.ChainExpression
      ? callOfCallee(parent)
      : parent.type === AST_NODE_TYPES.CallExpression && parent.callee === node
        ? parent
        : undefined;
};

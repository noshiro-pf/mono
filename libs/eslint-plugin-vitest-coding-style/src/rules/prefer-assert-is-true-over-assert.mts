import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { skipTypeWrappers } from 'eslint-rule-forge';
import { isBooleanOperand } from './boolean-operand.mjs';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertIsTrueOverAssert' | 'assertWhatIsMeant';

type Options = readonly [];

/**
 * `assert(X)`, `assert.isOk(X)` and `assert.ok(X)` become `assert.isTrue(X)`.
 * The callee and the receiver are read through `as`, `satisfies`, `!` and
 * `<T>`, and the method name is replaced inside them; a bare callee inside a
 * wrapper, `(assert as typeof assert)(X)`, is reported without a fix. So is an
 * `X` that is not a boolean at every layer of its type wrappers
 * (`isBooleanOperand`), under a message that asks for the assertion meant
 * instead: `assert.isTrue` passes for `true` alone.
 */
export const preferAssertIsTrueOverAssertRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer assert.isTrue(X) over assert(X), assert.isOk(X), assert.ok(X) (fixed only when X is boolean; type-aware).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsTrueOverAssert:
        'Use {{receiver}}.isTrue(X) instead of {{method}}(X).',
      assertWhatIsMeant:
        '{{method}}(X) asserts only that X is truthy, and X is not known to be a boolean, so {{receiver}}.isTrue(X) may fail on it. Assert what is meant: {{receiver}}.isDefined(X), {{receiver}}.isNotNull(X), {{receiver}}.isTrue(X !== 0), …',
    },
    defaultOptions: [],
  },
  create: (context) => ({
    CallExpression: (node) => {
      // assert(X) -> assert.isTrue(X)
      const bareCallee = getVitestReceiver(
        context.sourceCode,
        node.callee,
        'assert',
      )?.identifier;

      if (bareCallee !== undefined) {
        const [operand] = node.arguments;

        if (operand === undefined) {
          return;
        }

        const isBoolean = isBooleanOperand(context.sourceCode, operand);

        context.report({
          node: bareCallee,
          messageId: isBoolean
            ? 'preferAssertIsTrueOverAssert'
            : 'assertWhatIsMeant',
          data: { method: bareCallee.name, receiver: bareCallee.name },
          // Through a wrapper, `(assert as typeof assert)(x)`, the rename would
          // land inside it — `(assert.isTrue as typeof assert)(x)` — and what
          // the wrapper should become is not ours to decide.
          fix:
            isBoolean && bareCallee === node.callee
              ? (fixer) =>
                  fixer.replaceText(bareCallee, `${bareCallee.name}.isTrue`)
              : null,
        });

        return;
      }

      // assert.isOk(X) -> assert.isTrue(X)

      const callee = skipTypeWrappers(node.callee);

      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        const receiver = getVitestReceiver(
          context.sourceCode,
          callee.object,
          'assert',
        )?.identifier;

        if (
          receiver !== undefined &&
          callee.property.type === AST_NODE_TYPES.Identifier &&
          (callee.property.name === 'isOk' || callee.property.name === 'ok')
        ) {
          const { property } = callee;

          const [operand] = node.arguments;

          if (operand === undefined) {
            return;
          }

          const isBoolean = isBooleanOperand(context.sourceCode, operand);

          context.report({
            node: callee,
            messageId: isBoolean
              ? 'preferAssertIsTrueOverAssert'
              : 'assertWhatIsMeant',
            data: {
              method: `${receiver.name}.${property.name}`,
              receiver: receiver.name,
            },
            fix: isBoolean
              ? (fixer) => fixer.replaceText(property, 'isTrue')
              : null,
          });
        }
      }
    },
  }),
} as const;

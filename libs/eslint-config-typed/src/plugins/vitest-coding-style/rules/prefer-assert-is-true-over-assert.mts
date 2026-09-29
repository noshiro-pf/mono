import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { withoutTypeWrappers } from './type-wrappers.mjs';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertIsTrueOverAssert';

type Options = readonly [];

/**
 * `assert(X)`, `assert.isOk(X)` and `assert.ok(X)` become `assert.isTrue(X)`.
 * The callee and the receiver are read through `as`, `satisfies`, `!` and
 * `<T>`, and the method name is replaced inside them; a bare callee inside a
 * wrapper, `(assert as typeof assert)(X)`, is reported without a fix.
 */
export const preferAssertIsTrueOverAssertRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer assert.isTrue(X) over assert(X), assert.isOk(X), assert.ok(X).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsTrueOverAssert:
        'Use assert.isTrue(X) instead of {{method}}(X).',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    CallExpression: (node) => {
      // assert(X) -> assert.isTrue(X)
      const bareCallee = getVitestReceiver(
        context.sourceCode,
        node.callee,
        'assert',
      );

      if (bareCallee !== undefined) {
        if (Arr.isEmpty(node.arguments)) {
          return;
        }

        context.report({
          node: bareCallee,
          messageId: 'preferAssertIsTrueOverAssert',
          data: { method: bareCallee.name },
          // Through a wrapper, `(assert as typeof assert)(x)`, the rename
          // would land inside it — `(assert.isTrue as typeof assert)(x)` —
          // and what the wrapper should become is not ours to decide.
          fix:
            bareCallee === node.callee
              ? (fixer) =>
                  fixer.replaceText(bareCallee, `${bareCallee.name}.isTrue`)
              : null,
        });

        return;
      }

      // assert.isOk(X) -> assert.isTrue(X)

      const callee = withoutTypeWrappers(node.callee);

      if (callee.type === AST_NODE_TYPES.MemberExpression) {
        const receiver = getVitestReceiver(
          context.sourceCode,
          callee.object,
          'assert',
        );

        if (
          receiver !== undefined &&
          callee.property.type === AST_NODE_TYPES.Identifier &&
          (callee.property.name === 'isOk' || callee.property.name === 'ok')
        ) {
          const { property } = callee;

          context.report({
            node: callee,
            messageId: 'preferAssertIsTrueOverAssert',
            data: { method: `${receiver.name}.${property.name}` },
            fix: (fixer) => fixer.replaceText(property, 'isTrue'),
          });
        }
      }
    },
  }),
} as const;

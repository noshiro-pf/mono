import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertIsTrueOverAssert';

type Options = readonly [];

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
          fix: (fixer) =>
            fixer.replaceText(bareCallee, `${bareCallee.name}.isTrue`),
        });

        return;
      }

      // assert.isOk(X) -> assert.isTrue(X)

      if (node.callee.type === AST_NODE_TYPES.MemberExpression) {
        const callee = node.callee;

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

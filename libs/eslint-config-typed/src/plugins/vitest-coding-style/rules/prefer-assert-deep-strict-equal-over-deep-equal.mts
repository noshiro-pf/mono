import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { isCalleeOfCall } from './type-wrappers.mjs';
import { getVitestReceiver } from './vitest-binding.mjs';

type MessageIds = 'preferAssertDeepStrictEqual';

type Options = readonly [];

/**
 * `assert.deepEqual(X, Y)` becomes `assert.deepStrictEqual(X, Y)`. The
 * receiver and the call are read through `as`, `satisfies`, `!` and `<T>`
 * (`(assert as typeof assert).deepEqual(X, Y)`, `assert.deepEqual!(X, Y)`),
 * which the fix leaves in place.
 */
export const preferAssertDeepStrictEqualOverDeepEqualRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer assert.deepStrictEqual(X) over assert.deepEqual(X).',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertDeepStrictEqual:
        'Use assert.deepStrictEqual(X) instead of assert.deepEqual(X).',
    },
  },
  defaultOptions: [],
  create: (context) => ({
    MemberExpression: (node) => {
      if (
        getVitestReceiver(context.sourceCode, node.object, 'assert') !==
          undefined &&
        node.property.type === AST_NODE_TYPES.Identifier &&
        node.property.name === 'deepEqual' &&
        isCalleeOfCall(node)
      ) {
        const { property } = node;

        context.report({
          node,
          messageId: 'preferAssertDeepStrictEqual',
          // Only the method name is rewritten, so the receiver keeps whatever
          // it is called here.
          fix: (fixer) => fixer.replaceText(property, 'deepStrictEqual'),
        });
      }
    },
  }),
} as const;

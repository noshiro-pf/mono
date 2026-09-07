import { createRule } from './create-rule.mjs';

/** `banned-syntax/no-using` — `using` / `await using` are not part of Sumi lint (D-30). */
export const noUsing = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `using` / `await using` declarations (Sumi D-30: revisited for Sumi sugar).',
    },
    messages: {
      noUsing:
        '`{{kind}}` declarations are not allowed in Sumi lint (D-30): release resources explicitly in the callback passed to Result.fromThrowable.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    VariableDeclaration: (node) => {
      if (node.kind === 'using' || node.kind === 'await using') {
        context.report({
          node,
          messageId: 'noUsing',
          data: { kind: node.kind },
        });
      }
    },
  }),
});

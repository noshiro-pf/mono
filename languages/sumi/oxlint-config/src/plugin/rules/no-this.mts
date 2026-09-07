import { createRule } from './create-rule.mjs';

/** `banned-syntax/no-this` — `this` is banned everywhere (D-12). */
export const noThis = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `this`; capture state in closures instead (Sumi D-12).',
    },
    messages: {
      noThis:
        '`this` is not allowed in Sumi (D-12): with classes gone, state lives in closure variables.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    ThisExpression: (node) => {
      context.report({ node, messageId: 'noThis' });
    },
  }),
});

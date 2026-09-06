import { createRule } from './create-rule.mjs';

/** `classes/no-class` — class declarations and expressions are banned (D-12). */
export const noClass = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow class syntax; use closure factories, structural interfaces and tagged unions (Tsubu D-12).',
    },
    messages: {
      noClass:
        'class is not allowed in Tsubu (D-12): write a closure-based factory function with a structural interface instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    ClassDeclaration: (node) => {
      context.report({ node, messageId: 'noClass' });
    },
    ClassExpression: (node) => {
      context.report({ node, messageId: 'noClass' });
    },
  }),
});

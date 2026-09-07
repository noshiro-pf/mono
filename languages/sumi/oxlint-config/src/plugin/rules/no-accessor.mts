import { createRule } from './create-rule.mjs';

/**
 * `banned-syntax/no-accessor` — getters and setters are banned in object
 * literals (and, for completeness, in the already-banned classes) (D-33).
 */
export const noAccessor = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow getters and setters; use an explicit function property or memoize (Sumi D-33).',
    },
    messages: {
      noAccessor:
        'Getters and setters are not allowed in Sumi (D-33): a property access must not run code. Use an explicit function property (`x: () => ...`) or memoize.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    Property: (node) => {
      if (node.kind === 'get' || node.kind === 'set') {
        context.report({ node, messageId: 'noAccessor' });
      }
    },
    MethodDefinition: (node) => {
      if (node.kind === 'get' || node.kind === 'set') {
        context.report({ node, messageId: 'noAccessor' });
      }
    },
  }),
});

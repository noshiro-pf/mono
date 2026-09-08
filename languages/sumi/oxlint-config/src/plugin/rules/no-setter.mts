import { createRule } from './create-rule.mjs';

/**
 * `banned-syntax/no-setter` — setters are banned in object literals (and,
 * for completeness, in the already-banned classes): an assignment must not
 * run code, and a setter is a mutation (D-33 / D-47). Getters are allowed in
 * Sumi lint and Sumi sugar (D-47): a getter is an ordinary function-call API
 * spelled as a property, and TypeScript code in the wild uses it; Sumi
 * refined drops it.
 */
export const noSetter = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow setters; a getter is allowed, a setter is a hidden mutation (Sumi D-33 / D-47).',
    },
    messages: {
      noSetter:
        'Setters are not allowed in Sumi (D-33): an assignment must not run code, and a setter is a mutation. Use an explicit function property (`setX: (v) => ...`).',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    Property: (node) => {
      if (node.kind === 'set') {
        context.report({ node, messageId: 'noSetter' });
      }
    },
    MethodDefinition: (node) => {
      if (node.kind === 'set') {
        context.report({ node, messageId: 'noSetter' });
      }
    },
  }),
});

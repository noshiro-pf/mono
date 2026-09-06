import { createRule } from './create-rule.mjs';

/** `banned-syntax/no-decorator` — decorators are banned. */
export const noDecorator = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow decorators; use higher-order functions (Tsubu spec/banned-syntax.md).',
    },
    messages: {
      noDecorator:
        'decorators are not allowed in Tsubu: compose behavior with higher-order functions instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    Decorator: (node) => {
      context.report({ node, messageId: 'noDecorator' });
    },
  }),
});

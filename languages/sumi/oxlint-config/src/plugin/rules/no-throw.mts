import { createRule } from './create-rule.mjs';

/** `exceptions/no-throw` — `throw` is banned; failures are `Result` values. */
export const noThrow = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow throw statements; return a Result instead (Sumi spec/exceptions.md).',
    },
    messages: {
      noThrow:
        'throw is not allowed in Sumi: return Result.err(...) and wrap throwing APIs at the boundary with Result.fromThrowable.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    ThrowStatement: (node) => {
      context.report({ node, messageId: 'noThrow' });
    },
  }),
});

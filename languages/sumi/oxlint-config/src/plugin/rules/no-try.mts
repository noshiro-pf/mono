import { createRule } from './create-rule.mjs';

/** `exceptions/no-try` — `try..catch` is banned; exceptions are caught only at the boundary by the prelude (D-27). */
export const noTry = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow try statements; wrap throwing APIs with Result.fromThrowable / fromPromise (Sumi spec/exceptions.md).',
    },
    messages: {
      noTry:
        'try..catch is not allowed in Sumi: catch exceptions only at the boundary with Result.fromThrowable / Result.fromPromise, and return a Result.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    TryStatement: (node) => {
      context.report({ node, messageId: 'noTry' });
    },
  }),
});

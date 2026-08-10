import { createRule } from './common.mjs';

/** An ESLint rule to ban unsafe assignment to optional properties. */

export const noUnsafeOptionalPropertyAssignment = createRule({
  name: 'no-unsafe-readonly-mutable-assignment',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans unsafe assignment to optional properties.',
    },
    messages: {},
    schema: [],
    deprecated: true,
  },

  create: () => ({}),
  defaultOptions: [],
} as const);

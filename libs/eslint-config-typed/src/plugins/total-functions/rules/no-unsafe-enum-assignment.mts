import { createRule } from './common.mjs';

/** An ESLint rule to ban unsafe enum assignments. */

export const noUnsafeEnumAssignment = createRule({
  name: 'no-unsafe-enum-assignment',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans unsafe enum assignment.',
    },
    messages: {},
    schema: [],
    deprecated: true,
  },

  create: () => ({}),
  defaultOptions: [],
} as const);

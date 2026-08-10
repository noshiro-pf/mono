import { createRule } from './common.mjs';

/** An ESLint rule to ban enums. */

export const noEnums = createRule({
  name: 'no-enums',
  meta: {
    type: 'problem',
    docs: {
      description: 'Bans enums.',
    },
    messages: {
      errorStringGeneric: "Don't declare enums.",
    },
    schema: [],
  },
  create: (context) => ({
    TSEnumDeclaration: (node) => {
      context.report({
        node,
        messageId: 'errorStringGeneric',
      } as const);
    },
  }),
  defaultOptions: [],
} as const);

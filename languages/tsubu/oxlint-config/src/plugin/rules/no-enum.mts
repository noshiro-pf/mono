import { createRule } from './create-rule.mjs';

/** `banned-syntax/no-enum` — enums are not erasable syntax (D-4). */
export const noEnum = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow enum declarations; use a union of string literals (Tsubu D-4).',
    },
    messages: {
      noEnum:
        'enum is not allowed in Tsubu (D-4, erasable syntax only): use a union of string literals or an `as const` object.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    TSEnumDeclaration: (node) => {
      context.report({ node, messageId: 'noEnum' });
    },
  }),
});

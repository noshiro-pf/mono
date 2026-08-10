// eslint-disable import-x/no-internal-modules
import {
  type RuleListener,
  type RuleModule,
} from '@typescript-eslint/utils/ts-eslint';
import { createRule } from './common.mjs';

/** An ESLint rule to ban enums. */

export const noEnums = createRule<readonly [], 'errorStringGeneric'>({
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
} as const) satisfies RuleModule<
  string,
  readonly unknown[],
  unknown,
  RuleListener
>;

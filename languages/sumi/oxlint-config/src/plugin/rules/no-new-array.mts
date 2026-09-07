import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { createRule } from './create-rule.mjs';

/**
 * `banned-syntax/no-new-array` — `new Array(...)` in every form is banned
 * (its single-numeric-argument case, which ESLint's `no-array-constructor`
 * allows, is exactly the trap). The call form `Array(...)` is covered by
 * `no-constructor-call`.
 */
export const noNewArray = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `new Array(...)`; use an array literal or Arr.newArray / Arr.seq (Sumi spec/banned-syntax.md).',
    },
    messages: {
      noNewArray:
        '`new Array(...)` is not allowed in Sumi: a single numeric argument creates holes. Use an array literal, or `Arr.newArray` / `Arr.seq` from ts-data-forge.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    NewExpression: (node) => {
      if (
        node.callee.type === AST_NODE_TYPES.Identifier &&
        node.callee.name === 'Array'
      ) {
        context.report({ node, messageId: 'noNewArray' });
      }
    },
  }),
});

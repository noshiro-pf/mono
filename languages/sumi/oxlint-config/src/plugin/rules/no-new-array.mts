import { createRule } from './create-rule.mjs';
import { globalReferenceName } from './global-reference.mjs';

/**
 * `banned-syntax/no-new-array` — `new Array(...)` in every form is banned (its
 * single-numeric-argument case, which ESLint's `no-array-constructor` allows,
 * is exactly the trap). The call form `Array(...)` is covered by
 * `no-constructor-call`. A type wrapper around the constructor
 * (`new (Array as ArrayConstructor)(3)`) is looked through, the global object's
 * property (`new globalThis.Array(3)`) is the same constructor, and a locally
 * declared `Array` is not the global.
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
    defaultOptions: [],
  },
  create: (context) => ({
    NewExpression: (node) => {
      if (globalReferenceName(context.sourceCode, node.callee) === 'Array') {
        context.report({ node, messageId: 'noNewArray' });
      }
    },
  }),
});

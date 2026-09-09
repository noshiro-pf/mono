import { createRule } from './create-rule.mjs';

/**
 * `null/no-null-in-type` — the `null` type keyword does not appear in a type
 * (Sumi spec/null-undefined.md, D-27). "No value" is `undefined`; a `null`
 * that comes from outside is normalized at the boundary with `?? undefined`,
 * so it never reaches a declaration.
 *
 * This is the syntactic half of the rule. It catches every written `null`
 * type — in an alias, a parameter, a return type, a property, a generic
 * argument — which is most of what the spec forbids. The other half, a
 * declaration whose *inferred* type includes `null`, needs type information
 * and is not implemented yet.
 */
export const noNullInType = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the `null` type keyword; write `undefined` and normalize at the boundary (Sumi D-27).',
    },
    messages: {
      noNullInType:
        'The `null` type is not allowed in Sumi: "no value" is `undefined`. Normalize a `null` from outside at the boundary (`?? undefined`) so it never reaches a declaration.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    TSNullKeyword: (node) => {
      // `typeof x === 'object' && x !== null` narrowing is an expression, not
      // a type; only the type keyword reaches this visitor.
      context.report({ node, messageId: 'noNullInType' });
    },
  }),
});

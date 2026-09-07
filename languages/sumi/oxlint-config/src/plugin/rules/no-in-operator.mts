import { createRule } from './create-rule.mjs';

/** `banned-syntax/no-in-operator` — the `in` operator (narrowing idiom) is banned. */
export const noInOperator = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow the `in` operator; narrow with isRecord + hasKey (Sumi spec/banned-syntax.md).',
    },
    messages: {
      noIn: 'The `in` operator is not allowed in Sumi: it walks the prototype chain and narrows imprecisely. Use `isRecord` + `hasKey` from ts-data-forge.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    BinaryExpression: (node) => {
      if (node.operator === 'in') {
        context.report({ node, messageId: 'noIn' });
      }
    },
  }),
});

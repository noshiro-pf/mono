import { createRule } from './create-rule.mjs';

/**
 * `jsx/generic-arrow-trailing-comma` — an arrow function with a single type
 * parameter is written `<T,>(...)`, in every file (D-11): the trailing comma
 * is what keeps the generic unambiguous under the JSX grammar, and writing it
 * everywhere keeps the spelling independent of the file extension.
 */
export const genericArrowTrailingComma = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require the trailing comma in a single-type-parameter arrow function (`<T,>`) (Sumi D-11).',
    },
    fixable: 'code',
    messages: {
      trailingComma:
        'Write a single-type-parameter arrow function as `<{{name}},>(...)` (D-11): the trailing comma is what disambiguates it from JSX, and Sumi spells it that way in every file.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    ArrowFunctionExpression: (node) => {
      // (oxlint hands over `null`, not `undefined`, for an absent declaration;
      // optional chaining covers both.)
      const params = node.typeParameters?.params ?? [];

      if (params.length !== 1) return;

      const [param] = params;

      if (param === undefined) return;

      const declaration = param.parent;

      if (/,\s*>$/u.test(context.sourceCode.getText(declaration))) return;

      context.report({
        node: declaration,
        messageId: 'trailingComma',
        data: { name: param.name.name },
        fix: (fixer) => fixer.insertTextAfter(param, ','),
      });
    },
  }),
});

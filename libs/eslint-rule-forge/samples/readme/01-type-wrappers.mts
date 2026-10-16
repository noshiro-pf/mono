import { AST_NODE_TYPES, type TSESLint } from '@typescript-eslint/utils';
import { getArgumentText, skipTypeWrappers } from 'eslint-rule-forge';

// Reports `Number(x)`, also written `(Number as NumberConstructor)(x)` or
// `Number!(x)`, and rewrites it to `toNumber(x)`.
export const noNumberCall: TSESLint.RuleModule<'noNumberCall'> = {
  meta: {
    type: 'suggestion',
    messages: { noNumberCall: 'Use `toNumber` instead of `Number`.' },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    CallExpression: (node) => {
      // Judge the syntax on the expression inside the wrappers ...
      const callee = skipTypeWrappers(node.callee);

      const [argument] = node.arguments;

      if (
        argument === undefined ||
        callee.type !== AST_NODE_TYPES.Identifier ||
        callee.name !== 'Number'
      ) {
        return;
      }

      context.report({
        node,
        messageId: 'noNumberCall',
        // ... and write the fix from the original nodes, keeping a sequence
        // argument `(a, b)` one argument.
        fix: (fixer) =>
          fixer.replaceText(
            node,
            `toNumber(${getArgumentText(context.sourceCode, argument)})`,
          ),
      });
    },
  }),
} as const;

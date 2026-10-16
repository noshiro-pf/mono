import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildNamedImportFix,
  getArgumentText,
  getImportDeclarations,
  getNamedImports,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import { asLengthAccess, isArrayOrTupleExpression } from './ast-utils.mjs';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'useIsNonEmpty';

export const preferArrIsNonEmpty: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `xs.length > 0` with `Arr.isNonEmpty(xs)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsNonEmpty:
        'Replace `{{original}}` with `Arr.isNonEmpty({{arrayName}})` from ts-data-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImports = getImportDeclarations(
      program,
      TS_DATA_FORGE_MODULE,
    );

    const services = context.sourceCode.parserServices;

    const mut_nodesToFix: {
      node: TSESTree.BinaryExpression;
      arrayExpression: TSESTree.Expression;
    }[] = [];

    return {
      BinaryExpression: (node) => {
        // Check for `xs.length > 0` or `0 < xs.length`
        if (node.operator !== '>' && node.operator !== '<') {
          return;
        }

        const isLengthOnLeft = node.operator === '>';

        // Both sides are read through type wrappers.
        const lengthSide = asLengthAccess(
          node[isLengthOnLeft ? 'left' : 'right'],
        );

        const numberSide = skipTypeWrappers(
          node[isLengthOnLeft ? 'right' : 'left'],
        );

        // Check if one side is `.length` and the other is 0
        if (
          lengthSide === undefined ||
          numberSide.type !== AST_NODE_TYPES.Literal ||
          numberSide.value !== 0
        ) {
          return;
        }

        const arrayExpression = lengthSide.object;

        // Check if arrayExpression is actually an array type
        if (!isArrayOrTupleExpression(services, arrayExpression)) {
          return;
        }

        mut_nodesToFix.push({
          node,
          arrayExpression,
        });
      },
      'Program:exit': () => {
        const namedImports = getNamedImports(tsDataForgeImports);

        const hasArrImport = namedImports.includes('Arr');

        for (const [
          index,
          { node, arrayExpression },
        ] of mut_nodesToFix.entries()) {
          const arrayText = getArgumentText(sourceCode, arrayExpression);

          const originalText = sourceCode.getText(node);

          context.report({
            node,
            messageId: 'useIsNonEmpty',
            data: {
              original: originalText,
              arrayName: arrayText,
            },
            fix: (fixer) => {
              const replacement = `Arr.isNonEmpty(${arrayText})`;

              const importFixes =
                index === 0 && !hasArrImport
                  ? buildNamedImportFix(fixer, program, TS_DATA_FORGE_MODULE, [
                      'Arr',
                    ])
                  : [];

              return [...importFixes, fixer.replaceText(node, replacement)];
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
} as const;

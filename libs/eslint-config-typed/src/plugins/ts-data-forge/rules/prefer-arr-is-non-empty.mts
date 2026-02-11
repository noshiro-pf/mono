import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

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

    const tsDataForgeImport = getTsDataForgeImport(program);

    const services = context.sourceCode.parserServices;

    const mut_nodesToFix: {
      node: TSESTree.BinaryExpression;
      arrayExpression: TSESTree.Expression;
    }[] = [];

    return {
      BinaryExpression: (node) => {
        // Check for `xs.length > 0` or `0 < xs.length`
        if (node.operator !== '>' && node.operator !== '<') return;

        const isLengthOnLeft = node.operator === '>';

        const lengthSide = isLengthOnLeft ? node.left : node.right;

        const numberSide = isLengthOnLeft ? node.right : node.left;

        // Check if one side is `.length` and the other is 0
        if (
          lengthSide.type !== AST_NODE_TYPES.MemberExpression ||
          lengthSide.property.type !== AST_NODE_TYPES.Identifier ||
          lengthSide.property.name !== 'length' ||
          numberSide.type !== AST_NODE_TYPES.Literal ||
          numberSide.value !== 0
        ) {
          return;
        }

        const arrayExpression = lengthSide.object;

        // Check if arrayExpression is actually an array type
        if (services?.program !== undefined && services.program !== null) {
          const checker = services.program.getTypeChecker();

          const tsNode = services.esTreeNodeToTSNodeMap?.get(arrayExpression);

          if (tsNode !== undefined) {
            const type = checker.getTypeAtLocation(tsNode);

            // Check if it's an array type or tuple type
            const isArrayType =
              checker.isArrayType(type) || checker.isTupleType(type);

            if (!isArrayType) return;
          } else {
            return;
          }
        } else {
          return;
        }

        mut_nodesToFix.push({
          node,
          arrayExpression,
        });
      },
      'Program:exit': () => {
        const namedImports = getNamedImports(tsDataForgeImport);

        const hasArrImport = namedImports.includes('Arr');

        for (const [
          index,
          { node, arrayExpression },
        ] of mut_nodesToFix.entries()) {
          const arrayText = sourceCode.getText(arrayExpression);

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
                  ? buildImportFixes(fixer, program, tsDataForgeImport, ['Arr'])
                  : [];

              return [...importFixes, fixer.replaceText(node, replacement)];
            },
          });
        }
      },
    };
  },
  defaultOptions: [],
};

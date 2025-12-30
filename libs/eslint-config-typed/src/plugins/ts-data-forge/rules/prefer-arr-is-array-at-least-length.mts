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

type MessageIds = 'useIsArrayAtLeastLength';

export const preferArrIsArrayAtLeastLength: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `xs.length >= n` with `Arr.isArrayAtLeastLength(xs, n)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsArrayAtLeastLength:
        'Replace `{{original}}` with `Arr.isArrayAtLeastLength({{arrayName}}, {{length}})` from ts-data-forge.',
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
      lengthExpression: TSESTree.Expression;
    }[] = [];

    return {
      BinaryExpression: (node) => {
        // Check for `xs.length >= n` or `n <= xs.length`
        if (node.operator !== '>=' && node.operator !== '<=') return;

        // xs.length >= n  or  n <= xs.length
        const isLengthOnLeft = node.operator === '>=';

        const lengthSide = isLengthOnLeft ? node.left : node.right;

        const valueSide = isLengthOnLeft ? node.right : node.left;

        // Check if lengthSide is accessing .length
        if (!isLengthAccess(lengthSide)) return;

        // lengthSide is MemberExpression accessing .length
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
          lengthExpression: valueSide,
        });
      },
      'Program:exit': () => {
        const namedImports = getNamedImports(tsDataForgeImport);

        const hasArrImport = namedImports.includes('Arr');

        for (const [
          index,
          { node, arrayExpression, lengthExpression },
        ] of mut_nodesToFix.entries()) {
          const arrayText = sourceCode.getText(arrayExpression);

          const lengthText = sourceCode.getText(lengthExpression);

          const originalText = sourceCode.getText(node);

          context.report({
            node,
            messageId: 'useIsArrayAtLeastLength',
            data: {
              original: originalText,
              arrayName: arrayText,
              length: lengthText,
            },
            fix: (fixer) => {
              const replacement = `Arr.isArrayAtLeastLength(${arrayText}, ${lengthText})`;

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

const isLengthAccess = (
  node: DeepReadonly<TSESTree.Expression>,
): node is TSESTree.MemberExpression =>
  node.type === AST_NODE_TYPES.MemberExpression &&
  node.property.type === AST_NODE_TYPES.Identifier &&
  node.property.name === 'length';

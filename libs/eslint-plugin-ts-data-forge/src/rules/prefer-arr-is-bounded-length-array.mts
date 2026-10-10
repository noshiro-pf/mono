import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  isArrayOrTupleExpression,
  isSameArrayText,
  parseLengthComparison,
  toArgumentText,
} from './ast-utils.mjs';
import {
  buildImportFixes,
  getNamedImports,
  getTsDataForgeImport,
} from './import-utils.mjs';

type Options = readonly [];

type MessageIds = 'useIsBoundedLengthArray';

export const preferArrIsBoundedLengthArray: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `xs.length >= min && xs.length <= max` with `Arr.isBoundedLengthArray(xs, min, max)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsBoundedLengthArray:
        'Replace `{{original}}` with `Arr.isBoundedLengthArray({{arrayName}}, {{min}}, {{max}})` from ts-data-forge.',
    },
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const program = sourceCode.ast;

    const tsDataForgeImport = getTsDataForgeImport(program);

    const services = context.sourceCode.parserServices;

    const mut_nodesToFix: {
      node: TSESTree.LogicalExpression;
      arrayExpression: TSESTree.Expression;
      minExpression: TSESTree.Expression;
      maxExpression: TSESTree.Expression;
    }[] = [];

    return {
      LogicalExpression: (node) => {
        // Only `a && b` can encode a `min && max` length range.
        if (node.operator !== '&&') {
          return;
        }

        const left = parseLengthComparison(node.left, sourceCode);

        const right = parseLengthComparison(node.right, sourceCode);

        if (left === undefined || right === undefined) {
          return;
        }

        // Need one lower bound and one upper bound on the same array.
        if (left.kind === right.kind) {
          return;
        }

        if (!isSameArrayText(left.array, right.array, sourceCode)) {
          return;
        }

        const min = left.kind === 'min' ? left : right;

        const max = left.kind === 'min' ? right : left;

        const arrayExpression = min.array;

        // Check if arrayExpression is actually an array type
        if (
          !isArrayOrTupleExpression(services, min.array) ||
          !isArrayOrTupleExpression(services, max.array)
        ) {
          return;
        }

        mut_nodesToFix.push({
          node,
          arrayExpression,
          minExpression: min.bound,
          maxExpression: max.bound,
        });
      },
      'Program:exit': () => {
        const namedImports = getNamedImports(tsDataForgeImport);

        const hasArrImport = namedImports.includes('Arr');

        for (const [
          index,
          { node, arrayExpression, minExpression, maxExpression },
        ] of mut_nodesToFix.entries()) {
          const arrayText = toArgumentText(arrayExpression, sourceCode);

          const minText = sourceCode.getText(minExpression);

          const maxText = sourceCode.getText(maxExpression);

          const originalText = sourceCode.getText(node);

          context.report({
            node,
            messageId: 'useIsBoundedLengthArray',
            data: {
              original: originalText,
              arrayName: arrayText,
              min: minText,
              max: maxText,
            },
            fix: (fixer) => {
              const replacement = `Arr.isBoundedLengthArray(${minText}, ${maxText}, ${arrayText})`;

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
} as const;

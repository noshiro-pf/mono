import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  buildNamedImportFix,
  getArgumentText,
  getImportDeclarations,
  getNamedImports,
  skipTypeWrappers,
} from 'eslint-rule-forge';
import {
  asLengthAccess,
  isArrayOrTupleExpression,
  isIntegerLiteralOrConstant,
  isPartOfBoundedLengthCheck,
} from './ast-utils.mjs';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

type Options = readonly [];

type MessageIds = 'useIsMinLengthArray';

export const preferArrIsMinLengthArray: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `xs.length >= n` with `Arr.isMinLengthArray(xs, n)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsMinLengthArray:
        'Replace `{{original}}` with `Arr.isMinLengthArray({{arrayName}}, {{length}})` from ts-data-forge.',
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
      lengthExpression: TSESTree.Expression;
    }[] = [];

    return {
      BinaryExpression: (node) => {
        // Check for `xs.length >= n` or `n <= xs.length`
        if (node.operator !== '>=' && node.operator !== '<=') {
          return;
        }

        // Defer to `prefer-arr-is-bounded-length-array` when this comparison is
        // the lower bound of a `min && max` pair on the same array.
        if (isPartOfBoundedLengthCheck(node, sourceCode)) {
          return;
        }

        // xs.length >= n  or  n <= xs.length
        const isLengthOnLeft = node.operator === '>=';

        // Both sides are read through type wrappers.
        const lengthSide = asLengthAccess(
          node[isLengthOnLeft ? 'left' : 'right'],
        );

        const valueSide = node[isLengthOnLeft ? 'right' : 'left'];

        // Check if lengthSide is accessing .length
        if (lengthSide === undefined) {
          return;
        }

        // Only match integer literals or const variables initialized with integer literals
        if (!isIntegerLiteralOrConstant(valueSide, sourceCode)) {
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
          // The literal or constant itself: a wrapper such as `as number`
          // would only widen the length the guard narrows to.
          lengthExpression: skipTypeWrappers(valueSide),
        });
      },
      'Program:exit': () => {
        const namedImports = getNamedImports(tsDataForgeImports);

        const hasArrImport = namedImports.includes('Arr');

        for (const [
          index,
          { node, arrayExpression, lengthExpression },
        ] of mut_nodesToFix.entries()) {
          const arrayText = getArgumentText(sourceCode, arrayExpression);

          const lengthText = sourceCode.getText(lengthExpression);

          const originalText = sourceCode.getText(node);

          context.report({
            node,
            messageId: 'useIsMinLengthArray',
            data: {
              original: originalText,
              arrayName: arrayText,
              length: lengthText,
            },
            fix: (fixer) => {
              const replacement = `Arr.isMinLengthArray(${lengthText}, ${arrayText})`;

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

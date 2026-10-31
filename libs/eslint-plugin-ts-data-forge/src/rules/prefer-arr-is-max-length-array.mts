import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { getArgumentText, skipTypeWrappers } from 'eslint-rule-forge';
import {
  asLengthAccess,
  isArrayOrTupleExpression,
  isIntegerLiteralOrConstant,
  isPartOfBoundedLengthCheck,
} from './ast-utils.mjs';
import { tsDataForgeValueAt } from './import-binding.mjs';

type Options = readonly [];

type MessageIds = 'useIsMaxLengthArray';

export const preferArrIsMaxLengthArray: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `xs.length <= n` with `Arr.isMaxLengthArray(xs, n)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsMaxLengthArray:
        'Replace `{{original}}` with `Arr.isMaxLengthArray({{arrayName}}, {{length}})` from ts-data-forge.',
    },
    defaultOptions: [],
  },

  create: (context) => {
    const sourceCode = context.sourceCode;

    const services = context.sourceCode.parserServices;

    const mut_nodesToFix: {
      node: TSESTree.BinaryExpression;
      arrayExpression: TSESTree.Expression;
      lengthExpression: TSESTree.Expression;
    }[] = [];

    return {
      BinaryExpression: (node) => {
        // Check for `xs.length <= n` or `n >= xs.length`
        if (node.operator !== '>=' && node.operator !== '<=') {
          return;
        }

        // Defer to `prefer-arr-is-bounded-length-array` when this comparison is
        // the upper bound of a `min && max` pair on the same array.
        if (isPartOfBoundedLengthCheck(node, sourceCode)) {
          return;
        }

        // xs.length <= n  or  n >= xs.length
        const isLengthOnLeft = node.operator === '<=';

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
          // The literal or constant itself: a wrapper such as `as number` would
          // only widen the length the guard narrows to.
          lengthExpression: skipTypeWrappers(valueSide),
        });
      },
      'Program:exit': () => {
        const arrAt = tsDataForgeValueAt(sourceCode, 'Arr');

        for (const {
          node,
          arrayExpression,
          lengthExpression,
        } of mut_nodesToFix) {
          const arrayText = getArgumentText(sourceCode, arrayExpression);

          const lengthText = sourceCode.getText(lengthExpression);

          const originalText = sourceCode.getText(node);

          const arr = arrAt(node);

          context.report({
            node,
            messageId: 'useIsMaxLengthArray',
            data: {
              original: originalText,
              arrayName: arrayText,
              length: lengthText,
            },
            fix:
              arr === undefined
                ? null
                : (fixer) => {
                    const replacement = `${arr.localName}.isMaxLengthArray(${lengthText}, ${arrayText})`;

                    return [
                      ...arr.edits(fixer),
                      fixer.replaceText(node, replacement),
                    ];
                  },
          });
        }
      },
    };
  },
} as const;

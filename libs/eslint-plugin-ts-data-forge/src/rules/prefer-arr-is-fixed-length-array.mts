import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import { getArgumentText, skipTypeWrappers } from 'eslint-rule-forge';
import {
  asLengthAccess,
  isArrayOrTupleExpression,
  isIntegerLiteralOrConstant,
} from './ast-utils.mjs';
import { tsDataForgeValueAt } from './import-binding.mjs';

type Options = readonly [];

type MessageIds = 'useIsFixedLengthArray';

export const preferArrIsFixedLengthArray: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Replace `xs.length === n` with `Arr.isFixedLengthArray(xs, n)` from ts-data-forge.',
    },
    fixable: 'code',
    schema: [],
    messages: {
      useIsFixedLengthArray:
        'Replace `{{original}}` with `Arr.isFixedLengthArray({{arrayName}}, {{length}})` from ts-data-forge.',
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
      isNegated: boolean;
    }[] = [];

    return {
      BinaryExpression: (node) => {
        // Check for `xs.length === n` or `n === xs.length` or `xs.length !== n`
        if (node.operator !== '===' && node.operator !== '!==') {
          return;
        }

        const isNegated = node.operator === '!==';

        // Both sides are read through type wrappers.
        const leftLength = asLengthAccess(node.left);

        const isLengthOnLeft = leftLength !== undefined;

        const lengthSide = leftLength ?? asLengthAccess(node.right);

        const valueSide = node[isLengthOnLeft ? 'right' : 'left'];

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
          isNegated,
        });
      },
      'Program:exit': () => {
        const arrAt = tsDataForgeValueAt(sourceCode, 'Arr');

        for (const {
          node,
          arrayExpression,
          lengthExpression,
          isNegated,
        } of mut_nodesToFix) {
          const arrayText = getArgumentText(sourceCode, arrayExpression);

          const lengthText = sourceCode.getText(lengthExpression);

          const originalText = sourceCode.getText(node);

          const arr = arrAt(node);

          context.report({
            node,
            messageId: 'useIsFixedLengthArray',
            data: {
              original: originalText,
              arrayName: arrayText,
              length: lengthText,
            },
            fix:
              arr === undefined
                ? null
                : (fixer) => {
                    const baseCall = `${arr.localName}.isFixedLengthArray(${lengthText}, ${arrayText})`;

                    const replacement = isNegated ? `!${baseCall}` : baseCall;

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

import {
  AST_NODE_TYPES,
  ESLintUtils,
  type TSESLint,
} from '@typescript-eslint/utils';
import { Arr } from 'ts-data-forge';
import * as ts from 'typescript';

type MessageIds = 'preferAssertIsFalseOverExpectFalse';

type Options = readonly [];

export const preferAssertIsFalseOverExpectFalseRule: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Prefer assert.isFalse(X) over expect(X).toBe(false) (only if X is boolean)',
    },
    fixable: 'code',
    schema: [],
    messages: {
      preferAssertIsFalseOverExpectFalse:
        'Use assert.isFalse(X) instead of expect(X).toBe(false)',
    },
  },
  defaultOptions: [],
  create: (context) => {
    const parserServices = ESLintUtils.getParserServices(context);

    const checker = parserServices.program.getTypeChecker();

    return {
      CallExpression: (node) => {
        if (
          node.callee.type === AST_NODE_TYPES.MemberExpression &&
          node.callee.object.type === AST_NODE_TYPES.CallExpression &&
          node.callee.object.callee.type === AST_NODE_TYPES.Identifier &&
          node.callee.object.callee.name === 'expect' &&
          node.callee.property.type === AST_NODE_TYPES.Identifier &&
          node.callee.property.name === 'toBe' &&
          Arr.isArrayOfLength(node.arguments, 1) &&
          node.arguments[0].type === AST_NODE_TYPES.Literal &&
          node.arguments[0].value === false
        ) {
          const arg = node.callee.object.arguments[0];

          if (arg !== undefined) {
            const tsNode = parserServices.esTreeNodeToTSNodeMap.get(arg);

            const type = checker.getTypeAtLocation(tsNode);

            const isBoolean = (type.flags & ts.TypeFlags.Boolean) !== 0;

            if (!isBoolean) {
              return;
            }
          }

          const argText = context.sourceCode.getText(arg);

          context.report({
            node,
            messageId: 'preferAssertIsFalseOverExpectFalse',
            fix: (fixer) =>
              fixer.replaceText(node, `assert.isFalse(${argText})`),
          });
        }
      },
    };
  },
} as const;

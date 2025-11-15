import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { castDeepMutable } from 'ts-data-forge';
import { getReactMemoArrowFunction, isReactApiCall } from './shared.mjs';

type MessageIds = 'propsParamMustBeNamedProps' | 'propsParamMustBeIdentifier';

// NOTE: component props を "props" という名前に限定する。
// return 文を含む component の props を "props" という名前の変数に限定する。
// 前提： component が React.memo でラップされていること。Arrow function の使用が強制されていること。

export const reactMemoPropsArgumentNameRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Enforces the arrow function passed to React.memo to use a single argument named 'props'.",
    },
    schema: [],
    messages: {
      propsParamMustBeNamedProps:
        "The argument name of the arrow function passed to React.memo should be 'props'.",
      propsParamMustBeIdentifier:
        "The props of a component containing a return statement are limited to a variable named 'props'.",
    },
  },
  create: (context) => ({
    CallExpression: (node: DeepReadonly<TSESTree.CallExpression>) => {
      if (!isReactApiCall(context, node, 'memo')) {
        return;
      }

      const arrowFunction = getReactMemoArrowFunction(node);

      // Detect `React.memo<Props>(({ prop1, prop2 }) => { ... })`
      if (
        arrowFunction === undefined ||
        arrowFunction.body.type !== AST_NODE_TYPES.BlockStatement
      ) {
        return;
      }

      const [firstParam] = arrowFunction.params;

      if (firstParam === undefined) {
        return;
      }

      if (firstParam.type === AST_NODE_TYPES.Identifier) {
        // Restrict props argument name to be "props"
        if (firstParam.name !== 'props') {
          context.report({
            node: castDeepMutable(firstParam),
            messageId: 'propsParamMustBeNamedProps',
          });
        }

        return;
      }

      context.report({
        node: castDeepMutable(firstParam),
        messageId: 'propsParamMustBeIdentifier',
      });
    },
  }),
  defaultOptions: [],
};

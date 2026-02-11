import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { castDeepMutable } from 'ts-data-forge';
import { getReactMemoArrowFunction, isReactApiCall } from './shared.mjs';

type MessageIds = 'disallowPropsTypeAnnotation';

// 前提： Arrow function の使用が強制されていること。

export const propsTypeAnnotationStyleRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Forbids annotating props directly in the arrow function passed to React.memo.',
    },
    schema: [],
    messages: {
      disallowPropsTypeAnnotation:
        'Replace `React.memo((props: Props) => { ... })` with `React.memo<Props>((props) => { ... })`.',
    },
  },
  create: (context) => ({
    CallExpression: (node: DeepReadonly<TSESTree.CallExpression>) => {
      if (!isReactApiCall(context, node, 'memo')) {
        return;
      }

      const arrowFunction = getReactMemoArrowFunction(node);

      if (arrowFunction?.body.type !== AST_NODE_TYPES.BlockStatement) {
        return;
      }

      const [firstParam] = arrowFunction.params;

      if (firstParam?.type !== AST_NODE_TYPES.Identifier) {
        return;
      }

      if (firstParam.typeAnnotation !== undefined) {
        context.report({
          node: castDeepMutable(firstParam.typeAnnotation),
          messageId: 'disallowPropsTypeAnnotation',
        });
      }
    },
  }),
  defaultOptions: [],
} as const;

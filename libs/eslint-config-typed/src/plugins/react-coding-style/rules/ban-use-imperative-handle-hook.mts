import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { castDeepMutable } from 'ts-data-forge';
import { isReactApiCall } from './shared.mjs';

type MessageIds = 'disallowUseImperativeHandle';

export const banUseImperativeHandleHook: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Restricts specific React hook usage patterns for consistent component styles.',
    },
    schema: [],
    messages: {
      disallowUseImperativeHandle:
        'Move logic to parent component instead of using React.useImperativeHandle.',
    },
  },
  create: (context) => ({
    CallExpression: (node: DeepReadonly<TSESTree.CallExpression>) => {
      if (isReactApiCall(context, node, 'useImperativeHandle')) {
        context.report({
          node: castDeepMutable(node.callee),
          messageId: 'disallowUseImperativeHandle',
        });
      }
    },
  }),
  defaultOptions: [],
} as const;

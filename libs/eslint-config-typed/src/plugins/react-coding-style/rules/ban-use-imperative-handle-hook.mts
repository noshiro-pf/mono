import { type TSESLint, type TSESTree } from '@typescript-eslint/utils';
import { castDeepMutable } from 'ts-data-forge';
import { isReactMemberExpression } from './shared.mjs';

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
    MemberExpression: (node: DeepReadonly<TSESTree.MemberExpression>) => {
      if (isReactMemberExpression(node, 'useImperativeHandle')) {
        context.report({
          node: castDeepMutable(node),
          messageId: 'disallowUseImperativeHandle',
        });
      }
    },
  }),
  defaultOptions: [],
};

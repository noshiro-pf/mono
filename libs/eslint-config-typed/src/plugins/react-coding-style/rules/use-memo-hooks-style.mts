import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { castDeepMutable } from 'ts-data-forge';
import { isReactCallExpression } from './shared.mjs';

type MessageIds = 'disallowUseMemoTypeAnnotation';

export const useMemoHooksStyleRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Restricts React.useMemo hook usage patterns for consistent styles.',
    },
    schema: [],
    messages: {
      disallowUseMemoTypeAnnotation:
        'The variable type T should be annotated as `React.useMemo<T>` or `const v: T = React.useMemo(...)`.',
    },
  },
  create: (context) => ({
    CallExpression: (node: DeepReadonly<TSESTree.CallExpression>) => {
      if (!isReactCallExpression(node, 'useMemo')) {
        return;
      }

      const parent = node.parent;

      if (
        parent.type === AST_NODE_TYPES.TSAsExpression ||
        parent.type === AST_NODE_TYPES.TSTypeAssertion ||
        parent.type === AST_NODE_TYPES.TSSatisfiesExpression
      ) {
        context.report({
          node: castDeepMutable(parent),
          messageId: 'disallowUseMemoTypeAnnotation',
        });
      }

      if (parent.type === AST_NODE_TYPES.TSTypeAnnotation) {
        context.report({
          node: castDeepMutable(parent),
          messageId: 'disallowUseMemoTypeAnnotation',
        });
      }
    },
  }),
  defaultOptions: [],
};

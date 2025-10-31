import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { castDeepMutable } from 'ts-data-forge';

type MessageIds = 'disallowReactFunctionalComponentTypes';

// NOTE: React.FC による型注釈があれば React.memo を使うように促すルール。
// React.FC で型注釈されていない React.memo 化されていないコンポーネントは別途検出する必要がある。

export const componentVarTypeAnnotationRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallows using React.FC / React.FunctionComponent type annotations.',
    },
    schema: [],
    messages: {
      disallowReactFunctionalComponentTypes:
        'Use React.memo<Props>((props) => { ... }) instead.',
    },
  },
  create: (context) => ({
    TSTypeReference: (node: DeepReadonly<TSESTree.TSTypeReference>) => {
      if (isReactFunctionalComponentReference(node.typeName)) {
        context.report({
          node: castDeepMutable(node),
          messageId: 'disallowReactFunctionalComponentTypes',
        });
      }
    },
  }),
  defaultOptions: [],
};

const isReactFunctionalComponentReference = (
  node: DeepReadonly<TSESTree.EntityName>,
): boolean => {
  if (node.type !== AST_NODE_TYPES.TSQualifiedName) {
    return false;
  }

  const left = node.left;
  const right = node.right;

  return (
    left.type === AST_NODE_TYPES.Identifier &&
    left.name === 'React' &&
    (right.name === 'FC' || right.name === 'FunctionComponent')
  );
};

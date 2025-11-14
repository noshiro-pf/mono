import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { castDeepMutable } from 'ts-data-forge';
import { getReactMemoArrowFunction, isReactCallExpression } from './shared.mjs';

type MessageIds =
  | 'requirePropsTypeParameter'
  | 'omitTypeParameterWhenPropsEmpty';

// NOTE: React.memo の型引数を `Props` に限定する。
// これは 1ファイル1コンポーネントの強制も意味する。
// 前提： component が React.memo でラップされていること。

export const reactMemoTypeParameterRule: TSESLint.RuleModule<MessageIds> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        "Requires React.memo calls to have the type parameter 'Props'.",
    },
    schema: [],
    messages: {
      requirePropsTypeParameter:
        "React.memo should have type parameter 'Props'.",
      omitTypeParameterWhenPropsEmpty:
        'Remove the type parameter from React.memo when the component does not accept props.',
    },
  },
  create: (context) => ({
    CallExpression: (node: DeepReadonly<TSESTree.CallExpression>) => {
      if (!isReactCallExpression(node, 'memo')) {
        return;
      }

      const arrowFunction = getReactMemoArrowFunction(node);
      const typeArguments = node.typeArguments;

      // Detects `React.memo(...)`
      if (typeArguments === undefined) {
        if (arrowFunction?.params.length === 0) {
          return;
        }

        context.report({
          node: castDeepMutable(node.callee),
          messageId: 'requirePropsTypeParameter',
        });

        return;
      }

      if (arrowFunction?.params.length === 0) {
        context.report({
          node: castDeepMutable(typeArguments),
          messageId: 'omitTypeParameterWhenPropsEmpty',
        });

        return;
      }

      if (typeArguments.params.length !== 1) {
        context.report({
          node: castDeepMutable(typeArguments),
          messageId: 'requirePropsTypeParameter',
        });

        return;
      }

      const [firstParameter] = typeArguments.params;

      if (!isPropsTypeReference(firstParameter)) {
        const reportTarget = firstParameter ?? node.callee;

        context.report({
          node: castDeepMutable(reportTarget),
          messageId: 'requirePropsTypeParameter',
        });
      }
    },
  }),
  defaultOptions: [],
};

const isPropsTypeReference = (
  node: DeepReadonly<TSESTree.TypeNode> | undefined,
): boolean => {
  if (node === undefined) {
    return false;
  }

  // Detects `React.memo<{ prop1: number }>(...)`
  if (node.type !== AST_NODE_TYPES.TSTypeReference) {
    return false;
  }

  const typeName = node.typeName;

  // Detects `React.memo<NotProps>(...)`, `React.memo<Readonly<{ prop1: number }>>(...)`
  return (
    typeName.type === AST_NODE_TYPES.Identifier && typeName.name === 'Props'
  );
};

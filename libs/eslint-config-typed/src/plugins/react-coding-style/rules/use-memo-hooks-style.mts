import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { castDeepMutable, hasKey } from 'ts-data-forge';
import { isReactApiCall } from './shared.mjs';

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
      if (!isReactApiCall(context, node, 'useMemo')) {
        return;
      }

      const parent = node.parent;

      if (
        (parent.type === AST_NODE_TYPES.TSAsExpression ||
          parent.type === AST_NODE_TYPES.TSTypeAssertion) &&
        !isConstAssertion(parent.typeAnnotation)
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

      const [firstArg] = node.arguments;

      if (firstArg?.type === AST_NODE_TYPES.ArrowFunctionExpression) {
        const { returnType, body } = firstArg;

        if (returnType !== undefined) {
          context.report({
            node: castDeepMutable(returnType),
            messageId: 'disallowUseMemoTypeAnnotation',
          });
        }

        checkNodeForTypeAnnotations(context, body);
      }
    },
  }),
  defaultOptions: [],
} as const;

const checkNodeForTypeAnnotations = (
  context: DeepReadonly<TSESLint.RuleContext<MessageIds, []>>,
  node: DeepReadonly<TSESTree.Node>,
): void => {
  if (
    node.type === AST_NODE_TYPES.TSAsExpression ||
    node.type === AST_NODE_TYPES.TSTypeAssertion
  ) {
    if (!isConstAssertion(node.typeAnnotation)) {
      context.report({
        node: castDeepMutable(node),
        messageId: 'disallowUseMemoTypeAnnotation',
      });
    }

    return;
  }

  if (hasKey(node, 'body')) {
    const nodeWithBody = node;

    if (nodeWithBody.body !== undefined && nodeWithBody.body !== null) {
      checkNodeForTypeAnnotations(
        context,
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        nodeWithBody.body as DeepReadonly<TSESTree.Node>,
      );
    }
  }

  if (hasKey(node, 'expression')) {
    const nodeWithExpression = node;

    checkNodeForTypeAnnotations(
      context,
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      nodeWithExpression.expression as DeepReadonly<TSESTree.Node>,
    );
  }

  if (hasKey(node, 'argument')) {
    const nodeWithArgument = node;

    checkNodeForTypeAnnotations(
      context,
      // FIXME: Enable @typescript-eslint/no-deprecated
      // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-deprecated
      nodeWithArgument.argument as DeepReadonly<TSESTree.Node>,
    );
  }
};

const isConstAssertion = (
  node: DeepReadonly<TSESTree.Node> | undefined,
): node is TSESTree.TSTypeReference => {
  if (node === undefined) {
    return false;
  }

  return (
    node.type === AST_NODE_TYPES.TSTypeReference &&
    node.typeName.type === AST_NODE_TYPES.Identifier &&
    node.typeName.name === 'const'
  );
};

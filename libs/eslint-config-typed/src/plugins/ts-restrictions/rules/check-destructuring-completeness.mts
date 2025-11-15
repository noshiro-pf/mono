import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import type * as ts from 'typescript';

type Options = readonly [
  Readonly<{
    alwaysCheckReactComponentProps?: boolean;
    directiveKeyword?: string;
  }>?,
];

type MessageIds = 'incompleteDestructuring';

const DEFAULT_DIRECTIVE_KEYWORD = '@check-destructuring-completeness';

export const checkDestructuringCompleteness: TSESLint.RuleModule<
  MessageIds,
  Options
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure all properties are destructured from an object when explicitly requested',
    },
    schema: [
      {
        type: 'object',
        properties: {
          alwaysCheckReactComponentProps: {
            type: 'boolean',
            description:
              'Always check React component props destructuring without directive keyword',
          },
          directiveKeyword: {
            type: 'string',
            description:
              'Custom directive keyword to enable checking (default: "@check-destructuring-completeness")',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      incompleteDestructuring:
        'Not all properties are destructured. Missing: {{missingProps}}',
    },
  },

  create: (context) => {
    const parserServices = context.sourceCode.parserServices;

    if (
      parserServices?.program === undefined ||
      parserServices.program === null ||
      parserServices.esTreeNodeToTSNodeMap === undefined
    ) {
      return {};
    }

    const options = context.options[0] ?? {};

    const alwaysCheckReactComponentProps =
      options.alwaysCheckReactComponentProps ?? true;

    const directiveKeyword =
      options.directiveKeyword ?? DEFAULT_DIRECTIVE_KEYWORD;

    const typeChecker = parserServices.program.getTypeChecker();

    const esTreeNodeToTSNodeMap = parserServices.esTreeNodeToTSNodeMap;

    const sourceCode = context.sourceCode;

    const hasDirectiveComment = (
      node: DeepReadonly<TSESTree.VariableDeclarator>,
    ): boolean => {
      // Get the parent VariableDeclaration
      const parent = node.parent;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (parent?.type !== AST_NODE_TYPES.VariableDeclaration) {
        return false;
      }

      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      const comments = sourceCode.getCommentsBefore(parent as never);

      return comments.some((comment) =>
        comment.value.includes(directiveKeyword),
      );
    };

    const isReactComponentPropsDestructuring = (
      node: DeepReadonly<TSESTree.VariableDeclarator>,
    ): boolean => {
      if (!alwaysCheckReactComponentProps) return false;

      const parent = node.parent;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (parent === undefined) return false;

      // Case 1: const { a, b } = props; inside component
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (parent.type === AST_NODE_TYPES.VariableDeclaration) {
        const grandParent = parent.parent;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (grandParent === undefined) return false;

        // Check if we're inside a BlockStatement of an arrow function component
        if (grandParent.type === AST_NODE_TYPES.BlockStatement) {
          const greatGrandParent = grandParent.parent;

          if (
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            greatGrandParent?.type === AST_NODE_TYPES.ArrowFunctionExpression &&
            node.init?.type === AST_NODE_TYPES.Identifier
          ) {
            const initName =
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              node.init.type === AST_NODE_TYPES.Identifier
                ? node.init.name
                : undefined;

            if (
              initName !== undefined &&
              greatGrandParent.params.some(
                (param) =>
                  param.type === AST_NODE_TYPES.Identifier &&
                  param.name === initName,
              )
            ) {
              return isReactComponentFunction(greatGrandParent);
            }
          }
        }

        if (grandParent.type === AST_NODE_TYPES.ArrowFunctionExpression) {
          return isReactComponentFunction(grandParent);
        }
      }

      return false;
    };

    const checkNode = (
      node: DeepReadonly<TSESTree.VariableDeclarator>,
    ): void => {
      if (node.id.type !== AST_NODE_TYPES.ObjectPattern) return;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (node.init === undefined || node.init === null) return;

      const shouldCheck =
        hasDirectiveComment(node) || isReactComponentPropsDestructuring(node);

      if (!shouldCheck) return;

      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      const tsNode = esTreeNodeToTSNodeMap.get(node.init as never);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (tsNode === undefined) return;

      const type = typeChecker.getTypeAtLocation(tsNode);

      const objectProps = getObjectTypeProperties(type);

      const destructuredProps = new Set<string>();

      for (const prop of node.id.properties) {
        if (
          prop.type === AST_NODE_TYPES.Property &&
          prop.key.type === AST_NODE_TYPES.Identifier
        ) {
          // eslint-disable-next-line functional/immutable-data
          destructuredProps.add(prop.key.name);
        }
      }

      const missingProps = objectProps.filter(
        (prop) => !destructuredProps.has(prop),
      );

      if (missingProps.length > 0) {
        context.report({
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          node: node.id as never,
          messageId: 'incompleteDestructuring',
          data: {
            missingProps: missingProps.join(', '),
          },
        });
      }
    };

    return {
      VariableDeclarator: checkNode,
      ArrowFunctionExpression: (node) => {
        if (!alwaysCheckReactComponentProps) return;

        if (!isReactComponentFunction(node)) return;

        for (const param of node.params) {
          if (param.type === AST_NODE_TYPES.ObjectPattern) {
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            const tsNode = esTreeNodeToTSNodeMap.get(param as never);

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (tsNode === undefined) continue;

            const type = typeChecker.getTypeAtLocation(tsNode);

            const objectProps = getObjectTypeProperties(type);

            const destructuredProps = new Set<string>();

            for (const prop of param.properties) {
              if (
                prop.type === AST_NODE_TYPES.Property &&
                prop.key.type === AST_NODE_TYPES.Identifier
              ) {
                // eslint-disable-next-line functional/immutable-data
                destructuredProps.add(prop.key.name);
              }
            }

            const missingProps = objectProps.filter(
              (prop) => !destructuredProps.has(prop),
            );

            if (missingProps.length > 0) {
              context.report({
                node: param,
                messageId: 'incompleteDestructuring',
                data: {
                  missingProps: missingProps.join(', '),
                },
              });
            }
          }
        }
      },
    };
  },
  defaultOptions: [{ alwaysCheckReactComponentProps: true }],
};

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
const getObjectTypeProperties = (type: ts.Type): readonly string[] => {
  try {
    const properties = type.getProperties();

    // Limit to reasonable number of properties to avoid hangs
    if (properties.length > 1000) {
      return [];
    }

    return properties
      .map((prop) => prop.name)
      .filter(
        (name) =>
          // Filter out symbol properties and internal properties
          !name.startsWith('__') &&
          // Only include string property names
          typeof name === 'string' &&
          name.length > 0,
      );
  } catch {
    // If there's any error getting properties, return empty array
    return [];
  }
};

const isReactComponentFunction = (
  node: DeepReadonly<TSESTree.Node> | undefined | null,
): boolean => {
  if (node === undefined || node === null) return false;

  // Arrow function component
  if (node.type === AST_NODE_TYPES.ArrowFunctionExpression) {
    const { body } = node;

    if (body.type === AST_NODE_TYPES.BlockStatement) {
      return body.body.some((statement) => {
        if (statement.type !== AST_NODE_TYPES.ReturnStatement) return false;

        const { argument } = statement;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (argument === null || argument === undefined) return false;

        const argType = (argument as { type?: string }).type;

        return argType === 'JSXElement' || argType === 'JSXFragment';
      });
    }

    const bodyType = (body as { type?: string }).type;

    return bodyType === 'JSXElement' || bodyType === 'JSXFragment';
  }

  return false;
};

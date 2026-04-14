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

    const checkObjectPatternCompleteness = (
      objectPattern: DeepReadonly<TSESTree.ObjectPattern>,
      tsSourceNode: DeepReadonly<TSESTree.Node>,
    ): void => {
      const hasRestElement = objectPattern.properties.some(
        (prop) => prop.type === AST_NODE_TYPES.RestElement,
      );

      if (hasRestElement) return;

      // eslint-disable-next-line total-functions/no-unsafe-type-assertion
      const tsNode = esTreeNodeToTSNodeMap.get(tsSourceNode as never);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (tsNode === undefined) return;

      const type = typeChecker.getTypeAtLocation(tsNode);

      const objectProps = getObjectTypeProperties(type);

      const collected = collectDestructuredPropNames(objectPattern.properties);

      // Dynamic computed properties cannot be resolved statically,
      // so skip completeness check when they are present.
      if (collected.hasDynamicComputedKey) return;

      const missingProps = objectProps.filter(
        (prop) => !collected.names.has(prop),
      );

      if (missingProps.length > 0) {
        context.report({
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          node: objectPattern as never,
          messageId: 'incompleteDestructuring',
          data: {
            missingProps: missingProps.join(', '),
          },
        });
      }
    };

    return {
      VariableDeclarator: (node) => {
        if (node.id.type !== AST_NODE_TYPES.ObjectPattern) return;

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (node.init === undefined || node.init === null) return;

        const shouldCheck =
          hasDirectiveComment(node) || isReactComponentPropsDestructuring(node);

        if (!shouldCheck) return;

        checkObjectPatternCompleteness(node.id, node.init);
      },
      ArrowFunctionExpression: (node) => {
        if (!alwaysCheckReactComponentProps) return;

        if (!isReactComponentFunction(node)) return;

        for (const param of node.params) {
          if (param.type === AST_NODE_TYPES.ObjectPattern) {
            checkObjectPatternCompleteness(param, param);
          }
        }
      },
    };
  },
  defaultOptions: [{ alwaysCheckReactComponentProps: true }],
} as const;

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

const collectDestructuredPropNames = (
  properties: DeepReadonly<TSESTree.ObjectPattern['properties']>,
): Readonly<{
  names: ReadonlySet<string>;
  hasDynamicComputedKey: boolean;
}> => {
  const mut_names = new Set<string>();

  let mut_hasDynamicComputedKey = false;

  for (const prop of properties) {
    if (prop.type !== AST_NODE_TYPES.Property) continue;

    if (!prop.computed) {
      switch (prop.key.type) {
        case AST_NODE_TYPES.Identifier: {
          mut_names.add(prop.key.name);

          break;
        }

        case AST_NODE_TYPES.Literal: {
          if (typeof prop.key.value === 'string') {
            mut_names.add(prop.key.value);
          } else if (typeof prop.key.value === 'number') {
            mut_names.add(String(prop.key.value));
          }

          break;
        }
      }
    } else if (
      prop.key.type === AST_NODE_TYPES.Literal &&
      (typeof prop.key.value === 'string' || typeof prop.key.value === 'number')
    ) {
      // Computed key with a static literal value, e.g. { ['data-id']: val }
      mut_names.add(
        typeof prop.key.value === 'string'
          ? prop.key.value
          : String(prop.key.value),
      );
    } else {
      // Dynamic computed key — cannot resolve statically
      mut_hasDynamicComputedKey = true;
    }
  }

  return { names: mut_names, hasDynamicComputedKey: mut_hasDynamicComputedKey };
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

        const argType = (argument as Readonly<{ type?: string }>).type;

        return argType === 'JSXElement' || argType === 'JSXFragment';
      });
    }

    const bodyType = (body as Readonly<{ type?: string }>).type;

    return bodyType === 'JSXElement' || bodyType === 'JSXFragment';
  }

  return false;
};

import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';

type FixWithOption = Readonly<
  | {
      kind: 'type';
      name: string;
    }
  | {
      kind: 'function';
      name: string;
    }
>;

type RestrictedCastOption =
  | string
  | Readonly<{
      name: string;
      fixWith?: FixWithOption;
    }>;

type Options = readonly RestrictedCastOption[];

type MessageIds = 'restrictedCast';

const getTypeName = (
  typeAnnotation: DeepReadonly<TSESTree.TypeNode> | undefined,
): string | undefined => {
  if (typeAnnotation === undefined) return undefined;

  if (typeAnnotation.type === AST_NODE_TYPES.TSAnyKeyword) {
    return 'any';
  }

  if (typeAnnotation.type === AST_NODE_TYPES.TSUnknownKeyword) {
    return 'unknown';
  }

  if (typeAnnotation.type === AST_NODE_TYPES.TSNeverKeyword) {
    return 'never';
  }

  if (typeAnnotation.type === AST_NODE_TYPES.TSStringKeyword) {
    return 'string';
  }

  if (typeAnnotation.type === AST_NODE_TYPES.TSNumberKeyword) {
    return 'number';
  }

  if (typeAnnotation.type === AST_NODE_TYPES.TSBooleanKeyword) {
    return 'boolean';
  }

  if (typeAnnotation.type === AST_NODE_TYPES.TSTypeReference) {
    const { typeName } = typeAnnotation;

    if (typeName.type === AST_NODE_TYPES.Identifier) {
      return typeName.name;
    }

    if (typeName.type === AST_NODE_TYPES.TSQualifiedName) {
      const mut_parts: string[] = [];

      // eslint-disable-next-line functional/no-let
      let current:
        | DeepReadonly<TSESTree.Identifier>
        | DeepReadonly<TSESTree.TSQualifiedName> = typeName;

      while (current.type === AST_NODE_TYPES.TSQualifiedName) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (current.right.type === AST_NODE_TYPES.Identifier) {
          mut_parts.unshift(current.right.name);
        }

        if (
          current.left.type !== AST_NODE_TYPES.Identifier &&
          current.left.type !== AST_NODE_TYPES.TSQualifiedName
        ) {
          break;
        }

        current = current.left;
      }

      if (current.type === AST_NODE_TYPES.Identifier) {
        mut_parts.unshift(current.name);
      }

      return mut_parts.join('.');
    }
  }

  return undefined;
};

export const noRestrictedCastName: TSESLint.RuleModule<MessageIds, Options> = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow type assertions with specified type names',
    },
    fixable: 'code',
    schema: {
      type: 'array',
      items: {
        oneOf: [
          {
            type: 'string',
          },
          {
            type: 'object',
            properties: {
              name: { type: 'string' },
              fixWith: {
                type: 'object',
                oneOf: [
                  {
                    type: 'object',
                    properties: {
                      kind: { type: 'string', enum: ['type'] },
                      name: { type: 'string' },
                    },
                    required: ['kind', 'name'],
                    additionalProperties: false,
                  },
                  {
                    type: 'object',
                    properties: {
                      kind: { type: 'string', enum: ['function'] },
                      name: { type: 'string' },
                    },
                    required: ['kind', 'name'],
                    additionalProperties: false,
                  },
                ],
              },
            },
            required: ['name'],
            additionalProperties: false,
          },
        ],
      },
      uniqueItems: true,
      minItems: 0,
    },
    messages: {
      restrictedCast:
        'Type assertion with "{{typeName}}" is not allowed{{fixMessage}}',
    },
  },

  create: (context) => {
    const options = context.options;

    const mut_restrictedTypes = new Map<string, FixWithOption | undefined>();

    for (const option of options) {
      if (typeof option === 'string') {
        mut_restrictedTypes.set(option, undefined);
      } else {
        mut_restrictedTypes.set(option.name, option.fixWith);
      }
    }

    const createFix = (
      node:
        | DeepReadonly<TSESTree.TSAsExpression>
        | DeepReadonly<TSESTree.TSTypeAssertion>,
      fixWith: FixWithOption,
    ): ((fixer: TSESLint.RuleFixer) => TSESLint.RuleFix) => {
      const sourceCode = context.sourceCode;

      const expressionText = sourceCode.getText(
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        node.expression as TSESTree.Node,
      );

      if (fixWith.kind === 'type') {
        return (fixer) =>
          fixer.replaceText(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            node as TSESTree.Node,
            `${expressionText} as ${fixWith.name}`,
          );
      } else {
        // kind === 'function'
        return (fixer) =>
          fixer.replaceText(
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            node as TSESTree.Node,
            `${fixWith.name}(${expressionText})`,
          );
      }
    };

    return {
      TSAsExpression: (node) => {
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        const typeName = getTypeName(node.typeAnnotation as never);

        if (typeName === undefined) return;

        const fixWith = mut_restrictedTypes.get(typeName);

        if (fixWith === undefined && !mut_restrictedTypes.has(typeName)) return;

        context.report({
          node: node.typeAnnotation,
          messageId: 'restrictedCast',
          data: {
            typeName,
            fixMessage:
              fixWith !== undefined
                ? fixWith.kind === 'type'
                  ? `. Use "${fixWith.name}" instead`
                  : `. Use "${fixWith.name}()" instead`
                : '',
          },
          fix: fixWith !== undefined ? createFix(node, fixWith) : undefined,
        });
      },

      TSTypeAssertion: (node) => {
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        const typeName = getTypeName(node.typeAnnotation as never);

        if (typeName === undefined) return;

        const fixWith = mut_restrictedTypes.get(typeName);

        if (fixWith === undefined && !mut_restrictedTypes.has(typeName)) return;

        context.report({
          node: node.typeAnnotation,
          messageId: 'restrictedCast',
          data: {
            typeName,
            fixMessage:
              fixWith !== undefined
                ? fixWith.kind === 'type'
                  ? `. Use "${fixWith.name}" instead`
                  : `. Use "${fixWith.name}()" instead`
                : '',
          },
          fix: fixWith !== undefined ? createFix(node, fixWith) : undefined,
        });
      },
    };
  },
  defaultOptions: [],
} as const;

import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';

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
  if (typeAnnotation === undefined) {
    return undefined;
  }

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

/**
 * Disallows `x as T` / `<T>x` for the configured type names, optionally fixing
 * them to another type or to a function call. The fix adds the parentheses the
 * rewritten expression needs (`1 + <any>s` → `1 + (s as unknown)`,
 * `(a, b) as any` → `cast((a, b))`), which `getText` does not carry over.
 */
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

      // `getText` leaves out the parentheses around the operand in the source,
      // so each fix below adds back the ones its new position needs.
      const expressionText = sourceCode.getText(asNode(node.expression));

      if (fixWith.kind === 'type') {
        if (node.type === AST_NODE_TYPES.TSAsExpression) {
          // Only the type changes; the operand stays as written.
          return (fixer) =>
            fixer.replaceText(asNode(node.typeAnnotation), fixWith.name);
        }

        // `<T>x` is a unary expression and `x as T` a relational one, so both
        // the operand and the result may need parentheses.
        const operandText = PARENTHESES_FREE_AS_OPERAND_TYPES.has(
          node.expression.type,
        )
          ? expressionText
          : `(${expressionText})`;

        const asText = `${operandText} as ${fixWith.name}`;

        return (fixer) =>
          fixer.replaceText(
            asNode(node),
            acceptsAnyExpression(node) ? asText : `(${asText})`,
          );
      }

      // kind === 'function'
      const argumentText =
        node.expression.type === AST_NODE_TYPES.SequenceExpression
          ? `(${expressionText})`
          : expressionText;

      return (fixer) =>
        fixer.replaceText(asNode(node), `${fixWith.name}(${argumentText})`);
    };

    return {
      TSAsExpression: (node) => {
        const typeName = getTypeName(node.typeAnnotation);

        if (typeName === undefined) {
          return;
        }

        const fixWith = mut_restrictedTypes.get(typeName);

        if (fixWith === undefined && !mut_restrictedTypes.has(typeName)) {
          return;
        }

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
        const typeName = getTypeName(node.typeAnnotation);

        if (typeName === undefined) {
          return;
        }

        const fixWith = mut_restrictedTypes.get(typeName);

        if (fixWith === undefined && !mut_restrictedTypes.has(typeName)) {
          return;
        }

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

/**
 * Operand kinds that can stand before `as` without parentheses. Anything else
 * (a binary, conditional or comma expression, an object literal, …) is
 * parenthesized.
 */
const PARENTHESES_FREE_AS_OPERAND_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.ArrayExpression,
  AST_NODE_TYPES.AwaitExpression,
  AST_NODE_TYPES.CallExpression,
  AST_NODE_TYPES.ChainExpression,
  AST_NODE_TYPES.Identifier,
  AST_NODE_TYPES.Literal,
  AST_NODE_TYPES.MemberExpression,
  AST_NODE_TYPES.NewExpression,
  AST_NODE_TYPES.TaggedTemplateExpression,
  AST_NODE_TYPES.TemplateLiteral,
  AST_NODE_TYPES.ThisExpression,
  AST_NODE_TYPES.TSNonNullExpression,
  AST_NODE_TYPES.UnaryExpression,
  AST_NODE_TYPES.UpdateExpression,
]);

/**
 * Whether `node` sits where any expression but a comma expression may stand
 * without parentheses, so that `x as T` can replace it as is.
 */
const acceptsAnyExpression = (
  node:
    | DeepReadonly<TSESTree.TSAsExpression>
    | DeepReadonly<TSESTree.TSTypeAssertion>,
): boolean => {
  const { parent } = node;

  if (ANY_EXPRESSION_PARENT_TYPES.has(parent.type)) {
    return true;
  }

  if (parent.type === AST_NODE_TYPES.ArrowFunctionExpression) {
    return parent.body === node;
  }

  if (
    parent.type === AST_NODE_TYPES.AssignmentExpression ||
    parent.type === AST_NODE_TYPES.AssignmentPattern
  ) {
    return parent.right === node;
  }

  if (
    parent.type === AST_NODE_TYPES.CallExpression ||
    parent.type === AST_NODE_TYPES.NewExpression
  ) {
    return parent.callee !== node;
  }

  return parent.type === AST_NODE_TYPES.ConditionalExpression
    ? parent.test !== node
    : parent.type === AST_NODE_TYPES.Property &&
        parent.value === node &&
        !parent.shorthand;
};

/** Parents whose every expression child accepts any expression but a comma one. */
const ANY_EXPRESSION_PARENT_TYPES: ReadonlySet<AST_NODE_TYPES> = new Set([
  AST_NODE_TYPES.ArrayExpression,
  AST_NODE_TYPES.JSXExpressionContainer,
  AST_NODE_TYPES.ReturnStatement,
  AST_NODE_TYPES.SpreadElement,
  AST_NODE_TYPES.TemplateLiteral,
  AST_NODE_TYPES.VariableDeclarator,
]);

const asNode = <T extends TSESTree.Node>(node: DeepReadonly<T>): T =>
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  node as T;

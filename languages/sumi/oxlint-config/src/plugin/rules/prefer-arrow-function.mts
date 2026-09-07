import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import { createRule } from './create-rule.mjs';

/**
 * `functions/prefer-arrow-function` — functions are arrow functions (D-13).
 * The `function` keyword is allowed only for (1) a declaration that carries
 * overload signatures, which arrows cannot express, and (2) generators, which
 * have no arrow form (D-18).
 */
export const preferArrowFunction = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `function` expressions and non-overloaded `function` declarations; use arrow functions (Sumi D-13).',
    },
    messages: {
      expression:
        '`function` expressions are not allowed in Sumi (D-13): write an arrow function.',
      declaration:
        'A `function` declaration is allowed in Sumi only when it carries overload signatures (D-13): write `{{name}}` as an arrow function.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    FunctionExpression: (node) => {
      if (node.generator) return;

      // An accessor's body can only be a function expression; the accessor
      // itself is what is banned (no-accessor), so it is not reported twice.
      if (
        (node.parent.type === AST_NODE_TYPES.Property ||
          node.parent.type === AST_NODE_TYPES.MethodDefinition) &&
        (node.parent.kind === 'get' || node.parent.kind === 'set')
      ) {
        return;
      }

      context.report({ node, messageId: 'expression' });
    },
    FunctionDeclaration: (node) => {
      if (node.generator || node.id === null) return;

      if (hasOverloadSignature(node)) return;

      context.report({
        node: node.id,
        messageId: 'declaration',
        data: { name: node.id.name },
      });
    },
  }),
});

/**
 * Whether an overload signature (`TSDeclareFunction`) with the same name sits
 * next to the declaration — directly, or wrapped in `export`.
 */
const hasOverloadSignature = (
  declaration: DeepReadonly<TSESTree.FunctionDeclaration>,
): boolean => {
  const name = declaration.id?.name;

  if (name === undefined) return false;

  const container =
    declaration.parent.type === AST_NODE_TYPES.ExportNamedDeclaration
      ? declaration.parent.parent
      : declaration.parent;

  const siblings =
    container.type === AST_NODE_TYPES.Program ||
    container.type === AST_NODE_TYPES.BlockStatement ||
    container.type === AST_NODE_TYPES.TSModuleBlock
      ? container.body
      : ([] as const);

  return siblings.some((statement) => {
    const candidate =
      statement.type === AST_NODE_TYPES.ExportNamedDeclaration
        ? statement.declaration
        : statement;

    return (
      candidate?.type === AST_NODE_TYPES.TSDeclareFunction &&
      candidate.id?.name === name
    );
  });
};

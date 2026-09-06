import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { createRule } from './create-rule.mjs';

const MUT_PREFIX = 'mut_';

/**
 * `mutation/no-let-without-mut-prefix` — `let` is allowed only for names
 * carrying the `mut_` prefix, the single mutability marker (D-14). Every
 * binding introduced by the declaration (including destructuring) must carry
 * it; each offending identifier is reported on its own.
 */
export const noLetWithoutMutPrefix = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow `let` unless every bound name starts with `mut_` (Sumi D-14).',
    },
    messages: {
      missingPrefix:
        '`let {{name}}` is not allowed in Sumi: use `const`, or name the binding `mut_{{name}}` if it really is reassigned (D-14: `mut_` is the only mutability marker).',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    VariableDeclaration: (node) => {
      if (node.kind !== 'let') return;

      // Walk the binding patterns level by level; only Identifier leaves are
      // bindings. (A switch inside a loop is avoided on purpose: the cases
      // return, so no `break` is needed.)
      let mut_pending: readonly (
        TSESTree.BindingName | TSESTree.DestructuringPattern
      )[] = node.declarations.map((declarator) => declarator.id);

      while (mut_pending.length > 0) {
        mut_pending = mut_pending.flatMap((target) => {
          switch (target.type) {
            case AST_NODE_TYPES.Identifier:
              if (!target.name.startsWith(MUT_PREFIX)) {
                context.report({
                  node: target,
                  messageId: 'missingPrefix',
                  data: { name: target.name },
                });
              }

              return [];

            case AST_NODE_TYPES.ObjectPattern:
              return target.properties.flatMap((property) => {
                if (property.type === AST_NODE_TYPES.RestElement) {
                  return [property.argument];
                }

                // `Property` is shared with object literals, so its value is
                // typed as an expression too; only pattern values bind names.
                const value = property.value;

                return value.type === AST_NODE_TYPES.Identifier ||
                  value.type === AST_NODE_TYPES.ObjectPattern ||
                  value.type === AST_NODE_TYPES.ArrayPattern ||
                  value.type === AST_NODE_TYPES.AssignmentPattern
                  ? [value]
                  : [];
              });

            case AST_NODE_TYPES.ArrayPattern:
              return target.elements.filter((element) => element !== null);

            case AST_NODE_TYPES.AssignmentPattern:
              return [target.left];

            case AST_NODE_TYPES.RestElement:
              return [target.argument];

            case AST_NODE_TYPES.MemberExpression:
              // Not a binding (only reachable through an assignment pattern).
              return [];
          }
        });
      }
    },
  }),
});

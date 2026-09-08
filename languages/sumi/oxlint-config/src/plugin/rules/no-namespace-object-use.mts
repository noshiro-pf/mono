import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import { createRule } from './create-rule.mjs';

/**
 * `modules/no-namespace-object-use` — `import * as ns` is allowed, but `ns`
 * may only be used through property access (`ns.foo`, and `ns.Foo` in a
 * type). Passing, spreading, aliasing or `typeof`-ing the namespace object
 * itself is not tree-shakable and is banned (Sumi spec/modules.md, D-28).
 */
export const noNamespaceObjectUse = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Allow a namespace import to be used only through property access (Sumi D-28).',
    },
    messages: {
      noNamespaceObjectUse:
        'The namespace object `{{name}}` may only be used through property access (`{{name}}.member`): using it as a value is not tree-shakable.',
    },
    schema: [],
  },
  defaultOptions: [],
  create: (context) => ({
    ImportNamespaceSpecifier: (node) => {
      for (const variable of context.sourceCode.getDeclaredVariables(node)) {
        for (const reference of variable.references) {
          const identifier = reference.identifier;

          if (!isPropertyAccess(identifier)) {
            context.report({
              node: identifier,
              messageId: 'noNamespaceObjectUse',
              data: { name: variable.name },
            });
          }
        }
      }
    },
  }),
});

const isPropertyAccess = (
  identifier: DeepReadonly<TSESTree.Identifier | TSESTree.JSXIdentifier>,
): boolean => {
  const parent = identifier.parent;

  if (parent.type === AST_NODE_TYPES.MemberExpression) {
    return parent.object === identifier && !parent.computed;
  }

  if (parent.type === AST_NODE_TYPES.TSQualifiedName) {
    return parent.left === identifier;
  }

  if (parent.type === AST_NODE_TYPES.JSXMemberExpression) {
    return parent.object === identifier;
  }

  return false;
};

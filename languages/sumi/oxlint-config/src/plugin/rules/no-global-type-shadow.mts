import { AST_NODE_TYPES, type TSESTree } from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import { createRule } from './create-rule.mjs';
import { globalTypeNames } from './global-type-names.mjs';

type Options = readonly [Readonly<{ libs: readonly string[] }>];

/**
 * `banned-syntax/no-global-type-shadow` — a type-space declaration (type
 * alias, interface, enum, namespace, class, type parameter) must not reuse a
 * name the standard library declares in the type space (D-19). The value
 * space is covered by `no-shadow` with `builtinGlobals`.
 *
 * Which names count as global depends on `compilerOptions.lib`, which Sumi
 * leaves free (D-40); the `libs` option mirrors it (default `["esnext"]` —
 * add `"dom"` for browser code).
 */
export const noGlobalTypeShadow = createRule<Options, 'shadow'>({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow type declarations named after a standard-library type (Sumi D-19).',
    },
    messages: {
      shadow:
        '`{{name}}` is a standard-library type name and cannot be declared again in Sumi (D-19): pick a distinct name.',
    },
    schema: [
      {
        type: 'object',
        properties: {
          libs: { type: 'array', items: { type: 'string' } },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [{ libs: ['esnext'] }],
  create: (context, [options]) => {
    const names = globalTypeNames(options.libs);

    const check = (id: DeepReadonly<TSESTree.Identifier>): void => {
      if (names.has(id.name)) {
        context.report({
          // eslint-disable-next-line total-functions/no-unsafe-type-assertion
          node: id as TSESTree.Identifier,
          messageId: 'shadow',
          data: { name: id.name },
        });
      }
    };

    return {
      TSTypeAliasDeclaration: (node) => {
        check(node.id);
      },
      TSInterfaceDeclaration: (node) => {
        check(node.id);
      },
      TSEnumDeclaration: (node) => {
        check(node.id);
      },
      TSModuleDeclaration: (node) => {
        if (node.id.type === AST_NODE_TYPES.Identifier) check(node.id);
      },
      ClassDeclaration: (node) => {
        if (node.id !== null) check(node.id);
      },
      TSTypeParameter: (node) => {
        check(node.name);
      },
    };
  },
});

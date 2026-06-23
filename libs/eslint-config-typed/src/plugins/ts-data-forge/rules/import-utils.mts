import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { type DeepReadonly } from 'ts-type-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

export const getTsDataForgeImport = (
  program: TSESTree.Program,
): TSESTree.ImportDeclaration | undefined =>
  program.body.find(
    (node): node is TSESTree.ImportDeclaration =>
      node.type === AST_NODE_TYPES.ImportDeclaration &&
      node.source.value === TS_DATA_FORGE_MODULE,
  );

export const getNamedImports = (
  node: DeepReadonly<TSESTree.ImportDeclaration> | undefined,
): readonly string[] => {
  if (node === undefined) return [];

  return node.specifiers.flatMap((specifier) =>
    specifier.type === AST_NODE_TYPES.ImportSpecifier
      ? (() => {
          const importedName =
            specifier.imported.type === AST_NODE_TYPES.Identifier
              ? specifier.imported.name
              : specifier.imported.value;

          return typeof importedName === 'string' ? [importedName] : [];
        })()
      : [],
  );
};

/**
 * Returns the in-scope local name a given canonical export is imported as
 * (handling aliases such as `import { isX as y }` → `'y'`), or `undefined` when
 * it is not imported. Used so autofixes reference the binding that actually
 * exists rather than the canonical name.
 */
export const getImportedLocalName = (
  node: DeepReadonly<TSESTree.ImportDeclaration> | undefined,
  importedName: string,
): string | undefined =>
  node?.specifiers.find(
    (specifier) =>
      specifier.type === AST_NODE_TYPES.ImportSpecifier &&
      (specifier.imported.type === AST_NODE_TYPES.Identifier
        ? specifier.imported.name
        : specifier.imported.value) === importedName,
  )?.local.name;

type ResolvedCallee = Readonly<{
  /** The canonical (imported) ts-data-forge name, regardless of local alias. */
  canonicalName: string;
  /** The identifier node to rewrite when replacing the callee name. */
  propertyNode: TSESTree.Node;
  /** Whether the call was made through a namespace import (`tf.isX(...)`). */
  isNamespace: boolean;
}>;

/**
 * Builds a resolver that maps a call expression's callee to the canonical
 * ts-data-forge function it refers to. Handles named imports (including aliases
 * such as `import { isX as y }`) and namespace imports (`import * as tf` →
 * `tf.isX(...)`). Returns `undefined` for any callee that does not reference the
 * given ts-data-forge import.
 */
export const buildCalleeResolver = (
  importDecl: TSESTree.ImportDeclaration | undefined,
): ((
  callee: DeepReadonly<TSESTree.Expression>,
) => ResolvedCallee | undefined) => {
  const specifiers = importDecl?.specifiers ?? [];

  const namespaceName = specifiers.find(
    (specifier) => specifier.type === AST_NODE_TYPES.ImportNamespaceSpecifier,
  )?.local.name;

  const localToCanonical = new Map<string, string>(
    specifiers.flatMap((specifier) => {
      if (specifier.type !== AST_NODE_TYPES.ImportSpecifier) return [];

      const importedName =
        specifier.imported.type === AST_NODE_TYPES.Identifier
          ? specifier.imported.name
          : specifier.imported.value;

      return typeof importedName === 'string'
        ? [[specifier.local.name, importedName] as const]
        : [];
    }),
  );

  return (callee) => {
    if (callee.type === AST_NODE_TYPES.Identifier) {
      const canonicalName = localToCanonical.get(callee.name);

      return canonicalName === undefined
        ? undefined
        : {
            canonicalName,
            // eslint-disable-next-line total-functions/no-unsafe-type-assertion
            propertyNode: callee as TSESTree.Node,
            isNamespace: false,
          };
    }

    if (
      callee.type === AST_NODE_TYPES.MemberExpression &&
      !callee.computed &&
      callee.object.type === AST_NODE_TYPES.Identifier &&
      namespaceName !== undefined &&
      callee.object.name === namespaceName &&
      callee.property.type === AST_NODE_TYPES.Identifier
    ) {
      return {
        canonicalName: callee.property.name,
        // eslint-disable-next-line total-functions/no-unsafe-type-assertion
        propertyNode: callee.property as TSESTree.Node,
        isNamespace: true,
      };
    }

    return undefined;
  };
};

export const buildImportFixes = (
  fixer: TSESLint.RuleFixer,
  program: TSESTree.Program,
  _tsDataForgeImport: TSESTree.ImportDeclaration | undefined,
  requiredNames: readonly string[],
): readonly TSESLint.RuleFix[] => {
  const specifierText = requiredNames.join(', ');

  const importStatement =
    `import { ${specifierText} } from '${TS_DATA_FORGE_MODULE}';` as const;

  const newLine = '\n';

  const insertionText = `${importStatement}${newLine}` as const;

  // Always insert at the beginning of the file
  // (organize-imports will handle merging/deduplication)
  return [fixer.insertTextBefore(program, insertionText)];
};
/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */

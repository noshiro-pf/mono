import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
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

export const buildImportFixes = (
  fixer: TSESLint.RuleFixer,
  program: TSESTree.Program,
  _tsDataForgeImport: TSESTree.ImportDeclaration | undefined,
  requiredNames: readonly string[],
): readonly TSESLint.RuleFix[] => {
  const specifierText = requiredNames.join(', ');

  const importStatement = `import { ${specifierText} } from '${TS_DATA_FORGE_MODULE}';`;

  const newLine = '\n';

  const insertionText = `${importStatement}${newLine}`;

  // Always insert at the beginning of the file
  // (organize-imports will handle merging/deduplication)
  return [fixer.insertTextBefore(program, insertionText)];
};
/* eslint-enable @typescript-eslint/prefer-readonly-parameter-types */

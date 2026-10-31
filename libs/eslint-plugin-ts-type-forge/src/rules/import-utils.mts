import {
  AST_NODE_TYPES,
  type TSESLint,
  type TSESTree,
} from '@typescript-eslint/utils';
import { buildNamedImportFix, getImportDeclarations } from 'eslint-rule-forge';
import { Arr } from 'ts-data-forge';
import { TS_TYPE_FORGE_MODULE } from './constants.mjs';

/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */

/**
 * The edits that import the ts-type-forge types `names` the file does not
 * import yet, as types: added to an existing `import type { … }` from the
 * module (`, X`), else to a named import from it (`, type X`), else after a
 * lone default import (`, { type X }`), and only failing all of those as a new
 * `import { type X } from 'ts-type-forge'` after the directive prologue.
 * Empty braces count as a host. Adding to an existing declaration keeps
 * `import-x/no-duplicates` satisfied.
 *
 * Fixes that add an import overlap, so `--fix` applies one per pass, and the
 * rest in later passes, by when the file imports their names (see
 * `resolveTypeName`).
 */
export const buildTypeImportFix = (
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  names: readonly string[],
): readonly TSESLint.RuleFix[] => {
  if (!Arr.isNonEmpty(names)) {
    return [];
  }

  const declarations = getImportDeclarations(
    sourceCode.ast,
    TS_TYPE_FORGE_MODULE,
  );

  const typeOnlyFix = declarations
    .filter((declaration) => declaration.importKind === 'type')
    .map((declaration) => addToBraces(fixer, sourceCode, declaration, names))
    .find((fix) => fix !== undefined);

  if (typeOnlyFix !== undefined) {
    return [typeOnlyFix];
  }

  const typeSpecifiers = names.map((name) => `type ${name}`);

  const valueDeclarations = declarations.filter(
    (declaration) => declaration.importKind !== 'type',
  );

  const valueFix = valueDeclarations
    .map((declaration) =>
      addToBraces(fixer, sourceCode, declaration, typeSpecifiers),
    )
    .find((fix) => fix !== undefined);

  if (valueFix !== undefined) {
    return [valueFix];
  }

  const defaultHost = valueDeclarations.find(
    (declaration) =>
      Arr.isFixedLengthArray(1, declaration.specifiers) &&
      declaration.specifiers[0].type === AST_NODE_TYPES.ImportDefaultSpecifier,
  )?.specifiers[0];

  if (defaultHost !== undefined) {
    return [
      fixer.insertTextAfter(defaultHost, `, { ${typeSpecifiers.join(', ')} }`),
    ];
  }

  return buildNamedImportFix(
    fixer,
    sourceCode.ast,
    TS_TYPE_FORGE_MODULE,
    typeSpecifiers,
  );
};

/**
 * Whether the file already binds `name` to something that is not the
 * ts-type-forge export of the same name — a local type alias / interface /
 * class / enum, an import from another module, or another ts-type-forge
 * export imported under that name. Autofixes that introduce
 * `name` must bail out in that case, because the rewritten type would resolve
 * to the wrong declaration. (ts-type-forge's own sources, which declare
 * `NonEmptyArray` themselves, are the motivating example.)
 *
 * Not `hasForeignBinding` from eslint-rule-forge: `resolveTypeName` decides
 * once per file, with no node to read a scope at.
 */
export const hasConflictingDeclaration = (
  program: TSESTree.Program,
  name: string,
): boolean =>
  program.body.some((node) => {
    if (node.type === AST_NODE_TYPES.ImportDeclaration) {
      return node.specifiers.some(
        (specifier) =>
          specifier.local.name === name &&
          !(
            node.source.value === TS_TYPE_FORGE_MODULE &&
            specifier.type === AST_NODE_TYPES.ImportSpecifier &&
            (specifier.imported.type === AST_NODE_TYPES.Identifier
              ? specifier.imported.name
              : specifier.imported.value) === name
          ),
      );
    }

    return declaresName(
      node.type === AST_NODE_TYPES.ExportNamedDeclaration ||
        node.type === AST_NODE_TYPES.ExportDefaultDeclaration
        ? node.declaration
        : node,
      name,
    );
  });

/**
 * Adds `specifiers` to the `{ … }` of `declaration`: after its last named
 * specifier, or inside empty braces (`import d, {} from …`). `undefined` when
 * the declaration has no braces (a default or namespace import alone).
 */
const addToBraces = (
  fixer: TSESLint.RuleFixer,
  sourceCode: Readonly<TSESLint.SourceCode>,
  declaration: TSESTree.ImportDeclaration,
  specifiers: readonly string[],
): TSESLint.RuleFix | undefined => {
  const lastNamed = declaration.specifiers
    .filter(
      (specifier): specifier is TSESTree.ImportSpecifier =>
        specifier.type === AST_NODE_TYPES.ImportSpecifier,
    )
    .at(-1);

  if (lastNamed !== undefined) {
    return fixer.insertTextAfter(lastNamed, `, ${specifiers.join(', ')}`);
  }

  // Before the source, or the brace found is that of `with { … }`.
  const openingBrace = sourceCode.getFirstToken(declaration, {
    filter: (token) =>
      token.value === '{' && token.range[1] <= declaration.source.range[0],
  });

  return openingBrace === null
    ? undefined
    : fixer.insertTextAfter(openingBrace, ` ${specifiers.join(', ')} `);
};

const declaresName = (
  node: TSESTree.Node | null | undefined,
  name: string,
): boolean => {
  if (node === null || node === undefined) {
    return false;
  }

  if (
    node.type === AST_NODE_TYPES.TSTypeAliasDeclaration ||
    node.type === AST_NODE_TYPES.TSInterfaceDeclaration ||
    node.type === AST_NODE_TYPES.TSEnumDeclaration
  ) {
    return node.id.name === name;
  }

  return (
    node.type === AST_NODE_TYPES.ClassDeclaration && node.id?.name === name
  );
};

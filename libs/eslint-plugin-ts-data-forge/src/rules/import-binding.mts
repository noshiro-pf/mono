import type { TSESLint, TSESTree } from '@typescript-eslint/utils';
import {
  bindValueImports,
  hasForeignBinding,
  type ValueImportBinding,
} from 'eslint-rule-forge';
import { memoizeFunction } from 'ts-data-forge';
import { TS_DATA_FORGE_MODULE } from './constants.mjs';

/**
 * Binds ts-data-forge's `exportName` as a value once per file (see
 * `bindValueImports`), and gives, for the code at a node, the name a fix writes
 * and the edits that bring it into scope, or `undefined` when no fix can: an
 * import already binds the name to something else, or something other than the
 * import takes it where the code is.
 *
 * Every fix that writes the name makes these edits itself, so that one applied
 * alone (an editor's quick fix) is complete; `--fix` then takes one pass per
 * report that adds the import.
 */
export const tsDataForgeValueAt = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  exportName: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
): ((node: TSESTree.Node) => TsDataForgeValue | undefined) => {
  const { at } = tsDataForgeValuesAt(sourceCode, [exportName]);

  return (node) => {
    const binding = at(node);

    const localName = binding?.localNames[0];

    return binding === undefined || localName === undefined
      ? undefined
      : { localName, edits: binding.edits };
  };
};

/**
 * {@link tsDataForgeValueAt} for a name that varies from report to report (a
 * cast function, a replacement guard): each name is bound once per file,
 * however many reports write it.
 */
export const tsDataForgeValueAtByName = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
): ((exportName: string) => ReturnType<typeof tsDataForgeValueAt>) =>
  memoizeFunction(
    (exportName: string) => tsDataForgeValueAt(sourceCode, exportName),
    (exportName) => exportName,
  );

/**
 * {@link tsDataForgeValueAt} for several names one fix writes together: their
 * edits are made as one, so that two names the file does not import go into a
 * single new declaration. `localNames` are the names to write, known before any
 * node is: the export names themselves when they cannot be bound.
 */
export const tsDataForgeValuesAt = (
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  sourceCode: TSESLint.SourceCode,
  exportNames: readonly string[],
): Readonly<{
  localNames: readonly string[];
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  at: (node: TSESTree.Node) => ValueImportBinding | undefined;
}> => {
  const binding = bindValueImports(
    sourceCode,
    TS_DATA_FORGE_MODULE,
    exportNames,
  );

  return {
    localNames: binding?.localNames ?? exportNames,
    at: (node) =>
      binding === undefined ||
      binding.localNames.some((localName) =>
        hasForeignBinding(sourceCode, node, localName, TS_DATA_FORGE_MODULE),
      )
        ? undefined
        : binding,
  };
};

/** What {@link tsDataForgeValueAt} gives for one node. */
export type TsDataForgeValue = Readonly<{
  /** The name to write. */
  localName: string;

  /** The edits that bind it. */
  edits: ValueImportBinding['edits'];
}>;

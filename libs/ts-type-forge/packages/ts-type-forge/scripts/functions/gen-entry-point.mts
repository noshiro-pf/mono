import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { format } from 'prettier';
import { glob, Result } from 'ts-repo-utils';
import {
  extractTypeExports,
  type NamespaceExport,
  type TypeExport,
} from './extract-type-exports.mjs';

/**
 * Regenerates `src/entry-point.mts`, the public entry point of the package.
 * It re-exports every type from `./index.mjs` except
 * `TSTypeForgeInternals_`-prefixed internal helpers, so consumers of
 * `import { X } from 'ts-type-forge'` only see the public API surface.
 * (`./index.mjs` itself must keep exporting the internals because the
 * generated `global.mts` references them as `_TSTypeForge.TSTypeForgeInternals_*`.)
 */
export const genEntryPoint = async (
  srcDir: string,
  entryPointFilePath: string,
): Promise<void> => {
  console.log(`Searching for .mts files in ${srcDir}...`);

  const filesResult = await glob(`${srcDir}/**/*.mts`);

  if (Result.isErr(filesResult)) {
    console.error(filesResult.value);

    return;
  }

  const files: readonly string[] = filesResult.value;

  const moduleFiles = files
    .filter((p) => p !== entryPointFilePath)
    .filter((p) => path.basename(p) !== 'index.mts')
    .filter((p) => path.basename(p) !== 'global.mts')
    .filter((p) => !p.endsWith('.test.mts'))
    .toSorted();

  const mut_allTypes: TypeExport[] = [];

  const mut_allNamespaces: NamespaceExport[] = [];

  for (const filePath of moduleFiles) {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const content = await fs.readFile(filePath, 'utf8');

    const { types, namespaces } = extractTypeExports(content);

    for (const e of types) mut_allTypes.push(e);

    for (const ns of namespaces) mut_allNamespaces.push(ns);
  }

  const publicNames = [
    ...mut_allTypes.map((e) => e.name),
    ...mut_allNamespaces.map((ns) => ns.name),
  ]
    .filter((name) => !isInternalName(name))
    .toSorted();

  const lines: readonly string[] = [
    '/* AUTO-GENERATED. DO NOT EDIT. */',
    '',
    '/**',
    ' * The public entry point of the package (`import { X } from',
    " * 'ts-type-forge'`). Re-exports every public type from `./index.mjs`,",
    ' * excluding `TSTypeForgeInternals_`-prefixed internal helpers.',
    ' */',
    'export type {',
    ...publicNames.map((name) => `  ${name},`),
    "} from './index.mjs';",
    '',
  ] as const;

  const formatted = await format(lines.join('\n'), {
    parser: 'typescript',
    singleQuote: true,
    trailingComma: 'all',
  });

  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    await fs.writeFile(entryPointFilePath, formatted, 'utf8');

    console.log(
      `Successfully generated ${entryPointFilePath} with ${publicNames.length} public type re-exports.`,
    );
  } catch (error) {
    console.error(`Error writing ${entryPointFilePath}:`, error);
  }
};

/**
 * `TSTypeForgeInternals_`-prefixed types are implementation details; they are
 * kept out of both the entry point and the ambient global declarations.
 */
const isInternalName = (name: string): boolean =>
  name.startsWith('TSTypeForgeInternals_');

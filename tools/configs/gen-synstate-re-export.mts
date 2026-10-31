import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Arr } from 'ts-data-forge';
import ts from 'typescript';

export type GenSynstateReExportOptions = Readonly<{
  /** The file to write, relative to the package: `src/synstate.mts`. */
  outFile: string;
  /** The keys of synstate's module namespace, which the caller imports. */
  valueExports: readonly string[];
  /** The values the package replaces with its own, such as `createState`. */
  excludes: readonly string[];
}>;

/**
 * Writes the module through which a package that wraps synstate re-exports
 * it: every value but `excludes`, and every type. The types are read from the
 * declarations synstate publishes, so it must be built first; the caller
 * formats the file.
 *
 * The names are listed rather than spread from `import * as synstate`, which
 * bundlers could not tree-shake, or written as `export *`, whose
 * `createState` would clash with the package's own.
 */
export const genSynstateReExport = async ({
  outFile,
  valueExports,
  excludes,
}: GenSynstateReExportOptions): Promise<void> => {
  const declarationFile = ts.resolveModuleName(
    'synstate',
    path.resolve(outFile),
    compilerOptions,
    ts.sys,
    undefined,
    undefined,
    ts.ModuleKind.ESNext,
  ).resolvedModule?.resolvedFileName;

  if (declarationFile === undefined) {
    throw new Error("Cannot resolve the declarations of 'synstate'.");
  }

  // eslint-disable-next-line security/detect-non-literal-fs-filename
  await fs.writeFile(
    outFile,
    synstateReExportSource({
      valueExports,
      excludes,
      typeExports: typeOnlyExportsOf(declarationFile),
    }),
  );
};

/** The source {@link genSynstateReExport} writes, before formatting. */
export const synstateReExportSource = ({
  valueExports,
  excludes,
  typeExports,
}: Readonly<{
  valueExports: readonly string[];
  excludes: readonly string[];
  typeExports: readonly string[];
}>): string => {
  const unknown = excludes.filter((name) => !valueExports.includes(name));

  if (Arr.isNonEmpty(unknown)) {
    throw new Error(
      `synstate exports no ${unknown.join(', ')}, which the package replaces.`,
    );
  }

  return [
    `export { ${valueExports.filter((name) => !excludes.includes(name)).join(', ')} } from 'synstate';`,
    '',
    `export type { ${typeExports.join(', ')} } from 'synstate';`,
    '',
  ].join('\n');
};

/**
 * The names `declarationFile` exports as types only, sorted: what
 * `Object.keys` of the module namespace cannot see.
 */
export const typeOnlyExportsOf = (
  declarationFile: string,
): readonly string[] => {
  const program = ts.createProgram([declarationFile], compilerOptions);

  const checker = program.getTypeChecker();

  const sourceFile = program.getSourceFile(declarationFile);

  const moduleSymbol =
    sourceFile === undefined
      ? undefined
      : checker.getSymbolAtLocation(sourceFile);

  if (moduleSymbol === undefined) {
    throw new Error(`Cannot read the exports of ${declarationFile}.`);
  }

  return checker
    .getExportsOfModule(moduleSymbol)
    .filter((symbol) => {
      const target =
        (symbol.flags & ts.SymbolFlags.Alias) === 0
          ? symbol
          : checker.getAliasedSymbol(symbol);

      return (target.flags & ts.SymbolFlags.Value) === 0;
    })
    .map((symbol) => symbol.name)
    .toSorted();
};

const compilerOptions: ts.CompilerOptions = {
  module: ts.ModuleKind.NodeNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
  noEmit: true,
  // Only the symbols of one module are read: no lib or `@types` to load.
  noLib: true,
  types: [],
} as const;

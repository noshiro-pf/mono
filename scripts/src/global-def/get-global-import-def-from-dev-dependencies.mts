type GlobalImportDefModule = Record<
  string,
  Record<string, readonly [string, string]>
>;

type ModuleImporter = (specifier: string) => Promise<GlobalImportDefModule>;

const defaultImportModule: ModuleImporter = async (specifier) =>
  // eslint-disable-next-line import/dynamic-import-chunkname, @typescript-eslint/no-unsafe-return
  import(specifier);

/**
 * @param devDependencies The consuming package's devDependencies.
 * @param importModule Resolves `@noshiro/global-*` subpaths. The default
 *   resolves them relative to this package, which only works when they are
 *   hoisted into a single flat node_modules. Callers that declare the
 *   `@noshiro/global-*` packages themselves should pass their own
 *   `(specifier) => import(specifier)` so the packages resolve from there.
 */
export const genGlobalImportDefsFromDevDependencies = async (
  devDependencies: Record<string, string>,
  importModule: ModuleImporter = defaultImportModule,
): Promise<Record<string, readonly [string, string]>> => {
  const globalUtils = Object.keys(devDependencies).filter((packageName) =>
    packageName.startsWith('@noshiro/global-'),
  );

  const importPaths = globalUtils.map(
    (packageName) => `${packageName}/inject-modules-def`,
  );

  const globalImportDefPackages: readonly GlobalImportDefModule[] =
    await Promise.all(importPaths.map(importModule));

  const init: Record<string, readonly [string, string]> = {};

  const globalImportDefs: Record<string, readonly [string, string]> =
    globalImportDefPackages.reduce(
      (acc, curr) => ({ ...acc, ...Object.values(curr)[0] }),
      init,
    );

  return globalImportDefs;
};

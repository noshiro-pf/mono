export const genGlobalImportDefsFromDevDependencies = async (
  devDependencies: Record<string, string>,
): Promise<Record<string, readonly [string, string]>> => {
  const globalUtils = Object.keys(devDependencies).filter((packageName) =>
    packageName.startsWith('@noshiro/global-'),
  );

  const importPaths = globalUtils.map(
    (packageName) => `${packageName}/inject-modules-def`,
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const globalImportDefPackages: readonly Record<
    string,
    Record<string, readonly [string, string]>
  >[] = await Promise.all(
    // eslint-disable-next-line import/dynamic-import-chunkname
    importPaths.map((importPath) => import(importPath)),
  );

  const init: Record<string, readonly [string, string]> = {};

  const globalImportDefs: Record<string, readonly [string, string]> =
    globalImportDefPackages.reduce(
      (acc, curr) => ({ ...acc, ...Object.values(curr)[0] }),
      init,
    );

  return globalImportDefs;
};

/**
 * @param {Record<string, string>} devDependencies
 * @returns {Promise<Record<string, readonly [string, string]>>}
 */
export const genGlobalImportDefsFromDevDependencies = async (
  devDependencies,
) => {
  const globalUtils = Object.keys(devDependencies).filter((packageName) =>
    packageName.startsWith('@noshiro/global-'),
  );

  const importPaths = globalUtils.map(
    (packageName) => `${packageName}/inject-modules-def`,
  );

  /** @type {Record<string, Record<string, readonly [string, string]>>[]} */
  const globalImportDefPackages = await Promise.all(
    // eslint-disable-next-line import/dynamic-import-chunkname
    importPaths.map((importPath) => import(importPath)),
  );

  /** @type {Record<string, readonly [string, string]>} */
  const init = {};

  /** @type {Record<string, readonly [string, string]>} */
  const globalImportDefs = globalImportDefPackages.reduce(
    (acc, curr) => ({ ...acc, ...Object.values(curr)[0] }),
    init,
  );

  return globalImportDefs;
};

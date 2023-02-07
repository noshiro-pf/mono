const { join } = require('node:path');

/**
 * @param {string} thisDir
 * @param {Readonly<Record<string, string>>} devDependencies
 * @returns
 */
const genGlobalImportDefsFromDevDependencies = (thisDir, devDependencies) => {
  // eslint-disable-next-line no-restricted-syntax
  const globalUtils = Object.keys(devDependencies).filter((packageName) =>
    packageName.startsWith('@noshiro/global-')
  );

  const importPaths = globalUtils.map((packageName) =>
    join(
      thisDir,
      `../../../utils/${packageName.replace(
        '@noshiro/',
        ''
      )}/cjs/provide-plugin-def.js`
    )
  );

  /** @type {Record<string, Record<string, readonly [string, string]>>[]} */
  const providePluginDefPackages = importPaths.map(
    // eslint-disable-next-line import/no-dynamic-require, security/detect-non-literal-require, @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-return, unicorn/prefer-module
    (importPath) => require(importPath)
  );

  /** @type {Record<string, readonly [string, string]>} */
  const init = {};

  /** @type {Record<string, readonly [string, string]>} */
  const providePluginDefs = providePluginDefPackages.reduce(
    (acc, curr) => ({ ...acc, ...Object.values(curr)[0] }),
    init
  );

  return providePluginDefs;
};

module.exports = { genGlobalImportDefsFromDevDependencies };

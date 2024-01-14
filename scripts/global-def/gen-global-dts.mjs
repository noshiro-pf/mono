import * as fs from 'node:fs/promises';

/**
 * @param {string} rootDir
 * @param {Record<string, string>} devDependencies
 */
export const genGlobalDts = async (rootDir, devDependencies) => {
  /** @type {readonly string[]} */
  const globalUtils = Object.keys(devDependencies).filter((packageName) =>
    packageName.startsWith('@noshiro/global-'),
  );

  /** @type {readonly string[]} */
  const references = globalUtils.map(
    (packageName) => `/// <reference types="${packageName}" />`,
  );

  const result = [...references, ''].join('\n');

  await fs.writeFile(`${rootDir}/src/globals.d.ts`, result);
};

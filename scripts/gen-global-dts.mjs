import { writeFileAsync } from './write-file-async.mjs';

/**
 * @param {string} rootDir
 * @param {string[]} devDependencies
 */
export const genGlobalDts = (rootDir, devDependencies) => {
  /** @type {string[]} */
  const globalUtils = Object.keys(devDependencies).filter((packageName) =>
    packageName.startsWith('@noshiro/global-')
  );

  /** @type {string[]} */
  const references = globalUtils.map(
    (packageName) =>
      `/// <reference path="../../../utils/${packageName.replace(
        '@noshiro/',
        ''
      )}/esm/globals-decl.d.ts" />`
  );

  const result = [
    '/* eslint-disable @typescript-eslint/triple-slash-reference */',
    '',
    '/// <reference path="../../../utils/stdlib/stdlib.d.ts" />',
    '/// <reference path="../../../utils/ts-type-utils/ts-type-utils.d.ts" />',
    '',
    ...references,
    '',
  ].join('\n');

  writeFileAsync(`${rootDir}/src/globals.d.ts`, result);
};

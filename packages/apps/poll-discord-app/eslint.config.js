/** @typedef { import('@noshiro/eslint-utils').FlatConfig } FlatConfig */

import {
  eslintFlatConfigCommon,
  genEsLintRestrictedImportsDefFromDevDependencies,
} from '@noshiro/eslint-utils';
import { toThisDir } from '@noshiro/mono-scripts/node-utils/path-utils.mjs';
import * as nodePath from 'node:path';
import packageJson from './package.json' assert { type: 'json' };

const thisDir = toThisDir(import.meta.url);

/** @returns {Promise<readonly FlatConfig[]>} */
const defineConfig = async () => {
  const restrictedImports =
    await genEsLintRestrictedImportsDefFromDevDependencies(
      packageJson.devDependencies,
    );

  /** @type {readonly FlatConfig[]} */
  const configs = eslintFlatConfigCommon({
    tsconfigRootDir: thisDir,
    packageDirs: [nodePath.resolve(thisDir, '../../..'), thisDir],
    tsconfigFileName: 'tsconfig.json',
    restrictedImports,
  });

  return configs;
};

export default defineConfig();

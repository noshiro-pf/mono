/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */
/** @typedef {import('@noshiro/eslint-configs').EslintImportsRules} EslintImportsRules */

import {
  eslintFlatConfigCommon,
  genEsLintRestrictedImportsDefFromDevDependencies,
} from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/mono-scripts';
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
  const configs = [
    {
      ignores: ['src/globals.d.ts'],
    },
    ...eslintFlatConfigCommon({
      tsconfigRootDir: thisDir,
      tsconfigFileName: './tsconfig.json',
      packageDirs: [nodePath.resolve(thisDir, '../../../..'), thisDir],
      restrictedImports,
    }),
  ];

  return configs;
};

export default defineConfig();

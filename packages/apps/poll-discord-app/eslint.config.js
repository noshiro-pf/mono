/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import {
  eslintFlatConfigForTypeScript,
  eslintFlatConfigForVitest,
  genEsLintRestrictedImportsDefFromDevDependencies,
} from '@noshiro/eslint-configs';
import * as nodePath from 'node:path';
import packageJson from './package.json' with { type: 'json' };

const thisDir = import.meta.dirname;

/** @returns {Promise<readonly FlatConfig[]>} */
const defineConfig = async () => {
  const restrictedImports =
    await genEsLintRestrictedImportsDefFromDevDependencies(
      packageJson.devDependencies,
    );

  /** @type {readonly FlatConfig[]} */
  const configs = [
    ...eslintFlatConfigForTypeScript({
      tsconfigRootDir: thisDir,
      packageDirs: [nodePath.resolve(thisDir, '../../..'), thisDir],
      tsconfigFileName: 'tsconfig.json',
    }),
    eslintFlatConfigForVitest(),

    {
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          ...restrictedImports,
        ],
      },
    },
  ];

  return configs;
};

export default defineConfig();

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
      // Resolve the @noshiro/global-* packages from this package, which
      // is where they are declared as dependencies.
      // eslint-disable-next-line import/dynamic-import-chunkname
      async (specifier) => import(specifier),
    );

  /** @type {readonly FlatConfig[]} */
  const configs = [
    ...eslintFlatConfigForTypeScript({
      tsconfigRootDir: thisDir,
      tsconfigFileName: './tsconfig.json',
      packageDirs: [nodePath.resolve(thisDir, '../../..'), thisDir],
    }),
    eslintFlatConfigForVitest(),

    {
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          ...restrictedImports,
        ],
        'security/detect-non-literal-fs-filename': 'off',
        'no-await-in-loop': 'off',
      },
    },
  ];

  return configs;
};

export default defineConfig();

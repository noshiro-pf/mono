/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import {
  eslintFlatConfigForPlaywright,
  eslintFlatConfigForReact,
  eslintFlatConfigForTypeScript,
  eslintFlatConfigForVitest,
  genEsLintRestrictedImportsDefFromDevDependencies,
} from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/mono-utils';
import * as path from 'node:path';
import packageJson from './package.json' with { type: 'json' };

const thisDir = toThisDir(import.meta.url);

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
      tsconfigFileName: './tsconfig.json',
      packageDirs: [path.resolve(thisDir, '../../..'), thisDir],
    }),
    eslintFlatConfigForVitest(['src/**/*']),
    ...eslintFlatConfigForReact(['src/**/*']),
    eslintFlatConfigForPlaywright(['e2e/**/*']),

    {
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          ...restrictedImports,
        ],
      },
    },
  ];

  return [
    ...configs,
    { rules: { '@typescript-eslint/prefer-readonly-parameter-types': 'off' } },
  ];
};

export default defineConfig();

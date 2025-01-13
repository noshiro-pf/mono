/** @typedef {import('@noshiro/eslint-configs').FlatConfig} FlatConfig */

import {
  banTypes,
  eslintFlatConfigForReact,
  eslintFlatConfigForTypeScript,
  eslintFlatConfigForVitest,
  genEsLintRestrictedImportsDefFromDevDependencies,
} from '@noshiro/eslint-configs';
import { toThisDir } from '@noshiro/mono-utils';
import * as nodePath from 'node:path';
import packageJson from './package.json' with { type: 'json' };

const thisDir = toThisDir(import.meta.url);

/** @returns {Promise<readonly FlatConfig[]>} */
const defineConfig = async () => {
  const restrictedImports =
    await genEsLintRestrictedImportsDefFromDevDependencies(
      packageJson.devDependencies,
    );

  /** @type {import('@noshiro/eslint-configs').RestrictedImportsOption} */
  const restrictedImportsAdded = {
    paths: [
      ...restrictedImports[0].paths,
      {
        name: 'firebase/auth',
        importNames: [
          'AuthCredential',
          'OAuthCredential',
          'UserCredential',
          'User',
        ],
        message: 'use types from src/types instead.',
      },
      {
        name: '@blueprintjs/core',
        importNames: [
          'HTMLInputProps',
          'HTMLSelectProps',
          'IconName',
          'InputGroupProps2',
          'Intent',
          'IToaster',
          'OptionProps',
          'PopperModifiers',
        ],
        message: 'use globals instead.',
      },
      {
        name: '@blueprintjs/datetime',
        importNames: ['DatePickerShortcut'],
        message: 'use globals instead.',
      },
      {
        name: 'src/types/firebase-types-wrapper',
        importNames: [
          'AuthCredential',
          'FireAuthUser',
          'OAuthCredential',
          'UserCredential',
        ],
        message: 'use globals instead.',
      },
    ],
  };

  /** @type {readonly FlatConfig[]} */
  const configs = [
    ...eslintFlatConfigForTypeScript({
      tsconfigRootDir: thisDir,
      tsconfigFileName: './tsconfig.json',
      packageDirs: [nodePath.resolve(thisDir, '../../..'), thisDir],
    }),
    eslintFlatConfigForVitest(),
    ...eslintFlatConfigForReact(),
    {
      rules: {
        '@typescript-eslint/no-restricted-imports': [
          'error',
          restrictedImportsAdded,
        ],
        '@typescript-eslint/no-restricted-types': [
          'error',
          {
            types: {
              ...banTypes,
              'DeepReadonly<AuthCredential>': 'use AuthCredential instead',
              'DeepReadonly<OAuthCredential>': 'use OAuthCredential instead',
              'DeepReadonly<UserCredential>': 'use UserCredential instead',
              'DeepReadonly<User>': 'use User instead',
            },
          },
        ],
      },
    },
    {
      files: ['scripts/migration/**/*.ts', 'scripts/export-firestore.ts'],
      rules: {
        'import/no-internal-modules': 'off',
        'import/no-namespace': 'off',
        'no-await-in-loop': 'off',
        '@typescript-eslint/no-restricted-imports': 'off',
      },
    },
  ];

  return configs;
};

export default defineConfig();

/** @typedef {import('@noshiro/eslint-utils').FlatConfig} FlatConfig */

import {
  banTypes,
  eslintFlatConfigForReact,
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

  /** @type {import('@noshiro/eslint-utils').RestrictedImportsOption} */
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
        name: '@noshiro/event-schedule-app-shared',
        importNames: [
          'Answer',
          'AnswerIconId',
          'AnswerIconIdWithNone',
          'AnswerIconPoint',
          'AnswerIconSetting',
          'AnswerIconSettings',
          'AnswerId',
          'AnswerSelection',
          'DatetimeRange',
          'DatetimeSpecificationEnumType',
          'DayType',
          'EventSchedule',
          'HoursMinutes',
          'NotificationSettings',
          'TimeRange',
          'User',
          'UserId',
          'UserName',
          'Weight',
          'YearMonthDate',
          'Ymdhm',
        ],
        message: 'use globals instead.',
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
    ...eslintFlatConfigForReact({
      tsconfigRootDir: thisDir,
      packageDirs: [nodePath.resolve(thisDir, '../../..'), thisDir],
      tsconfigFileName: 'tsconfig.json',
      restrictedImports: [restrictedImportsAdded],
      isViteProject: true,
    }),
    {
      rules: {
        '@typescript-eslint/ban-types': [
          'error',
          {
            types: {
              ...banTypes,
              'DeepReadonly<AuthCredential>': 'use AuthCredential instead',
              'DeepReadonly<OAuthCredential>': 'use OAuthCredential instead',
              'DeepReadonly<UserCredential>': 'use UserCredential instead',
              'DeepReadonly<User>': 'use User instead',
            },
            extendDefaults: true,
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

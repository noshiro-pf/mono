'use strict';
// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */
/** @typedef { import("../../../config/eslintrc/eslint-rules/rules-type/typescript-eslint-rules").TypeScriptEslintRules } TypeScriptEslintRules */

const { join } = require('node:path');

const {
  restrictedImportsOption,
  banTypes,
} = require('../../../config/eslintrc/eslint-rules');

const { devDependencies } = require('./package.json');

const globalUtils = Object.keys(devDependencies).filter((packageName) =>
  packageName.startsWith('@noshiro/global-')
);

const eslintNoRestrictedImportsDefs = globalUtils.map(
  (packageName) =>
    require(`${packageName}/cjs/eslint-no-restricted-imports-def`)[
      'eslintNoRestrictedImportsDef'
    ]
);

/** @type {TypeScriptEslintRules["@typescript-eslint/no-restricted-imports"]} */
const noRestrictedImports = [
  'error',
  {
    paths: [
      ...restrictedImportsOption.paths,
      ...eslintNoRestrictedImportsDefs,
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
  },
];

/** @type {LinterConfig} */
const config = {
  extends: '../../../config/eslintrc/.eslintrc.react.js',
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
  rules: {
    'import/no-extraneous-dependencies': [
      'error',
      {
        packageDir: [join(__dirname, '../../../'), '.'],
      },
    ],
    '@typescript-eslint/no-restricted-imports': noRestrictedImports,
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
    '@typescript-eslint/no-namespace': 'error', // enable in Vite project
  },
};

module.exports = config;

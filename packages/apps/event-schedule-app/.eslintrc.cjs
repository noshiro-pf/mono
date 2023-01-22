'use strict';
// @ts-check

/** @typedef { import("eslint").Linter.Config } LinterConfig */
/** @typedef { import("../../../config/eslintrc/eslint-rules/rules-type/typescript-eslint-rules").TypeScriptEslintRules } TypeScriptEslintRules */

const {
  restrictedImportsOption,
  banTypes,
} = require('../../../config/eslintrc/eslint-rules');

const {
  eslintNoRestrictedImportsTsUtilsDef,
} = require('@noshiro/global-ts-utils/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsReactUtilsDef,
} = require('@noshiro/global-react-utils/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsSyncflowDef,
} = require('@noshiro/global-syncflow/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsSyncflowReactHooksDef,
} = require('@noshiro/global-syncflow-react-hooks/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsReactDef,
} = require('@noshiro/global-react/cjs/eslint-no-restricted-imports-def');
const {
  eslintNoRestrictedImportsStyledComponentsDef,
} = require('@noshiro/global-styled-components/cjs/eslint-no-restricted-imports-def');

/** @type {TypeScriptEslintRules["@typescript-eslint/no-restricted-imports"]} */
const noRestrictedImports = [
  'warn',
  {
    paths: [
      ...restrictedImportsOption.paths,
      eslintNoRestrictedImportsTsUtilsDef,
      eslintNoRestrictedImportsReactUtilsDef,
      eslintNoRestrictedImportsSyncflowDef,
      eslintNoRestrictedImportsSyncflowReactHooksDef,
      eslintNoRestrictedImportsReactDef,
      eslintNoRestrictedImportsStyledComponentsDef,
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
        name: '@noshiro/ts-utils-additional',
        importNames: ['Phantomic'],
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

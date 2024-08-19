import typescriptEslint from '@typescript-eslint/eslint-plugin';

// @ts-expect-error no type definition
import eslintPluginArrayFunc from 'eslint-plugin-array-func';

import eslintPluginDeprecation from 'eslint-plugin-deprecation';

import eslintPluginFunctional from 'eslint-plugin-functional';

// @ts-expect-error no type definition
import eslintPluginTotalFunctions from 'eslint-plugin-total-functions';

// @ts-expect-error no type definition
import eslintPluginSecurity from 'eslint-plugin-security';

import eslintPluginUnicorn from 'eslint-plugin-unicorn';

// @ts-expect-error no type definition
import eslintPluginImport from 'eslint-plugin-import';

// @ts-expect-error no type definition
import eslintPluginStrictDependencies from 'eslint-plugin-strict-dependencies';

// @ts-expect-error no type definition
import eslintPluginJest from 'eslint-plugin-jest';

import eslintPluginVitest from 'eslint-plugin-vitest';

// @ts-expect-error no type definition
import eslintPluginTestingLibrary from 'eslint-plugin-testing-library';

// @ts-expect-error no type definition
import eslintPluginCypress from 'eslint-plugin-cypress';

// @ts-expect-error no type definition
import eslintPluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';

// @ts-expect-error no type definition
import eslintPluginPromise from 'eslint-plugin-promise';

// @ts-expect-error no type definition
import eslintPluginReact from 'eslint-plugin-react';

// @ts-expect-error no type definition
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

// @ts-expect-error no type definition
import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';

// @ts-expect-error no type definition
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';

import { type FlatConfig } from '../types/index.mjs';

const pluginsDef = {
  '@typescript-eslint': typescriptEslint,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'array-func': eslintPluginArrayFunc,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  cypress: eslintPluginCypress,
  deprecation: eslintPluginDeprecation,
  functional: eslintPluginFunctional,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  import: eslintPluginImport,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  jest: eslintPluginJest,
  vitest: eslintPluginVitest,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'jsx-a11y': eslintPluginJsxA11y,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'prefer-arrow-functions': eslintPluginPreferArrowFunctions,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  promise: eslintPluginPromise,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  react: eslintPluginReact,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'react-hooks': eslintPluginReactHooks,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'react-refresh': eslintPluginReactRefresh,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  security: eslintPluginSecurity,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'strict-dependencies': eslintPluginStrictDependencies,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'testing-library': eslintPluginTestingLibrary,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'total-functions': eslintPluginTotalFunctions,
  unicorn: eslintPluginUnicorn,
} as const;

// export const pluginsV9Supported = {
//   '@typescript-eslint': true,
//   'array-func': true,
//   cypress: true,
//   deprecation: false,
//   functional: true,
//   import: false,
//   jest: true,
//   vitest: true,
//   'jsx-a11y': true,
//   'prefer-arrow-functions': true,
//   promise: false,
//   react: false,
//   'react-hooks': true,
//   'react-refresh': true,
//   security: true,
//   'strict-dependencies': true,
//   'testing-library': true,
//   'total-functions': false,
//   unicorn: true,
// } as const satisfies { [key in keyof typeof pluginsDef]: boolean };

export const plugins: FlatConfig['plugins'] = pluginsDef;

import typescriptEslint from '@typescript-eslint/eslint-plugin';

// @ts-expect-error no type definition
import eslintPluginArrayFunc from 'eslint-plugin-array-func';

import eslintPluginFunctional from 'eslint-plugin-functional';

// @ts-expect-error no type definition
import eslintPluginSecurity from 'eslint-plugin-security';

import eslintPluginUnicorn from 'eslint-plugin-unicorn';

// @ts-expect-error no type definition
import eslintPluginImport from 'eslint-plugin-import';

// @ts-expect-error no type definition
import eslintPluginStrictDependencies from 'eslint-plugin-strict-dependencies';

import eslintPluginJest from 'eslint-plugin-jest';

import eslintPluginVitest from 'eslint-plugin-vitest';

import eslintPluginTestingLibrary from 'eslint-plugin-testing-library';

import eslintPluginPlaywright from 'eslint-plugin-playwright';

// @ts-expect-error no type definition
import eslintPluginCypress from 'eslint-plugin-cypress';

import eslintPluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';

// @ts-expect-error no type definition
import eslintPluginPromise from 'eslint-plugin-promise';

import eslintPluginReact from 'eslint-plugin-react';

// @ts-expect-error no type definition
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';

// @ts-expect-error no type definition
import eslintPluginReactPerf from 'eslint-plugin-react-perf';

// @ts-expect-error no type definition
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';

// @ts-expect-error no type definition
import eslintPluginEslintPlugin from 'eslint-plugin-eslint-plugin';

// import eslintPluginTotalFunctions from 'eslint-plugin-total-functions';
import { eslintPluginTotalFunctions } from '../plugins/total-functions/index.mjs';

// import eslintPluginTreeShakable from 'eslint-plugin-tree-shakable';
import { eslintPluginTreeShakable } from '../plugins/tree-shakable/index.mjs';

import { type FlatConfig, type Plugin } from '../types/index.mjs';

export const plugins: Record<
  | '@typescript-eslint'
  | 'array-func'
  | 'cypress'
  | 'playwright'
  | 'functional'
  | 'import'
  | 'jest'
  | 'vitest'
  | 'jsx-a11y'
  | 'prefer-arrow-functions'
  | 'promise'
  | 'react'
  | 'react-hooks'
  | 'react-refresh'
  | 'react-perf'
  | 'security'
  | 'strict-dependencies'
  | 'testing-library'
  | 'total-functions'
  | 'unicorn'
  | 'tree-shakable'
  | 'eslint-plugin',
  Omit<Plugin, 'configs'>
> = {
  '@typescript-eslint': typescriptEslint,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'array-func': eslintPluginArrayFunc,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  cypress: eslintPluginCypress,
  playwright: eslintPluginPlaywright,
  functional: eslintPluginFunctional,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  import: eslintPluginImport,
  jest: eslintPluginJest,
  vitest: eslintPluginVitest,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'jsx-a11y': eslintPluginJsxA11y,
  'prefer-arrow-functions': eslintPluginPreferArrowFunctions,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  promise: eslintPluginPromise,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  react: eslintPluginReact as unknown as Plugin,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'react-hooks': eslintPluginReactHooks,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  'react-refresh': eslintPluginReactRefresh as unknown as Plugin,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'react-perf': eslintPluginReactPerf,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  security: eslintPluginSecurity,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'strict-dependencies': eslintPluginStrictDependencies,
  'testing-library': eslintPluginTestingLibrary,
  'total-functions': eslintPluginTotalFunctions,
  unicorn: eslintPluginUnicorn,
  'tree-shakable': eslintPluginTreeShakable,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'eslint-plugin': eslintPluginEslintPlugin,
} as const satisfies FlatConfig['plugins'];

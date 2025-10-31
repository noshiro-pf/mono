import typescriptEslint from '@typescript-eslint/eslint-plugin';

// @ts-expect-error no type definition
import eslintPluginArrayFunc from 'eslint-plugin-array-func';

import eslintPluginFunctional from 'eslint-plugin-functional';

// @ts-expect-error no type definition
import eslintPluginSecurity from 'eslint-plugin-security';

import eslintPluginUnicorn from 'eslint-plugin-unicorn';

// @ts-expect-error no type definition
import eslintPluginSortDestructureKeys from 'eslint-plugin-sort-destructure-keys';

import eslintPluginImport from 'eslint-plugin-import';

import eslintPluginJest from 'eslint-plugin-jest';

import eslintPluginVitest from 'eslint-plugin-vitest';

import eslintPluginTestingLibrary from 'eslint-plugin-testing-library';

import eslintPluginPlaywright from 'eslint-plugin-playwright';

import eslintPluginCypress from 'eslint-plugin-cypress';

import eslintPluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';

// @ts-expect-error no type definition
import eslintPluginPromise from 'eslint-plugin-promise';

import eslintPluginReact from 'eslint-plugin-react';

import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';

// @ts-expect-error no type definition
import eslintPluginReactPerf from 'eslint-plugin-react-perf';

// @ts-expect-error no type definition
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';

import eslintPluginEslintPlugin from 'eslint-plugin-eslint-plugin';

// import eslintPluginTotalFunctions from 'eslint-plugin-total-functions';
// import eslintPluginTreeShakable from 'eslint-plugin-tree-shakable';
import {
  eslintPluginCustom,
  eslintPluginReactCodingStyle,
  eslintPluginStrictDependencies,
  eslintPluginTotalFunctions,
  eslintPluginTreeShakable,
} from '../plugins/index.mjs';

import { type ESLintPlugin, type FlatConfig } from '../types/index.mjs';

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
  | 'react-coding-style'
  | 'security'
  | 'strict-dependencies'
  | 'testing-library'
  | 'total-functions'
  | 'unicorn'
  | 'sort-destructure-keys'
  | 'tree-shakable'
  | 'eslint-plugin'
  | 'custom',
  Omit<ESLintPlugin, 'configs'>
> = {
  '@typescript-eslint': typescriptEslint,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'array-func': eslintPluginArrayFunc,
  cypress: eslintPluginCypress,
  playwright: eslintPluginPlaywright,
  functional: eslintPluginFunctional,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'sort-destructure-keys': eslintPluginSortDestructureKeys,
  import: eslintPluginImport,
  jest: eslintPluginJest,
  vitest: eslintPluginVitest,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'jsx-a11y': eslintPluginJsxA11y,
  'prefer-arrow-functions': eslintPluginPreferArrowFunctions,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  promise: eslintPluginPromise,
  react: eslintPluginReact,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  'react-hooks': eslintPluginReactHooks as unknown as ESLintPlugin,
  'react-refresh': eslintPluginReactRefresh,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'react-perf': eslintPluginReactPerf,
  'react-coding-style': eslintPluginReactCodingStyle,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  security: eslintPluginSecurity,
  'strict-dependencies': eslintPluginStrictDependencies,
  'testing-library': eslintPluginTestingLibrary,
  'total-functions': eslintPluginTotalFunctions,
  unicorn: eslintPluginUnicorn,
  'tree-shakable': eslintPluginTreeShakable,
  'eslint-plugin': eslintPluginEslintPlugin,
  custom: eslintPluginCustom,
} as const satisfies FlatConfig['plugins'];

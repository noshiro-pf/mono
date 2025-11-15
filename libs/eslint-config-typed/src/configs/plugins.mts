/* eslint-disable @stylistic/padding-line-between-statements */
/* eslint-disable import-x/no-rename-default */

import stylistic from '@stylistic/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';

// @ts-expect-error no type definition
import eslintPluginArrayFunc from 'eslint-plugin-array-func';

import eslintPluginFunctional from 'eslint-plugin-functional';

// @ts-expect-error no type definition
import eslintPluginSecurity from 'eslint-plugin-security';

import eslintPluginUnicorn from 'eslint-plugin-unicorn';

// @ts-expect-error no type definition
import eslintPluginSortDestructureKeys from 'eslint-plugin-sort-destructure-keys';

import eslintPluginImport from 'eslint-plugin-import-x';

import eslintPluginJest from 'eslint-plugin-jest';

import eslintPluginVitest from '@vitest/eslint-plugin';

import eslintPluginTestingLibrary from 'eslint-plugin-testing-library';

import eslintPluginPlaywright from 'eslint-plugin-playwright';

import eslintPluginCypress from 'eslint-plugin-cypress';

import eslintPluginPreferArrowFunctions from 'eslint-plugin-prefer-arrow-functions';

// @ts-expect-error no type definition
import eslintPluginPromise from 'eslint-plugin-promise';

import eslintPluginReact from 'eslint-plugin-react';

import eslintPluginN from 'eslint-plugin-n';

import eslintPluginReactHooks from 'eslint-plugin-react-hooks';

import eslintPluginReactRefresh from 'eslint-plugin-react-refresh';

// @ts-expect-error no type definition
import eslintPluginReactPerf from 'eslint-plugin-react-perf';

// @ts-expect-error no type definition
import eslintPluginJsxA11y from 'eslint-plugin-jsx-a11y';

import eslintPluginMath from 'eslint-plugin-math';

import eslintPluginEslintPlugin from 'eslint-plugin-eslint-plugin';

// import eslintPluginTotalFunctions from 'eslint-plugin-total-functions';
// import eslintPluginTreeShakable from 'eslint-plugin-tree-shakable';
import {
  eslintPluginReactCodingStyle,
  eslintPluginStrictDependencies,
  eslintPluginTotalFunctions,
  eslintPluginTreeShakable,
  eslintPluginTsRestrictions,
  eslintPluginVitestCodingStyle,
} from '../plugins/index.mjs';

import { type ESLintPlugin, type FlatConfig } from '../types/index.mjs';

export const plugins: Record<
  | '@typescript-eslint'
  | '@stylistic'
  | 'array-func'
  | 'cypress'
  | 'playwright'
  | 'functional'
  | 'import-x'
  | 'jest'
  | 'vitest'
  | 'jsx-a11y'
  | 'math'
  | 'prefer-arrow-functions'
  | 'promise'
  | 'n'
  | 'react'
  | 'react-hooks'
  | 'react-refresh'
  | 'react-perf'
  | 'security'
  | 'testing-library'
  | 'unicorn'
  | 'sort-destructure-keys'
  | 'eslint-plugin'
  | 'tree-shakable'
  | 'total-functions'
  | 'strict-dependencies'
  | 'ts-restrictions'
  | 'react-coding-style'
  | 'vitest-coding-style',
  Omit<ESLintPlugin, 'configs'>
> = {
  '@typescript-eslint': typescriptEslint,
  '@stylistic': stylistic,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'array-func': eslintPluginArrayFunc,
  cypress: eslintPluginCypress,
  playwright: eslintPluginPlaywright,
  functional: eslintPluginFunctional,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'sort-destructure-keys': eslintPluginSortDestructureKeys,
  'import-x': eslintPluginImport,
  jest: eslintPluginJest,
  vitest: eslintPluginVitest,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'jsx-a11y': eslintPluginJsxA11y,
  math: eslintPluginMath,
  'prefer-arrow-functions': eslintPluginPreferArrowFunctions,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  promise: eslintPluginPromise,
  n: eslintPluginN,
  react: eslintPluginReact,
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion
  'react-hooks': eslintPluginReactHooks as unknown as ESLintPlugin,
  'react-refresh': eslintPluginReactRefresh,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  'react-perf': eslintPluginReactPerf,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  security: eslintPluginSecurity,
  'testing-library': eslintPluginTestingLibrary,
  unicorn: eslintPluginUnicorn,
  'eslint-plugin': eslintPluginEslintPlugin,
  'tree-shakable': eslintPluginTreeShakable,
  'total-functions': eslintPluginTotalFunctions,
  'strict-dependencies': eslintPluginStrictDependencies,
  'ts-restrictions': eslintPluginTsRestrictions,
  'react-coding-style': eslintPluginReactCodingStyle,
  'vitest-coding-style': eslintPluginVitestCodingStyle,
} as const satisfies FlatConfig['plugins'];

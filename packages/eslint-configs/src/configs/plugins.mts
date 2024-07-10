/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import typescriptEslint from '@typescript-eslint/eslint-plugin';

// @ts-expect-error
import arrayFunc from 'eslint-plugin-array-func';

// @ts-expect-error
import cypress from 'eslint-plugin-cypress';
import deprecation from 'eslint-plugin-deprecation';

import functional from 'eslint-plugin-functional';

// @ts-expect-error
import pluginImport from 'eslint-plugin-import';

// @ts-expect-error
import jest from 'eslint-plugin-jest';

// @ts-expect-error
import promise from 'eslint-plugin-promise';

// @ts-expect-error
import react from 'eslint-plugin-react';

// @ts-expect-error
import reactHooks from 'eslint-plugin-react-hooks';

// @ts-expect-error
import reactRefresh from 'eslint-plugin-react-refresh';

// @ts-expect-error
import security from 'eslint-plugin-security';

// @ts-expect-error
import totalFunctions from 'eslint-plugin-total-functions';

// @ts-expect-error
import unicorn from 'eslint-plugin-unicorn';
import { type FlatConfig } from '../types/flat-config.mjs';

export const plugins: FlatConfig['plugins'] = {
  // @ts-expect-error
  '@typescript-eslint': typescriptEslint,
  'array-func': arrayFunc,
  cypress,
  // @ts-expect-error
  deprecation,
  // @ts-expect-error
  functional,
  import: pluginImport,
  jest,
  promise,
  react,
  'react-hooks': reactHooks,
  'react-refresh': reactRefresh,
  security,
  'total-functions': totalFunctions,
  unicorn,
} as const;

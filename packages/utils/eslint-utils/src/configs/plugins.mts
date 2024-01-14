/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import typescriptEslint from '@typescript-eslint/eslint-plugin';

// @ts-ignore
import arrayFunc from 'eslint-plugin-array-func';

// @ts-ignore
import cypress from 'eslint-plugin-cypress';
import deprecation from 'eslint-plugin-deprecation';

// @ts-ignore
import functional from 'eslint-plugin-functional';

// @ts-ignore
import pluginImport from 'eslint-plugin-import';

// @ts-ignore
import jest from 'eslint-plugin-jest';

// @ts-ignore
import promise from 'eslint-plugin-promise';

// @ts-ignore
import react from 'eslint-plugin-react';

// @ts-ignore
import reactHooks from 'eslint-plugin-react-hooks';

// @ts-ignore
import reactRefresh from 'eslint-plugin-react-refresh';

// @ts-ignore
import security from 'eslint-plugin-security';

// @ts-ignore
import totalFunctions from 'eslint-plugin-total-functions';

// @ts-ignore
import unicorn from 'eslint-plugin-unicorn';
import { type FlatConfig } from '../types/flat-config.mjs';

export const plugins: FlatConfig['plugins'] = {
  // @ts-ignore
  '@typescript-eslint': typescriptEslint,
  'array-func': arrayFunc,
  cypress,
  // @ts-ignore
  deprecation,
  functional,
  import: pluginImport,
  jest,
  promise,
  react,
  'react-hooks': reactHooks,
  'react-refresh': reactRefresh,
  security,
  // @ts-ignore
  'total-functions': totalFunctions,
  unicorn,
} as const;

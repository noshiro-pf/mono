import { type EslintTestingLibraryRules } from '../types/index.mjs';
import { withDefaultOption } from '../types/rule-severity-branded.mjs';

export const eslintTestingLibraryRules: EslintTestingLibraryRules = {
  'testing-library/await-async-events': ['error', { eventModule: 'userEvent' }],
  'testing-library/await-async-queries': 'error',
  'testing-library/await-async-utils': 'error',
  'testing-library/no-await-sync-events': [
    'error',
    { eventModules: ['fire-event'] },
  ],
  'testing-library/no-await-sync-queries': 'error',
  'testing-library/no-container': 'error',
  'testing-library/no-debugging-utils': withDefaultOption('warn'),
  'testing-library/no-dom-import': ['error', 'react'],
  'testing-library/no-global-regexp-flag-in-query': 'error',
  'testing-library/no-manual-cleanup': 'error',
  'testing-library/no-node-access': withDefaultOption('error'),
  'testing-library/no-promise-in-fire-event': 'error',
  'testing-library/no-render-in-lifecycle': withDefaultOption('error'),
  'testing-library/no-unnecessary-act': withDefaultOption('error'),
  'testing-library/no-wait-for-multiple-assertions': 'error',
  'testing-library/no-wait-for-side-effects': 'error',
  'testing-library/no-wait-for-snapshot': 'error',
  'testing-library/prefer-find-by': 'error',
  'testing-library/prefer-presence-queries': withDefaultOption('error'),
  'testing-library/prefer-query-by-disappearance': 'error',
  'testing-library/prefer-screen-queries': 'error',
  'testing-library/render-result-naming-convention': 'error',

  'testing-library/consistent-data-testid': 'off',
  'testing-library/prefer-explicit-assert': 'off',
  'testing-library/prefer-implicit-assert': 'off',
  'testing-library/prefer-query-matchers': 'off',
  'testing-library/prefer-user-event': 'off',
} as const;

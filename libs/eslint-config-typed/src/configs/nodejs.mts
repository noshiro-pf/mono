import globals from 'globals';
import { restrictedGlobals } from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';

export const eslintConfigForNodeJs = (files?: readonly string[]): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),
    languageOptions: {
      // https://github.com/sindresorhus/globals/blob/main/globals.json
      globals: {
        ...globals.node,
      },
    },
    rules: defineKnownRules({
      'no-restricted-globals': ['error', ...restrictedGlobals],
      'no-alert': 'off',
      'no-implicit-globals': 'off',
      'no-script-url': 'off',
      'unicorn/no-document-cookie': 'off',
      'unicorn/no-invalid-fetch-options': 'off',
      'unicorn/no-invalid-remove-event-listener': 'off',
      'unicorn/prefer-blob-reading-methods': 'off',
      'unicorn/prefer-classlist-toggle': 'off',
      'unicorn/prefer-dom-node-append': 'off',
      'unicorn/prefer-dom-node-dataset': 'off',
      'unicorn/prefer-dom-node-remove': 'off',
      'unicorn/prefer-dom-node-text-content': 'off',
      'unicorn/prefer-event-target': 'off',
      'unicorn/prefer-keyboard-event-key': 'off',
      'unicorn/prefer-modern-dom-apis': 'off',
      'unicorn/prefer-query-selector': 'off',
      'unicorn/require-post-message-target-origin': 'off',
    }),
  }) as const;

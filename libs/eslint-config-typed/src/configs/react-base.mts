import {
  eslintJsxA11yRules,
  eslintReactCodingStyleRules,
  eslintReactHooksRules,
  eslintReactPerfRules,
  eslintReactRefreshRules,
  eslintReactRules,
} from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';
import { eslintConfigForBrowser } from './browser.mjs';

export const eslintConfigForReactBase = (
  files?: readonly string[],
): readonly FlatConfig[] =>
  [
    eslintConfigForBrowser(files),
    {
      ...(files === undefined ? {} : { files }),
      languageOptions: {
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
        },
      },
      rules: defineKnownRules({
        ...eslintReactRules,
        ...eslintReactHooksRules,
        ...eslintReactRefreshRules,
        ...eslintJsxA11yRules,
        ...eslintReactPerfRules,
        ...eslintReactCodingStyleRules,
      }),
    },
  ] as const;

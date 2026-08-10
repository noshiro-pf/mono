import {
  eslintJsxA11yRules,
  eslintReactPerfRules,
  eslintReactRules,
} from '../rules/index.mjs';
import {
  defineKnownRules,
  type FlatConfig,
  withDefaultOption,
} from '../types/index.mjs';
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
        ...eslintJsxA11yRules,
        ...eslintReactPerfRules,

        // Classic hooks rules shared by React and Preact
        'react-hooks/rules-of-hooks': withDefaultOption('error'),
        'react-hooks/exhaustive-deps': withDefaultOption('error'),
      }),
    },
  ] as const;

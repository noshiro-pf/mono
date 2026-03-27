import {
  eslintReactCodingStyleRules,
  eslintReactHooksRules,
  eslintReactRefreshRules,
} from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';
import { eslintConfigForReactBase } from './react-base.mjs';

export const eslintConfigForReact = (
  files?: readonly string[],
): readonly FlatConfig[] =>
  [
    ...eslintConfigForReactBase(files),
    {
      ...(files === undefined ? {} : { files }),
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: defineKnownRules({
        // React Compiler rules and classic hooks rules (overrides base)
        ...eslintReactHooksRules,
        // React Fast Refresh
        ...eslintReactRefreshRules,
        // React-specific coding style (React.memo, import style, etc.)
        ...eslintReactCodingStyleRules,
      }),
    },
  ] as const;

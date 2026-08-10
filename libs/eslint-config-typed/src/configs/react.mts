import { Arr } from 'ts-data-forge';
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
  Arr.toPushed(eslintConfigForReactBase(files), {
    ...(files === undefined ? {} : { files }),
    // `version` is intentionally left unset: `'detect'` makes
    // eslint-plugin-react call `context.getFilename()`, which ESLint v10
    // removed, so every version-gated rule (`react/prop-types`,
    // `react/display-name`, ...) throws while loading. Without it the plugin
    // assumes the latest React. Consumers can still set
    // `settings.react.version` themselves.
    rules: defineKnownRules({
      // React Compiler rules and classic hooks rules (overrides base)
      ...eslintReactHooksRules,
      // React Fast Refresh
      ...eslintReactRefreshRules,
      // React-specific coding style (React.memo, import style, etc.)
      ...eslintReactCodingStyleRules,
    }),
  });

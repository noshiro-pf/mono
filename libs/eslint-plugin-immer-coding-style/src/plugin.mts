import type { ReadonlyRecord } from 'ts-type-forge';
import { immerCodingStyleRules } from './rules/index.mjs';
import type { ESLintFlatConfig, ESLintPlugin } from './types.mjs';

/**
 * The rules `eslint-config-typed` turns on, at the severity and options it
 * gives them.
 *
 * The `satisfies` clause below is keyed off {@link immerCodingStyleRules}, so naming
 * a rule that does not exist fails to type-check.
 */
const recommendedRules = {
  'immer-coding-style/mut-prefixed-draft': 'error',
  'immer-coding-style/prefer-curried-produce': 'error',
} as const satisfies Partial<
  ReadonlyRecord<
    `immer-coding-style/${keyof typeof immerCodingStyleRules}`,
    unknown
  >
>;

const recommendedConfig = {
  name: 'immer-coding-style/recommended',
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginImmerCodingStyle` refers to. ESLint rejects a plugin name that maps to two
    // different objects with `Cannot redefine plugin`, which is what a user
    // combining this preset with their own `plugins` entry would hit if the
    // preset embedded a separate copy of the plugin.
    get 'immer-coding-style'(): ESLintPlugin {
      return eslintPluginImmerCodingStyle;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginImmerCodingStyle = {
  meta: {
    name: 'eslint-plugin-immer-coding-style',
  },
  rules: immerCodingStyleRules,
  configs: {
    /** The rules `eslint-config-typed` turns on, as it configures them. */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

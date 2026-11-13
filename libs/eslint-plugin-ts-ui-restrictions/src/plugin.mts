import type { ReadonlyRecord } from 'ts-type-forge';
import { tsUiRestrictionsRules } from './rules/index.mjs';
import type { ESLintFlatConfig, ESLintPlugin } from './types.mjs';

/**
 * The rules `eslint-config-typed` turns on, at the severity and options it
 * gives them.
 *
 * The `satisfies` clause below is keyed off {@link tsUiRestrictionsRules}, so
 * naming a rule that does not exist fails to type-check.
 */
const recommendedRules = {
  'ts-ui-restrictions/jsx-boolean-logical-operands': 'error',
  'ts-ui-restrictions/require-ime-guard': 'error',
} as const satisfies Partial<
  ReadonlyRecord<
    `ts-ui-restrictions/${keyof typeof tsUiRestrictionsRules}`,
    unknown
  >
>;

const recommendedConfig = {
  name: 'ts-ui-restrictions/recommended',
  // Both rules ask the parser for a TypeScript program and throw without one,
  // so the preset applies only where a TypeScript parser can give them one.
  files: ['**/*.{ts,tsx,mts,cts}'],
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginTsUiRestrictions` refers to. ESLint rejects a plugin name
    // that maps to two different objects with `Cannot redefine plugin`, which
    // is what a user combining this preset with their own
    // `plugins: { 'ts-ui-restrictions': eslintPluginTsUiRestrictions }` entry
    // would hit if the preset embedded a separate copy of the plugin.
    get 'ts-ui-restrictions'(): ESLintPlugin {
      return eslintPluginTsUiRestrictions;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginTsUiRestrictions = {
  meta: {
    name: 'eslint-plugin-ts-ui-restrictions',
  },
  rules: tsUiRestrictionsRules,
  configs: {
    /**
     * The rules `eslint-config-typed` turns on, as it configures them. Both
     * read type information, so the config this is used with must give the
     * parser a TypeScript project.
     */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

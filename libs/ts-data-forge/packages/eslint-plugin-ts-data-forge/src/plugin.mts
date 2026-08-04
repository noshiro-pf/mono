import { tsDataForgeRules } from './rules/index.mjs';
import { type ESLintFlatConfig, type ESLintPlugin } from './types.mjs';

/**
 * Every rule this plugin ships, at `error`.
 *
 * The `satisfies` clause below is keyed off {@link tsDataForgeRules}, so adding
 * a rule without listing it here fails to type-check.
 */
const recommendedRules = {
  'ts-data-forge/prefer-canonical-array-slicing': 'error',
  'ts-data-forge/prefer-canonical-length-cast': 'error',
  'ts-data-forge/prefer-canonical-length-guard': 'error',
  'ts-data-forge/prefer-arr-is-array': 'error',
  'ts-data-forge/prefer-arr-sum': 'error',
  'ts-data-forge/prefer-as-int': 'error',
  'ts-data-forge/prefer-is-non-null-object': 'error',
  'ts-data-forge/prefer-range-for-loop': 'error',
  'ts-data-forge/prefer-is-record-and-has-key': 'error',
  'ts-data-forge/prefer-num-safe-parse-int': 'error',
  'ts-data-forge/prefer-num-safe-parse-float': 'error',
  'ts-data-forge/no-unnecessary-type-guard': 'error',
  'ts-data-forge/prefer-comparison-over-nullish-guard': 'error',
} as const satisfies Readonly<
  Record<`ts-data-forge/${keyof typeof tsDataForgeRules}`, 'error'>
>;

const recommendedConfig = {
  name: 'ts-data-forge/recommended',
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginTsDataForge` refers to. ESLint rejects a plugin name that
    // maps to two different objects with `Cannot redefine plugin`, which is
    // what a user combining this preset with their own
    // `plugins: { 'ts-data-forge': eslintPluginTsDataForge }` entry would hit
    // if the preset embedded a separate copy of the plugin.
    get 'ts-data-forge'(): ESLintPlugin {
      return eslintPluginTsDataForge;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginTsDataForge = {
  meta: {
    name: 'eslint-plugin-ts-data-forge',
  },
  rules: tsDataForgeRules,
  configs: {
    /** Enables every rule of this plugin at `error`. */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

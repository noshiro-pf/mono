import { type ReadonlyRecord } from 'ts-type-forge';
import { tsStdForgeRules } from './rules/index.mjs';
import { type ESLintFlatConfig, type ESLintPlugin } from './types.mjs';

/**
 * Every rule this plugin ships, at `error`.
 *
 * The `satisfies` clause below is keyed off {@link tsStdForgeRules}, so adding
 * a rule without listing it here fails to type-check.
 */
const recommendedRules = {
  'ts-std-forge/prefer-is-non-null-object': 'error',
  'ts-std-forge/prefer-is-record-and-has-key': 'error',
  'ts-std-forge/prefer-safe-array-is-array': 'error',
  'ts-std-forge/prefer-safe-array-length-guard': 'error',
  'ts-std-forge/prefer-safe-number-parse': 'error',
  'ts-std-forge/prefer-safe-number-parse-integer': 'error',
} as const satisfies ReadonlyRecord<
  `ts-std-forge/${keyof typeof tsStdForgeRules}`,
  'error'
>;

const recommendedConfig = {
  name: 'ts-std-forge/recommended',
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginTsStdForge` refers to. ESLint rejects a plugin name that
    // maps to two different objects with `Cannot redefine plugin`, which is
    // what a user combining this preset with their own
    // `plugins: { 'ts-std-forge': eslintPluginTsStdForge }` entry would hit
    // if the preset embedded a separate copy of the plugin.
    get 'ts-std-forge'(): ESLintPlugin {
      return eslintPluginTsStdForge;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginTsStdForge = {
  meta: {
    name: 'eslint-plugin-ts-std-forge',
  },
  rules: tsStdForgeRules,
  configs: {
    /** Enables every rule of this plugin at `error`. */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

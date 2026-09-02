import { tsTypeForgeRules } from './rules/index.mjs';
import { type ESLintFlatConfig, type ESLintPlugin } from './types.mjs';

/**
 * Every rule this plugin ships, at `error`.
 *
 * The `satisfies` clause below is keyed off {@link tsTypeForgeRules}, so adding
 * a rule without listing it here fails to type-check.
 */
const recommendedRules = {
  'ts-type-forge/no-side-effect-import': 'error',
  'ts-type-forge/prefer-canonical-length-constrained-tuple': 'error',
  'ts-type-forge/prefer-canonical-mutable-record': 'error',
  'ts-type-forge/prefer-readonly-or-mutable-record': 'error',
  'ts-type-forge/prefer-strict-or-relaxed-utility-type': 'error',
} as const satisfies Readonly<
  Record<`ts-type-forge/${keyof typeof tsTypeForgeRules}`, 'error'>
>;

const recommendedConfig = {
  name: 'ts-type-forge/recommended',
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginTsTypeForge` refers to. ESLint rejects a plugin name that
    // maps to two different objects with `Cannot redefine plugin`, which is
    // what a user combining this preset with their own
    // `plugins: { 'ts-type-forge': eslintPluginTsTypeForge }` entry would hit
    // if the preset embedded a separate copy of the plugin.
    get 'ts-type-forge'(): ESLintPlugin {
      return eslintPluginTsTypeForge;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginTsTypeForge = {
  meta: {
    name: 'eslint-plugin-ts-type-forge',
  },
  rules: tsTypeForgeRules,
  configs: {
    /** Enables every rule of this plugin at `error`. */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

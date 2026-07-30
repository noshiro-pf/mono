import { tsFortressRules } from './rules/index.mjs';
import { type ESLintFlatConfig, type ESLintPlugin } from './types.mjs';

/**
 * Every rule this plugin ships, at `error`.
 *
 * The `satisfies` clause below is keyed off {@link tsFortressRules}, so adding
 * a rule without listing it here fails to type-check.
 */
const recommendedRules = {
  'ts-fortress/prefer-canonical-length-constrained-type': 'error',
} as const satisfies Readonly<
  Record<`ts-fortress/${keyof typeof tsFortressRules}`, 'error'>
>;

const recommendedConfig = {
  name: 'ts-fortress/recommended',
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginTsFortress` refers to. ESLint rejects a plugin name that
    // maps to two different objects with `Cannot redefine plugin`, which is
    // what a user combining this preset with their own
    // `plugins: { 'ts-fortress': eslintPluginTsFortress }` entry would hit if
    // the preset embedded a separate copy of the plugin.
    get 'ts-fortress'(): ESLintPlugin {
      return eslintPluginTsFortress;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginTsFortress = {
  meta: {
    name: 'eslint-plugin-ts-fortress',
  },
  rules: tsFortressRules,
  configs: {
    /** Enables every rule of this plugin at `error`. */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

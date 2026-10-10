import { type ReadonlyRecord, type StrictExclude } from 'ts-type-forge';
import { tsFortressRules } from './rules/index.mjs';
import { type ESLintFlatConfig, type ESLintPlugin } from './types.mjs';

/**
 * Rules the preset leaves off, because enabling one takes more than turning it
 * on: `no-type-only-codec` needs type information, and a library has to tell
 * it its entry points or it reports the codecs of its public API.
 */
type OptInRule = 'no-type-only-codec';

/**
 * Every rule this plugin ships, at `error`, but those in {@link OptInRule}.
 *
 * The `satisfies` clause below is keyed off {@link tsFortressRules}, so leaving
 * out a rule that is not opt-in, naming one that does not exist, or setting one
 * to anything but `error` fails to type-check. That is the whole check; no test
 * repeats it.
 */
const recommendedRules = {
  'ts-fortress/prefer-canonical-length-constrained-type': 'error',
  'ts-fortress/prefer-namespace-import': 'error',
  'ts-fortress/prefer-schema-over-guard-chain': 'error',
} as const satisfies ReadonlyRecord<
  `ts-fortress/${StrictExclude<keyof typeof tsFortressRules, OptInRule>}`,
  'error'
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
    /** Enables every rule of this plugin at `error`, but the opt-in ones. */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

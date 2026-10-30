import type { ReadonlyRecord } from 'ts-type-forge';
import { synstateRules } from './rules/index.mjs';
import type { ESLintFlatConfig, ESLintPlugin } from './types.mjs';

/**
 * Every rule this plugin ships, at `error`.
 *
 * The `satisfies` clause below is keyed off {@link synstateRules}, so leaving a
 * rule out, naming one that does not exist, or setting one to anything
 * but `error` fails to type-check. That is the whole check; no test repeats it.
 */
const recommendedRules = {
  'synstate/no-identity-map': 'error',
  'synstate/no-redundant-skip-if-no-change': 'error',
  'synstate/no-throw-in-operator': 'error',
  'synstate/no-unbounded-counter-pipe': 'error',
  'synstate/no-write-during-propagation': 'error',
  'synstate/prefer-derive': 'error',
  'synstate/prefer-map-to': 'error',
} as const satisfies ReadonlyRecord<
  `synstate/${keyof typeof synstateRules}`,
  'error'
>;

const recommendedConfig = {
  name: 'synstate/recommended',
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginSynstate` refers to. ESLint rejects a plugin name that
    // maps to two different objects with `Cannot redefine plugin`, which is
    // what a user combining this preset with their own
    // `plugins: { synstate: eslintPluginSynstate }` entry would hit
    // if the preset embedded a separate copy of the plugin.
    get synstate(): ESLintPlugin {
      return eslintPluginSynstate;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginSynstate = {
  meta: {
    name: 'eslint-plugin-synstate',
  },
  rules: synstateRules,
  configs: {
    /** Enables every rule of this plugin at `error`. */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

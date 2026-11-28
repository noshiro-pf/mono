import type { ReadonlyRecord, StrictExclude } from 'ts-type-forge';
import { synstateRules } from './rules/index.mjs';
import type { ESLintFlatConfig, ESLintPlugin } from './types.mjs';

/**
 * The rules for synstate-dom code alone, which `recommended` leaves out: they
 * read JSX as synstate-dom binds it, and would misjudge React's
 * (`no-unfocusable-focus-handler`: React's `onFocus` bubbles).
 */
const synstateDomRules = {
  'synstate/no-aria-string-conversion': 'error',
  'synstate/no-unfocusable-focus-handler': 'error',
} as const satisfies Partial<
  ReadonlyRecord<`synstate/${keyof typeof synstateRules}`, 'error'>
>;

type SynstateDomRuleName = keyof typeof synstateDomRules;

/**
 * Every rule this plugin ships, at `error`, but the synstate-dom ones.
 *
 * The `satisfies` clause below is keyed off {@link synstateRules}, so leaving a
 * rule out, naming one that does not exist, or setting one to anything but
 * `error` fails to type-check. That is the whole check; no test repeats it.
 */
const recommendedRules = {
  'synstate/no-constant-map': 'error',
  'synstate/no-identity-map': 'error',
  'synstate/no-observable-in-handler': 'error',
  'synstate/no-redundant-skip-if-no-change': 'error',
  'synstate/no-throw-in-operator': 'error',
  'synstate/no-unbounded-counter-pipe': 'error',
  'synstate/no-write-during-propagation': 'error',
} as const satisfies ReadonlyRecord<
  StrictExclude<`synstate/${keyof typeof synstateRules}`, SynstateDomRuleName>,
  'error'
>;

const recommendedConfig = {
  name: 'synstate/recommended',
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginSynstate` refers to. ESLint rejects a plugin name that maps
    // to two different objects with `Cannot redefine plugin`, which is what a
    // user combining this preset with their own
    // `plugins: { synstate: eslintPluginSynstate }` entry would hit if the
    // preset embedded a separate copy of the plugin.
    get synstate(): ESLintPlugin {
      return eslintPluginSynstate;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

const synstateDomConfig = {
  name: 'synstate/synstate-dom',
  plugins: {
    // Resolved lazily, as in `recommendedConfig`.
    get synstate(): ESLintPlugin {
      return eslintPluginSynstate;
    },
  },
  rules: synstateDomRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginSynstate = {
  meta: {
    name: 'eslint-plugin-synstate',
  },
  rules: synstateRules,
  configs: {
    /** Enables every rule of this plugin at `error`, but the synstate-dom ones. */
    recommended: recommendedConfig,
    /**
     * Enables the rules for synstate-dom code at `error`; add it beside
     * `recommended` for the files synstate-dom renders.
     */
    'synstate-dom': synstateDomConfig,
  },
} as const satisfies ESLintPlugin;

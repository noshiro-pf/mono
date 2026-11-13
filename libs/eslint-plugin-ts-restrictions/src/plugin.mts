import type { ReadonlyRecord } from 'ts-type-forge';
import { tsRestrictionsRules } from './rules/index.mjs';
import type { ESLintFlatConfig, ESLintPlugin } from './types.mjs';

/**
 * The rules `eslint-config-typed` turns on, at the severity and options it
 * gives them. `no-restricted-syntax` and `no-restricted-cast-name` are left
 * out: they report nothing until a config names what to restrict.
 *
 * The `satisfies` clause below is keyed off {@link tsRestrictionsRules}, so
 * naming a rule that does not exist fails to type-check.
 */
const recommendedRules = {
  'ts-restrictions/check-destructuring-completeness': 'error',
  'ts-restrictions/explicit-collection-type-arguments': 'error',
  'ts-restrictions/function-order': 'error',
  'ts-restrictions/no-clock-read-at-module-load': 'error',
  'ts-restrictions/no-date-only-string-to-date': 'error',
  'ts-restrictions/no-detached-jsdoc': 'error',
  'ts-restrictions/no-export-type-side-effects': 'error',
  'ts-restrictions/no-negated-comparison': 'error',
  'ts-restrictions/no-optional-phantom-property': 'error',
  'ts-restrictions/no-ragged-comment-wrap': 'error',
  'ts-restrictions/no-string-spread': 'error',
  'ts-restrictions/no-unnecessary-array-from': 'error',
  'ts-restrictions/no-unnecessary-coalesce-undefined': 'error',
  'ts-restrictions/prefer-curried-call': 'error',
  'ts-restrictions/prefer-dedent': 'error',
  'ts-restrictions/prefer-logical-over-boolean-ternary': 'error',
  'ts-restrictions/prefer-non-mutating-array-method': 'error',
  'ts-restrictions/prefer-nullish-coalescing-when-safe': 'error',
  'ts-restrictions/prefer-optional-chain-over-ternary': 'error',
  'ts-restrictions/prefer-range-in-number-line-order': 'error',
  'ts-restrictions/prefer-ternary': ['error', 'only-single-line'],
} as const satisfies Partial<
  ReadonlyRecord<`ts-restrictions/${keyof typeof tsRestrictionsRules}`, unknown>
>;

const recommendedConfig = {
  name: 'ts-restrictions/recommended',
  // Most rules ask the parser for a TypeScript program and throw without one,
  // so the preset applies only where a TypeScript parser can give them one.
  files: ['**/*.{ts,tsx,mts,cts}'],
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginTsRestrictions` refers to. ESLint rejects a plugin name that
    // maps to two different objects with `Cannot redefine plugin`, which is
    // what a user combining this preset with their own
    // `plugins: { 'ts-restrictions': eslintPluginTsRestrictions }` entry would
    // hit if the preset embedded a separate copy of the plugin.
    get 'ts-restrictions'(): ESLintPlugin {
      return eslintPluginTsRestrictions;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginTsRestrictions = {
  meta: {
    name: 'eslint-plugin-ts-restrictions',
  },
  rules: tsRestrictionsRules,
  configs: {
    /**
     * The rules `eslint-config-typed` turns on, as it configures them. Most
     * read type information, so the config this is used with must give the
     * parser a TypeScript project.
     */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

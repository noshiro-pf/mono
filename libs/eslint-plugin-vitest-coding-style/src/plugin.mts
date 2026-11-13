import type { ReadonlyRecord } from 'ts-type-forge';
import { vitestCodingStyleRules } from './rules/index.mjs';
import type { ESLintFlatConfig, ESLintPlugin } from './types.mjs';

/**
 * The rules `eslint-config-typed` turns on, at the severity and options it
 * gives them.
 *
 * The `satisfies` clause below is keyed off {@link vitestCodingStyleRules}, so naming
 * a rule that does not exist fails to type-check.
 */
const recommendedRules = {
  'vitest-coding-style/no-expect-to-strict-equal': 'error',
  'vitest-coding-style/prefer-assert-deep-strict-equal-over-deep-equal':
    'error',
  'vitest-coding-style/prefer-assert-is-false-over-assert-not-ok': 'error',
  'vitest-coding-style/prefer-assert-is-false-over-expect-false': 'error',
  'vitest-coding-style/prefer-assert-is-false-over-negated-assert-is-true':
    'error',
  'vitest-coding-style/prefer-assert-is-true-over-assert': 'error',
  'vitest-coding-style/prefer-assert-is-true-over-expect-true': 'error',
  'vitest-coding-style/prefer-assert-is-true-over-negated-assert-is-false':
    'error',
  'vitest-coding-style/prefer-assert-strict-equal-for-primitives': 'error',
} as const satisfies Partial<
  ReadonlyRecord<
    `vitest-coding-style/${keyof typeof vitestCodingStyleRules}`,
    unknown
  >
>;

const recommendedConfig = {
  name: 'vitest-coding-style/recommended',
  // Three rules ask the parser for a TypeScript program and throw without one,
  // so the preset applies only where a TypeScript parser can give them one.
  files: ['**/*.{ts,tsx,mts,cts}'],
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginVitestCodingStyle` refers to. ESLint rejects a plugin name that maps to two
    // different objects with `Cannot redefine plugin`, which is what a user
    // combining this preset with their own `plugins` entry would hit if the
    // preset embedded a separate copy of the plugin.
    get 'vitest-coding-style'(): ESLintPlugin {
      return eslintPluginVitestCodingStyle;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginVitestCodingStyle = {
  meta: {
    name: 'eslint-plugin-vitest-coding-style',
  },
  rules: vitestCodingStyleRules,
  configs: {
    /** The rules `eslint-config-typed` turns on, as it configures them. */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

import type { ReadonlyRecord } from 'ts-type-forge';
import { reactCodingStyleRules } from './rules/index.mjs';
import type { ESLintFlatConfig, ESLintPlugin } from './types.mjs';

/**
 * The rules `eslint-config-typed` turns on, at the severity and options it
 * gives them.
 *
 * The `satisfies` clause below is keyed off {@link reactCodingStyleRules}, so naming
 * a rule that does not exist fails to type-check.
 */
const recommendedRules = {
  'react-coding-style/ban-use-imperative-handle-hook': 'error',
  'react-coding-style/component-name': ['error', { maxLength: 42 }],
  'react-coding-style/component-var-type-annotation': 'error',
  'react-coding-style/display-name': ['error', {}],
  'react-coding-style/import-style': ['error', { importStyle: 'namespace' }],
  'react-coding-style/props-type-annotation-style': 'error',
  'react-coding-style/react-memo-props-argument-name': 'error',
  'react-coding-style/react-memo-type-parameter': 'error',
  'react-coding-style/require-react-memo': ['error', {}],
  'react-coding-style/require-use-memo': [
    'error',
    { componentWrappers: ['memoNamed'] },
  ],
  'react-coding-style/single-jsx-return': [
    'error',
    { componentWrappers: ['memoNamed'] },
  ],
  'react-coding-style/use-memo-hook-style': 'error',
} as const satisfies Partial<
  ReadonlyRecord<
    `react-coding-style/${keyof typeof reactCodingStyleRules}`,
    unknown
  >
>;

const recommendedConfig = {
  name: 'react-coding-style/recommended',
  plugins: {
    // Resolved lazily so that this config registers the *same* object that
    // `eslintPluginReactCodingStyle` refers to. ESLint rejects a plugin name that maps to two
    // different objects with `Cannot redefine plugin`, which is what a user
    // combining this preset with their own `plugins` entry would hit if the
    // preset embedded a separate copy of the plugin.
    get 'react-coding-style'(): ESLintPlugin {
      return eslintPluginReactCodingStyle;
    },
  },
  rules: recommendedRules,
} as const satisfies ESLintFlatConfig;

export const eslintPluginReactCodingStyle = {
  meta: {
    name: 'eslint-plugin-react-coding-style',
  },
  rules: reactCodingStyleRules,
  configs: {
    /** The rules `eslint-config-typed` turns on, as it configures them. */
    recommended: recommendedConfig,
  },
} as const satisfies ESLintPlugin;

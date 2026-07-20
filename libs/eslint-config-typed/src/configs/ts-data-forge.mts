import { eslintTsDataForgeRules } from '../rules/index.mjs';
import { defineKnownRules, type FlatConfig } from '../types/index.mjs';

/**
 * @deprecated Use the standalone
 * [`eslint-plugin-ts-data-forge`](https://www.npmjs.com/package/eslint-plugin-ts-data-forge)
 * package instead. It contains the same rules but is versioned and released
 * together with `ts-data-forge`, so the rules always match the `ts-data-forge`
 * version you use. Register the plugin and enable the rules directly:
 *
 * ```js
 * // eslint.config.mjs
 * import tsDataForge from 'eslint-plugin-ts-data-forge';
 *
 * export default [
 *   {
 *     plugins: { 'ts-data-forge': tsDataForge },
 *     rules: {
 *       'ts-data-forge/prefer-arr-is-non-empty': 'error',
 *       'ts-data-forge/prefer-is-record-and-has-key': 'error',
 *       // ...enable the rules you want
 *     },
 *   },
 * ];
 * ```
 *
 * This helper (and the bundled `ts-data-forge` rules) will be removed from
 * `eslint-config-typed` in the next major version.
 */
export const eslintConfigForTsDataForge = (
  files?: readonly string[],
): FlatConfig =>
  ({
    ...(files === undefined ? {} : { files }),

    rules: defineKnownRules({ ...eslintTsDataForgeRules }),
  }) as const;

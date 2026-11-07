// @ts-expect-error no type definition
import eslintPluginPromise from 'eslint-plugin-promise';
import { pluginRule, suggestionOnly } from './suggestion-only.mjs';

/**
 * `promise/prefer-catch`, its fix only suggested. The fix rewrites
 * `p.then(a, b)` into `p.catch(b).then(a)`, which calls `a` with what `b`
 * returns after a rejection too; the report still holds.
 */
export const preferCatch = suggestionOnly(
  pluginRule(eslintPluginPromise, 'prefer-catch'),
  'promise/prefer-catch',
);

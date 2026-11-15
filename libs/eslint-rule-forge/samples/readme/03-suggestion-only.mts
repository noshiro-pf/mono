import type { Rule } from 'eslint';
import { pluginRule, suggestionOnly } from 'eslint-rule-forge';
import type { ReadonlyRecord } from 'ts-type-forge';

// `eslint-plugin-promise` ships no types, so its default import is read as
// `unknown`. Its `prefer-catch` reports rightly, but its fix rewrites
// `p.then(a, b)` into `p.catch(b).then(a)`, which calls `a` after a rejection
// too. Kept with the fix offered as a suggestion, under your plugin's own name,
// with `promise/prefer-catch` turned off beside it.
export const rulesOfYourPlugin = (
  eslintPluginPromise: unknown,
): ReadonlyRecord<string, Rule.RuleModule> =>
  ({
    'prefer-catch': suggestionOnly(
      pluginRule(eslintPluginPromise, 'prefer-catch'),
      'promise/prefer-catch',
    ),
  }) as const;

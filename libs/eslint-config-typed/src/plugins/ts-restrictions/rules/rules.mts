import { tsRestrictionsRules as standaloneTsRestrictionsRules } from 'eslint-plugin-ts-restrictions';
import { tsUiRestrictionsRules } from 'eslint-plugin-ts-ui-restrictions';
import type { ESLintPlugin } from '../../../types/index.mjs';
import { movedRule } from './moved-rule.mjs';
import { preferCatch } from './prefer-catch.mjs';
import { preferGlobalThis } from './prefer-global-this.mjs';

/**
 * The rules of `eslint-plugin-ts-restrictions`, plus the two that wrap a rule
 * of another plugin this package already depends on. They stay here so that the
 * standalone plugin depends on neither `eslint-plugin-promise` nor
 * `eslint-plugin-unicorn`; under this package their ids are unchanged.
 *
 * The two rules that moved to `eslint-plugin-ts-ui-restrictions` keep their old
 * ids here too, deprecated, until the next major (`movedRule`).
 */
export const tsRestrictionsRules = {
  ...standaloneTsRestrictionsRules,
  'prefer-catch': preferCatch,
  'prefer-global-this': preferGlobalThis,
  'jsx-boolean-logical-operands': movedRule(
    tsUiRestrictionsRules['jsx-boolean-logical-operands'],
    {
      packageName: 'eslint-plugin-ts-ui-restrictions',
      ruleId: 'ts-ui-restrictions/jsx-boolean-logical-operands',
    },
  ),
  'require-ime-guard-on-enter': movedRule(
    tsUiRestrictionsRules['require-ime-guard'],
    {
      packageName: 'eslint-plugin-ts-ui-restrictions',
      ruleId: 'ts-ui-restrictions/require-ime-guard',
    },
  ),
} as const satisfies ESLintPlugin['rules'];

import { tsRestrictionsRules as standaloneTsRestrictionsRules } from 'eslint-plugin-ts-restrictions';
import type { ESLintPlugin } from '../../../types/index.mjs';
import { preferCatch } from './prefer-catch.mjs';
import { preferGlobalThis } from './prefer-global-this.mjs';

/**
 * The rules of `eslint-plugin-ts-restrictions`, plus the two that wrap a rule
 * of another plugin this package already depends on. They stay here so that the
 * standalone plugin depends on neither `eslint-plugin-promise` nor
 * `eslint-plugin-unicorn`; under this package their ids are unchanged.
 */
export const tsRestrictionsRules = {
  ...standaloneTsRestrictionsRules,
  'prefer-catch': preferCatch,
  'prefer-global-this': preferGlobalThis,
} as const satisfies ESLintPlugin['rules'];

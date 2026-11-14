import type { ESLintPlugin } from '../types.mjs';
import { jsxBooleanLogicalOperands } from './jsx-boolean-logical-operands.mjs';
import { requireImeGuard } from './require-ime-guard.mjs';

export const tsUiRestrictionsRules = {
  'jsx-boolean-logical-operands': jsxBooleanLogicalOperands,
  'require-ime-guard': requireImeGuard,
} as const satisfies ESLintPlugin['rules'];

import { type ESLintPlugin } from '../../../types/index.mjs';
import { strictDependenciesRule } from './strict-dependencies.mjs';

export const strictDependenciesRules = {
  'strict-dependencies': strictDependenciesRule,
} as const satisfies ESLintPlugin['rules'];

import { type Plugin } from '../../../types/index.mjs';
import { preferUnknownToAny } from './prefer-unknown-to-any.mjs';

export const rules = {
  'prefer-unknown-to-any': preferUnknownToAny,
} as const satisfies Plugin['rules'];

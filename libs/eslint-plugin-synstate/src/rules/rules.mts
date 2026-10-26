import type { ESLintPlugin } from '../types.mjs';
import { noRedundantSkipIfNoChange } from './no-redundant-skip-if-no-change.mjs';
import { noUnboundedCounterPipe } from './no-unbounded-counter-pipe.mjs';
import { noWriteDuringPropagation } from './no-write-during-propagation.mjs';
import { preferMapTo } from './prefer-map-to.mjs';

export const synstateRules = {
  'no-redundant-skip-if-no-change': noRedundantSkipIfNoChange,
  'no-unbounded-counter-pipe': noUnboundedCounterPipe,
  'no-write-during-propagation': noWriteDuringPropagation,
  'prefer-map-to': preferMapTo,
} as const satisfies ESLintPlugin['rules'];

import type { ESLintPlugin } from '../types.mjs';
import { noUnboundedCounterPipe } from './no-unbounded-counter-pipe.mjs';
import { noWriteDuringPropagation } from './no-write-during-propagation.mjs';

export const synstateRules = {
  'no-unbounded-counter-pipe': noUnboundedCounterPipe,
  'no-write-during-propagation': noWriteDuringPropagation,
} as const satisfies ESLintPlugin['rules'];

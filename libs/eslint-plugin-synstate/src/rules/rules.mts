import type { ESLintPlugin } from '../types.mjs';
import { noUnboundedCounterPipe } from './no-unbounded-counter-pipe.mjs';

export const synstateRules = {
  'no-unbounded-counter-pipe': noUnboundedCounterPipe,
} as const satisfies ESLintPlugin['rules'];

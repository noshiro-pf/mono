import type { ESLintPlugin } from '../types.mjs';
import { noIdentityMap } from './no-identity-map.mjs';
import { noRedundantSkipIfNoChange } from './no-redundant-skip-if-no-change.mjs';
import { noThrowInOperator } from './no-throw-in-operator.mjs';
import { noUnboundedCounterPipe } from './no-unbounded-counter-pipe.mjs';
import { noWriteDuringPropagation } from './no-write-during-propagation.mjs';
import { preferMapTo } from './prefer-map-to.mjs';

export const synstateRules = {
  'no-identity-map': noIdentityMap,
  'no-redundant-skip-if-no-change': noRedundantSkipIfNoChange,
  'no-throw-in-operator': noThrowInOperator,
  'no-unbounded-counter-pipe': noUnboundedCounterPipe,
  'no-write-during-propagation': noWriteDuringPropagation,
  'prefer-map-to': preferMapTo,
} as const satisfies ESLintPlugin['rules'];

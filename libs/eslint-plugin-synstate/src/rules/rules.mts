import type { ESLintPlugin } from '../types.mjs';
import { noAriaStringConversion } from './no-aria-string-conversion.mjs';
import { noIdentityMap } from './no-identity-map.mjs';
import { noObservableInHandler } from './no-observable-in-handler.mjs';
import { noRedundantSkipIfNoChange } from './no-redundant-skip-if-no-change.mjs';
import { noThrowInOperator } from './no-throw-in-operator.mjs';
import { noUnboundedCounterPipe } from './no-unbounded-counter-pipe.mjs';
import { noUnfocusableFocusHandler } from './no-unfocusable-focus-handler.mjs';
import { noWriteDuringPropagation } from './no-write-during-propagation.mjs';
import { preferDerive } from './prefer-derive.mjs';
import { preferMapTo } from './prefer-map-to.mjs';

export const synstateRules = {
  'no-aria-string-conversion': noAriaStringConversion,
  'no-identity-map': noIdentityMap,
  'no-observable-in-handler': noObservableInHandler,
  'no-redundant-skip-if-no-change': noRedundantSkipIfNoChange,
  'no-throw-in-operator': noThrowInOperator,
  'no-unbounded-counter-pipe': noUnboundedCounterPipe,
  'no-unfocusable-focus-handler': noUnfocusableFocusHandler,
  'no-write-during-propagation': noWriteDuringPropagation,
  'prefer-derive': preferDerive,
  'prefer-map-to': preferMapTo,
} as const satisfies ESLintPlugin['rules'];

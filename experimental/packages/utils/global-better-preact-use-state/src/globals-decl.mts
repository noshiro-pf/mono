import {
  type useBoolState as VAR_useBoolState,
  type useState as VAR_useState,
} from 'better-preact-use-state';

declare global {
  /* custom types */

  const useBoolState: typeof VAR_useBoolState;
  const useState: typeof VAR_useState;

  /* custom variables */
}

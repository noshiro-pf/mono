import {
  type useBoolState as VAR_useBoolState,
  type useState as VAR_useState,
} from 'better-react-use-state';

declare global {
  /* custom types */

  const useState: typeof VAR_useState;
  const useBoolState: typeof VAR_useBoolState;

  /* custom variables */
}

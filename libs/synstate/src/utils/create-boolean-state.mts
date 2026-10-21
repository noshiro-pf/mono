import { type InitializedObservable } from '../core/index.mjs';
import { createState } from './create-state.mjs';

/**
 * Creates a reactive boolean state with convenient methods for boolean operations.
 * Extends `createState` with boolean-specific helpers like `toggle`, `setTrue`, and `setFalse`.
 *
 * @param initialState - The initial boolean value
 * @returns A 2-element tuple: `[state, { setTrue, setFalse, toggle, setState, updateState, resetState, getSnapshot, initialState }]`
 *
 * @example
 * ```ts
 * import type * as React from 'react';
 * import { createBooleanState } from 'synstate';
 * import { useObservableValue } from 'synstate-react-hooks';
 *
 *     // Menu drawer open/close state.
 *     // setTrue and setFalse can be passed directly as callbacks
 *     // — no need to create wrapper functions like `() => setState(true)`.
 *     const [menuOpen$, { setTrue: openMenu, setFalse: closeMenu }] =
 *       createBooleanState(false);
 *
 *     const SampleComponent = (): React.JSX.Element => (
 *       <MenuDrawer
 *         open={useObservableValue(menuOpen$)}
 *         onClose={closeMenu}
 *         onOpen={openMenu}
 *       />
 *     );
 * ```
 */

export const createBooleanState = (
  initialState: boolean,
): readonly [
  state: InitializedObservable<boolean>,
  utils: Readonly<{
    setTrue: () => void;
    setFalse: () => void;
    setState: (next: boolean) => boolean;
    toggle: () => boolean;
    updateState: (updateFn: (prev: boolean) => boolean) => boolean;
    resetState: () => boolean;
    getSnapshot: () => boolean;
    initialState: boolean;
  }>,
] => {
  const [state, setState, { updateState, resetState, getSnapshot }] =
    createState(initialState);

  return [
    state,
    {
      setTrue: () => {
        setState(true);
      },
      setFalse: () => {
        setState(false);
      },
      toggle: () => updateState((s) => !s),
      setState,
      updateState,
      resetState,
      getSnapshot,
      initialState,
    },
  ] as const;
};

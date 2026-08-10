import type * as React from 'react';
import { createBooleanState } from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';

/* embed-sample-code-ignore-this-line */ if (import.meta.vitest !== undefined) {
  /* embed-sample-code-ignore-this-line */ test(createBooleanState, () => {
    // Menu drawer open/close state.
    // setTrue and setFalse can be passed directly as callbacks
    // — no need to create wrapper functions like `() => setState(true)`.
    const [menuOpen$, { setTrue: openMenu, setFalse: closeMenu }] =
      createBooleanState(false);

    const SampleComponent = (): React.JSX.Element => (
      <MenuDrawer
        open={useObservableValue(menuOpen$)}
        onClose={closeMenu}
        onOpen={openMenu}
      />
    );

    // embed-sample-code-ignore-below
    noop(SampleComponent);

    assert.isTrue(true);
  });
}

const noop = (..._args: readonly unknown[]): void => {};

const MenuDrawer = (
  _props: Readonly<{
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
  }>,
): React.JSX.Element => <div />;

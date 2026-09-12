import { useBoolState } from 'better-react-use-state';
import type * as React from 'react';

export const MyComponent = (): React.JSX.Element => {
  const [isOpen, { setTrue: openPanel, setFalse: closePanel, toggleState }] =
    useBoolState(false);

  return (
    <div>
      <p>{`Is Open: ${isOpen ? 'Yes' : 'No'}`}</p>
      <button type={'button'} onClick={openPanel}>
        {'Open'}
      </button>
      <button type={'button'} onClick={closePanel}>
        {'Close'}
      </button>
      {/* Toggles the boolean value */}
      <button type={'button'} onClick={toggleState}>
        {'Toggle'}
      </button>
    </div>
  );
};

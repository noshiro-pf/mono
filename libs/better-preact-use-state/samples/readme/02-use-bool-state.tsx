import { useBoolState } from 'better-preact-use-state';
import type * as Preact from 'preact';

export const MyComponent = (): Preact.JSX.Element => {
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

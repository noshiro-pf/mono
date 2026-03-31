/* eslint-disable @typescript-eslint/strict-void-return */
// embed-sample-code-ignore-above
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Create global state
export const [useCounterState, , { updateState, resetState }] = createState(0);

const increment = (): void => {
  updateState((n) => n + 1);
};

// Component 1
const Counter = (): React.JSX.Element => {
  const count = useCounterState();

  return (
    <div>
      <p>{`Count: ${count}`}</p>
      <button onClick={increment}>{'Increment'}</button>
    </div>
  );
};

// Component 2
const ResetButton = (): React.JSX.Element => (
  <button onClick={resetState}>{'Reset'}</button>
);

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(Counter, ResetButton);

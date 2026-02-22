/* eslint-disable import-x/no-extraneous-dependencies */
// embed-sample-code-ignore-above
import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// Create global state
export const [useCounterState, , { updateState, resetState, getSnapshot }] =
  createState(0);

// Component 1
const Counter = (): React.JSX.Element => {
  const count = useCounterState();

  return (
    <div>
      <p>
        {'Count: '}
        {count}
      </p>
      <button
        onClick={() => {
          updateState((n: number) => n + 1);
        }}
      >
        {'Increment'}
      </button>
    </div>
  );
};

// Component 2 (synced automatically)
const ResetButton = (): React.JSX.Element => (
  <button
    onClick={() => {
      resetState();
    }}
  >
    {'Reset'}
  </button>
);

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(Counter, ResetButton);

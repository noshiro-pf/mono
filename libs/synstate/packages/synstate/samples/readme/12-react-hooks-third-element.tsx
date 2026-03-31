/* eslint-disable @typescript-eslint/strict-void-return */
// embed-sample-code-ignore-above

import type * as React from 'react';
import { createState } from 'synstate-react-hooks';

// The third element provides additional utilities and the underlying Observable.
const [
  useCount,
  setCount,
  {
    state,
    updateState: updateCount,
    resetState: resetCount,
    getSnapshot: getCountSnapshot,
  },
] = createState(0);

const increment = (): void => {
  updateCount((n) => n + 1);
};

const Counter = (): React.JSX.Element => {
  const count = useCount();

  return (
    <div>
      <p>{`Count: ${count}`}</p>
      <button onClick={increment}>{'Increment'}</button>
      <button onClick={resetCount}>{'Reset'}</button>
    </div>
  );
};

// `state` is the same InitializedObservable<number> that the core
// synstate package's createState returns as its first element.
// You can use it with pipe, combine, subscribe, etc.
state.subscribe((value) => {
  console.log('count changed:', value);
});

// Read the current value synchronously (outside of React rendering)
console.log('current count:', getCountSnapshot());

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(Counter, setCount);

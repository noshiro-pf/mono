// embed-sample-code-ignore-above

import type * as React from 'react';
import { map } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';

const [useCount, , { state: count$ }] = createState(0);

// Derive a new Observable using pipe + map
const doubled$ = count$.pipe(map((n) => n * 2));

const message$ = count$.pipe(
  map((n) => (n === 0 ? 'Click to start' : `Count is ${n}`)),
);

const CountDisplay = (): React.JSX.Element => {
  const count = useCount(); // Equivalent to using useObservableValue(count$)

  // Subscribe to derived Observables with useObservableValue
  const doubled = useObservableValue(doubled$);

  const message = useObservableValue(message$);

  return (
    <div>
      <p>{`Count: ${count}, Doubled: ${doubled}`}</p>
      <p>{message}</p>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(CountDisplay);

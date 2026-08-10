// embed-sample-code-ignore-above

import type * as React from 'react';
import { map, type Observable } from 'synstate';
import { createState, useObservableValue } from 'synstate-react-hooks';

const [useCount, setCount, { state: count$ }] = createState(0);

// Derived InitializedObservable — no fallback needed.
const doubled$ = count$.pipe(map((n) => n * 2));

// Imagine an Observable<string> that has no initial value
// (e.g. one waiting on an async source).
declare const userName$: Observable<string>;

const Profile = (): React.JSX.Element => {
  const doubled = useObservableValue(doubled$); // number

  const userName = useObservableValue(userName$, 'Guest'); // string

  return (
    <div>
      <p>{`Doubled count: ${doubled}`}</p>
      <p>{`Hello, ${userName}`}</p>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(useCount, setCount, Profile);

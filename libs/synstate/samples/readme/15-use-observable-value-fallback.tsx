// embed-sample-code-ignore-above

import type * as React from 'react';
import { type Observable } from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';

// Observable<string> that may not have emitted yet.
declare const userName$: Observable<string>;

const Greeting = (): React.JSX.Element => {
  const userName = useObservableValue(userName$, 'Guest'); // string

  return <p>{`Hello, ${userName}`}</p>;
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(Greeting);

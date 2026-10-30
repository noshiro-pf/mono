// embed-sample-code-ignore-above

import type * as React from 'react';
import { createState, useObservableEffect } from 'synstate-react-hooks';

// Written by the search box
export const [, setQuery, { state: query$ }] = createState('');

// Written by the code that fetches the results
export const [useResults, setResults] = createState<readonly string[]>([]);

const ResultList = (): React.JSX.Element => {
  const results = useResults();

  // Called on mount with the current query, then on every change, until
  // unmount: the page starts at the top and goes back there for a new query
  useObservableEffect(query$, () => {
    window.scrollTo({ top: 0 });
  });

  return (
    <ul>
      {results.map((r) => (
        <li key={r}>{r}</li>
      ))}
    </ul>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(ResultList);

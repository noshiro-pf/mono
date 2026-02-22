/* eslint-disable import-x/no-extraneous-dependencies */
// embed-sample-code-ignore-above

import type * as React from 'react';
import {
  createState,
  debounceTime,
  filter,
  fromPromise,
  type InitializedObservable,
  map,
  switchMap,
  withInitialValue,
} from 'synstate';
import { useObservableValue } from 'synstate-react-hooks';
import { Result } from 'ts-data-forge';

const [searchState, setSearchState] = createState('');

// Advanced reactive pipeline with debounce and filtering
const searchResults$: InitializedObservable<
  readonly Readonly<{ id: string; name: string }>[]
> = searchState
  .pipe(debounceTime(300))
  .pipe(filter((query) => query.length > 2))
  .pipe(
    switchMap((query) =>
      fromPromise(
        fetch(`/api/search?q=${query}`).then(
          (r) =>
            r.json() as Promise<
              readonly Readonly<{ id: string; name: string }>[]
            >,
        ),
      ),
    ),
  )
  .pipe(filter((res) => Result.isOk(res)))
  .pipe(map((res) => Result.unwrapOk(res)))
  .pipe(withInitialValue([]));

const SearchBox = (): React.JSX.Element => {
  const searchResults = useObservableValue(searchResults$);

  return (
    <div>
      <input
        placeholder={'Search...'}
        onChange={(e) => {
          setSearchState(e.target.value);
        }}
      />
      <ul>
        {searchResults.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(SearchBox);

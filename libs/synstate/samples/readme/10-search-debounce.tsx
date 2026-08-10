// embed-sample-code-ignore-above

import type * as React from 'react';
import {
  createState,
  debounce,
  filter,
  fromAbortablePromise,
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
  .pipe(debounce(300))
  .pipe(filter((query) => query.length > 2))
  .pipe(
    switchMap((query) =>
      fromAbortablePromise((signal) =>
        fetch(`/api/search?q=${query}`, { signal }).then(
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

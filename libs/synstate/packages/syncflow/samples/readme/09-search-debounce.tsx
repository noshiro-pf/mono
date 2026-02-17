import * as React from 'react';
import {
  createState,
  debounceTime,
  filter,
  fromPromise,
  type Observable,
  switchMap,
} from 'syncflow';
import { Result } from 'ts-data-forge';

const [searchState, setSearchState] = createState('');

// Advanced reactive pipeline (optional feature)
const searchResults$: Observable<
  Result<readonly Readonly<{ id: string; name: string }>[], unknown>
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
  );

const SearchBox = (): React.JSX.Element => {
  const [results, setResults] = React.useState<
    readonly Readonly<{ id: string; name: string }>[]
  >([]);

  React.useEffect(() => {
    const sub = searchResults$.subscribe((result) => {
      if (Result.isOk(result)) {
        setResults(result.value);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return (
    <div>
      <input
        placeholder={'Search...'}
        onChange={(e) => {
          setSearchState(e.target.value);
        }}
      />
      <ul>
        {results.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
};

// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(SearchBox);

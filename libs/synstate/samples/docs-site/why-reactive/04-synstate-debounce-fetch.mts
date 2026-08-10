import {
  createState,
  debounce,
  fromAbortablePromise,
  skipIfNoChange,
  switchMap,
} from 'synstate';

// embed-sample-code-ignore-above
// SynState: declarative pipeline outside any component
const [query, setQuery] = createState('');

const results = query
  .pipe(debounce(300)) // wait for typing to pause
  .pipe(skipIfNoChange()) // skip if the debounced value is the same
  .pipe(
    // cancel previous fetch if a new query arrives
    switchMap((q) =>
      fromAbortablePromise((signal) =>
        fetch(`/api/search?q=${q}`, { signal }).then((r) => r.json()),
      ),
    ),
  );
// embed-sample-code-ignore-below

const noop = (..._args: readonly unknown[]): void => {};

noop(query, setQuery, results);

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}

/** @jsxImportSource synstate-dom */
// embed-sample-code-ignore-above
import {
  createState,
  debounce,
  fromAbortablePromise,
  just,
  map,
  switchMap,
  withInitialValue,
} from 'synstate';
import { constant, For, view, type JSX } from 'synstate-dom';
import { Result } from 'ts-data-forge';

type Search = Readonly<
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'done'; query: string; hits: readonly string[] }
  | { status: 'error'; query: string }
>;

const [query$, setQuery] = createState('');

// Settles 300 ms after the last keystroke; an equal query is not sent again.
const settledQuery$ = query$
  .pipe(debounce(300))
  .pipe(withInitialValue(''))
  .pipe(map((q) => q.trim()));

// `switchMap` completes the previous request when a newer query arrives, and
// completing it aborts its `AbortSignal`.
const search$ = settledQuery$
  .pipe(
    switchMap((query) =>
      query === ''
        ? just<Search>({ status: 'idle' })
        : fromAbortablePromise((signal) => searchFruits(query, signal))
            .pipe(
              map((result): Search =>
                Result.isOk(result)
                  ? { status: 'done', query, hits: result.value }
                  : { status: 'error', query },
              ),
            )
            // shown in the same update that sends the request
            .pipe(withInitialValue<Search>({ status: 'loading', query })),
    ),
  )
  .pipe(withInitialValue<Search>({ status: 'idle' }));

const hits$ = search$.pipe(map((s) => (s.status === 'done' ? s.hits : [])));

export const SearchDemo = (): JSX.Element => (
  <div>
    <label class={constant('row')}>
      <span class={constant('label')}>{constant('Fruit:')}</span>
      <input
        class={constant('input')}
        placeholder={constant('Type "an" or "berry"')}
        value={query$}
        onInput={(event) => {
          setQuery(event.currentTarget.value);
        }}
      />
    </label>
    <p class={constant('status')}>{view(search$, describe)}</p>
    <ul class={constant('list')}>
      <For items={hits$} key={(fruit) => fruit}>
        {(fruit$) => <li>{fruit$}</li>}
      </For>
    </ul>
  </div>
);

const describe = (search: Search): string => {
  switch (search.status) {
    case 'idle':
      return 'Type to search.';

    case 'loading':
      return `Searching for "${search.query}"…`;

    case 'done':
      return `${search.hits.length} results for "${search.query}"`;

    case 'error':
      return `The search for "${search.query}" failed.`;
  }
};
// embed-sample-code-ignore-below

/** A request the demo makes up: it answers after 400 ms, unless aborted. */
const searchFruits = (
  query: string,
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- a DOM class; `fromAbortablePromise` hands it over as is
  signal: AbortSignal,
): Promise<readonly string[]> =>
  new Promise((resolve, reject) => {
    const timerId = setTimeout(() => {
      resolve(fruits.filter((fruit) => fruit.includes(query.toLowerCase())));
    }, 400);

    signal.addEventListener('abort', () => {
      clearTimeout(timerId);

      reject(new DOMException('aborted', 'AbortError'));
    });
  });

const fruits = [
  'apple',
  'apricot',
  'banana',
  'blackberry',
  'blueberry',
  'cherry',
  'coconut',
  'cranberry',
  'grape',
  'grapefruit',
  'guava',
  'kiwi',
  'lemon',
  'lime',
  'mango',
  'melon',
  'orange',
  'papaya',
  'peach',
  'pear',
  'pineapple',
  'plum',
  'raspberry',
  'strawberry',
  'tangerine',
  'watermelon',
] as const;

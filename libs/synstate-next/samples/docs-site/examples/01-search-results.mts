import {
  createState,
  debounce,
  filter,
  fromAbortablePromise,
  just,
  map,
  switchMap,
  withInitialValue,
  type InitializedObservable,
} from 'synstate-next';
import { Result } from 'ts-std-forge';

// embed-sample-code-ignore-below
// cspell:ignore unstub
if (import.meta.vitest !== undefined) {
  test('search results', async () => {
    vi.useFakeTimers();

    const mut_aborted: string[] = [];

    vi.stubGlobal(
      'fetch',
      async (
        url: string,
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- listened on
        init: Readonly<{ signal: AbortSignal }>,
      ) =>
        new Promise<Response>((resolve, reject) => {
          const parsed = new URL(url, 'https://example.com');

          const q = parsed.searchParams.get('q') ?? '';

          let mut_answered = false;

          const id = setTimeout(() => {
            mut_answered = true;

            resolve(Response.json([{ id: '1', name: q }]));
          }, 500);

          init.signal.addEventListener('abort', () => {
            // Only an abort before the answer is recorded: this stub's body is in
            // memory, so a later abort has nothing to cancel.
            if (mut_answered) {
              return;
            }

            clearTimeout(id);

            mut_aborted.push(q);

            reject(new Error('aborted'));
          });
        }),
    );

    try {
      // embed-sample-code-ignore-above
      type Item = Readonly<{ id: string; name: string }>;

      const [query, setQuery] = createState('');

      const responses = query.pipe(
        debounce(300),
        // A query too short to search follows an empty answer, which also
        // disposes the request in flight.
        switchMap((q) =>
          q.length <= 2
            ? just(Result.ok<readonly Item[]>([]))
            : fromAbortablePromise(async (signal) => {
                const params = new URLSearchParams({ q });

                return fetch(`/api/search?${params.toString()}`, {
                  signal,
                }).then(
                  async (r) =>
                    /* embed-sample-code-ignore-this-line */ /* eslint-disable-next-line total-functions/no-unsafe-type-assertion */ // @ts-expect-error `Response.json()` is `MutableJsonValue` under the strict standard library, whose arrays are mutable, so a cast to a readonly array is not one TypeScript accepts. The cast is still what a reader would write; this line is stripped from the embedded output.
                    r.json() as Promise<readonly Item[]>,
                );
              }),
        ),
      );

      const results: InitializedObservable<readonly Item[]> = responses.pipe(
        // A failed request leaves the results as they were.
        filter(Result.isOk),
        map((result) => result.value),
        // The empty query has answered `[]` already, but `switchMap`'s type
        // says it may hold nothing: name the list it starts with.
        withInitialValue<readonly Item[]>([]),
      );

      // embed-sample-code-ignore-below

      assert.deepStrictEqual(results.value, []);

      setQuery('syn');

      await vi.advanceTimersByTimeAsync(800);

      assert.deepStrictEqual(results.value, [{ id: '1', name: 'syn' }]);

      setQuery('sync');

      // The request for 'sync' is in flight when the query gets too short.
      await vi.advanceTimersByTimeAsync(400);

      setQuery('sy');

      await vi.advanceTimersByTimeAsync(1000);

      assert.deepStrictEqual(mut_aborted, ['sync']);

      assert.deepStrictEqual(results.value, []);
    } finally {
      vi.unstubAllGlobals();

      vi.useRealTimers();
    }
  });
}

import {
  createState,
  debounce,
  fromAbortablePromise,
  just,
  switchMap,
} from 'synstate-next';
import { Result } from 'ts-std-forge';

// embed-sample-code-ignore-below
// cspell:ignore unstub
if (import.meta.vitest !== undefined) {
  test('debounce, then fetch, cancelling the previous request', async () => {
    vi.useFakeTimers();

    const mut_requested: string[] = [];

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

          const q = parsed.searchParams.get('q');

          mut_requested.push(q ?? '');

          let mut_answered = false;

          const id = setTimeout(() => {
            mut_answered = true;

            resolve(Response.json([`${q}-1`, `${q}-2`]));
          }, 500);

          init.signal.addEventListener('abort', () => {
            // Only an abort before the answer is recorded: this stub's body is in
            // memory, so a later abort has nothing to cancel.
            if (mut_answered) {
              return;
            }

            clearTimeout(id);

            mut_aborted.push(q ?? '');

            reject(new Error('aborted'));
          });
        }),
    );

    try {
      // embed-sample-code-ignore-above
      const [query, setQuery] = createState('');

      const results = query.pipe(
        // Wait for typing to pause.
        debounce(300),
        // A new query disposes the previous request, which aborts it; so does
        // clearing the box, which follows an empty answer instead.
        switchMap((q) =>
          q.trim() === ''
            ? just(Result.ok<readonly string[]>([]))
            : fromAbortablePromise(async (signal) => {
                const params = new URLSearchParams({ q });

                return fetch(`/api/search?${params.toString()}`, {
                  signal,
                }).then(
                  async (r) =>
                    /* embed-sample-code-ignore-this-line */ // eslint-disable-next-line total-functions/no-unsafe-type-assertion -- `Response.json()` is untyped; the cast is what a reader would write, and this line is stripped from the embedded output.
                    r.json() as Promise<readonly string[]>,
                );
              }),
        ),
      );

      // embed-sample-code-ignore-below

      const mut_seen: (readonly string[])[] = [];

      results.subscribe((result) => {
        if (Result.isOk(result)) {
          mut_seen.push(result.value);
        }
      });

      setQuery('s');

      await vi.advanceTimersByTimeAsync(100);

      setQuery('sy');

      await vi.advanceTimersByTimeAsync(320);

      setQuery('syn');

      await vi.advanceTimersByTimeAsync(1000);

      assert.deepStrictEqual(mut_requested, ['sy', 'syn']);

      assert.deepStrictEqual(mut_aborted, ['sy']);

      // The empty box answered first, with no request.
      assert.deepStrictEqual(mut_seen, [[], ['syn-1', 'syn-2']]);

      setQuery('sync');

      await vi.advanceTimersByTimeAsync(320);

      setQuery('');

      await vi.advanceTimersByTimeAsync(1000);

      assert.deepStrictEqual(mut_aborted, ['sy', 'sync']);

      assert.deepStrictEqual(mut_seen, [[], ['syn-1', 'syn-2'], []]);
    } finally {
      vi.unstubAllGlobals();

      vi.useRealTimers();
    }
  });
}

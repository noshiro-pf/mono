// cspell:ignore unstub
/**
 * The behavior every implementation on the "Async Logic Compared" page shares,
 * as one test suite each sample runs against itself. The page compares how the
 * code reads; this suite is what makes it a comparison of equals.
 */
import { debounceMs, type Item, type SearchState } from './00-search-api.mjs';

export const testSearch = (
  libraryName: string,
  createHandle: () => SearchHandle,
): void => {
  // Every case runs twice: against `fetch`, whose aborted request rejects, and
  // against a promise API that ignores its signal and answers anyway.
  describe.each([
    { honorsAbort: true, against: 'fetch' },
    { honorsAbort: false, against: 'a promise API that ignores its signal' },
  ])(`search box (${libraryName}, against $against)`, ({ honorsAbort }) => {
    /**
     * Runs `body` against a fresh handle, with fake timers and a fake `fetch`,
     * and disposes of all three however it ends.
     */
    const withSearch =
      (body: (context: SearchContext) => Promise<void>) =>
      async (): Promise<void> => {
        vi.useFakeTimers();

        let mut_handle: SearchHandle | undefined;

        try {
          const requests = installFakeFetch({ honorsAbort });

          const handle = createHandle();

          mut_handle = handle;

          await body({
            handle,
            requestCount: () => requests.length,
            request: (index) => {
              const r = requests[index];

              if (r === undefined) {
                throw new Error(`request ${index} was never sent`);
              }

              return r;
            },
          });
        } finally {
          try {
            mut_handle?.dispose();
          } finally {
            vi.unstubAllGlobals();

            vi.useRealTimers();
          }
        }
      };

    test(
      'starts idle and sends nothing',
      withSearch(async ({ handle, requestCount }) => {
        await vi.advanceTimersByTimeAsync(debounceMs * 2);

        assert.deepStrictEqual(handle.getState(), { status: 'idle' });

        assert.strictEqual(requestCount(), 0);
      }),
    );

    test(
      'waits for typing to pause, then sends one request',
      withSearch(async ({ handle, request, requestCount }) => {
        handle.setQuery('s');

        await vi.advanceTimersByTimeAsync(debounceMs - 100);

        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs - 1);

        assert.strictEqual(requestCount(), 0);

        assert.deepStrictEqual(handle.getState(), { status: 'idle' });

        await vi.advanceTimersByTimeAsync(1);

        assert.strictEqual(requestCount(), 1);

        assert.strictEqual(request(0).query, 'syn');

        assert.deepStrictEqual(handle.getState(), {
          status: 'loading',
          query: 'syn',
        });

        request(0).respond(200, items);

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), {
          status: 'success',
          query: 'syn',
          items,
        });
      }),
    );

    test(
      'restarts the wait on a keystroke that only adds a space',
      withSearch(async ({ handle, requestCount }) => {
        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs - 100);

        handle.setQuery('syn ');

        await vi.advanceTimersByTimeAsync(debounceMs - 1);

        assert.strictEqual(requestCount(), 0);

        await vi.advanceTimersByTimeAsync(1);

        assert.strictEqual(requestCount(), 1);
      }),
    );

    test(
      'shows nothing a replaced request returns, even if it answers',
      withSearch(async ({ handle, request }) => {
        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs);

        handle.setQuery('synstate');

        await vi.advanceTimersByTimeAsync(debounceMs);

        assert.isTrue(request(0).signal.aborted);

        request(0).respond(200, [{ id: '0', title: 'stale' }]);

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), {
          status: 'loading',
          query: 'synstate',
        });

        request(1).respond(200, items);

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), {
          status: 'success',
          query: 'synstate',
          items,
        });
      }),
    );

    test(
      'keeps the request in flight when typing returns to its query',
      withSearch(async ({ handle, request, requestCount }) => {
        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs);

        handle.setQuery('sync');

        await vi.advanceTimersByTimeAsync(debounceMs - 100);

        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs);

        assert.strictEqual(requestCount(), 1);

        assert.isFalse(request(0).signal.aborted);

        request(0).respond(200, items);

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), {
          status: 'success',
          query: 'syn',
          items,
        });
      }),
    );

    test(
      'aborts the request a newer query replaces',
      withSearch(async ({ handle, request, requestCount }) => {
        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs);

        handle.setQuery('synstate');

        await vi.advanceTimersByTimeAsync(debounceMs);

        assert.strictEqual(requestCount(), 2);

        assert.isTrue(request(0).signal.aborted);

        assert.isFalse(request(1).signal.aborted);

        assert.deepStrictEqual(handle.getState(), {
          status: 'loading',
          query: 'synstate',
        });

        request(1).respond(200, items);

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), {
          status: 'success',
          query: 'synstate',
          items,
        });
      }),
    );

    test(
      'reports an HTTP error and recovers on the next query',
      withSearch(async ({ handle, request }) => {
        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs);

        request(0).respond(500, 'Internal Server Error');

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), {
          status: 'error',
          query: 'syn',
          message: 'HTTP 500',
        });

        handle.setQuery('synstate');

        await vi.advanceTimersByTimeAsync(debounceMs);

        request(1).respond(200, items);

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), {
          status: 'success',
          query: 'synstate',
          items,
        });
      }),
    );

    test(
      'reports a network error and a malformed body',
      withSearch(async ({ handle, request }) => {
        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs);

        request(0).fail(new TypeError('Failed to fetch'));

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), {
          status: 'error',
          query: 'syn',
          message: 'Failed to fetch',
        });

        handle.setQuery('synstate');

        await vi.advanceTimersByTimeAsync(debounceMs);

        request(1).respond(200, { items });

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), {
          status: 'error',
          query: 'synstate',
          message: 'Unexpected response body',
        });
      }),
    );

    test(
      'a blank query returns to idle and aborts the request',
      withSearch(async ({ handle, request, requestCount }) => {
        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs);

        handle.setQuery(' '.repeat(3));

        await vi.advanceTimersByTimeAsync(debounceMs);

        assert.isTrue(request(0).signal.aborted);

        assert.strictEqual(requestCount(), 1);

        assert.deepStrictEqual(handle.getState(), { status: 'idle' });

        request(0).respond(200, items);

        await vi.advanceTimersByTimeAsync(0);

        assert.deepStrictEqual(handle.getState(), { status: 'idle' });
      }),
    );

    test(
      'does not send the same query twice in a row',
      withSearch(async ({ handle, request, requestCount }) => {
        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs);

        request(0).respond(200, items);

        await vi.advanceTimersByTimeAsync(0);

        // Typed and deleted before the pause, and padded: still "syn".
        handle.setQuery('sync');

        handle.setQuery('syn ');

        await vi.advanceTimersByTimeAsync(debounceMs);

        assert.strictEqual(requestCount(), 1);

        assert.deepStrictEqual(handle.getState(), {
          status: 'success',
          query: 'syn',
          items,
        });
      }),
    );

    test(
      'dispose aborts the request in flight and sends nothing more',
      withSearch(async ({ handle, request, requestCount }) => {
        handle.setQuery('syn');

        await vi.advanceTimersByTimeAsync(debounceMs);

        handle.setQuery('synstate');

        handle.dispose();

        assert.isTrue(request(0).signal.aborted);

        await vi.advanceTimersByTimeAsync(debounceMs * 2);

        assert.strictEqual(requestCount(), 1);

        request(0).respond(200, items);

        await vi.advanceTimersByTimeAsync(0);

        // Left as it was: neither the abort, nor the dropped query, nor an
        // answer to the aborted request shows.
        assert.deepStrictEqual(handle.getState(), {
          status: 'loading',
          query: 'syn',
        });
      }),
    );
  });
};

type SearchContext = Readonly<{
  handle: SearchHandle;
  request: (index: number) => FakeRequest;
  requestCount: () => number;
}>;

type FakeFetchOptions = Readonly<{
  /**
   * `false` stands for a promise API that takes a signal and does not honour
   * it: an aborted request can still be answered.
   */
  honorsAbort: boolean;
}>;

type FakeRequest = Readonly<{
  query: string | null;
  signal: AbortSignal;
  respond: (statusCode: number, body: unknown) => void;
  fail: (error: Readonly<Error>) => void;
}>;

/** What a sample hands the suite, whatever its own API looks like. */
export type SearchHandle = Readonly<{
  setQuery: (query: string) => void;
  getState: () => SearchState;
  dispose: () => void;
}>;

const items: readonly Item[] = [
  { id: '1', title: 'SynState' },
  { id: '2', title: 'SynState DOM' },
] as const;

const queryOf = (input: Readonly<URL> | string): string | null => {
  const url = new URL(input, 'https://example.com');

  return url.searchParams.get('q');
};

/**
 * Replaces `fetch` with one whose responses the test sends by hand. Like the
 * real one, it rejects with the signal's `reason` once its signal is aborted.
 */
const installFakeFetch = (
  options?: FakeFetchOptions,
): readonly FakeRequest[] => {
  const mut_requests: FakeRequest[] = [];

  vi.stubGlobal(
    'fetch',
    (
      input: Readonly<URL> | string,
      init?: Readonly<{ signal?: Readonly<AbortSignal> | null }>,
    ): Promise<Response> =>
      new Promise((resolve, reject) => {
        // A request sent without a signal is never aborted.
        const signal = init?.signal ?? AbortSignal.any([]);

        const abort = (): void => {
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- `fetch` rejects with the reason as given, Error or not.
          reject(signal.reason);
        };

        if (signal.aborted) {
          abort();

          return;
        }

        if (options?.honorsAbort ?? true) {
          signal.addEventListener('abort', abort);
        }

        mut_requests.push({
          query: queryOf(input),
          signal,
          respond: (statusCode, body) => {
            resolve(Response.json(body, { status: statusCode }));
          },
          fail: reject,
        });
      }),
  );

  return mut_requests;
};

if (import.meta.vitest !== undefined) {
  test('the fake fetch rejects an aborted request with the reason', async () => {
    const requests = installFakeFetch();

    try {
      const controller = new AbortController();

      const response = fetch('/api/search?q=syn', {
        signal: controller.signal,
      });

      assert.strictEqual(requests[0]?.query, 'syn');

      controller.abort();

      await expect(response).rejects.toThrow('This operation was aborted');
    } finally {
      vi.unstubAllGlobals();
    }
  });
}

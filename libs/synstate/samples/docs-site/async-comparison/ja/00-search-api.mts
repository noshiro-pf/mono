import { Arr, isRecord, isString } from 'ts-data-forge';

// embed-sample-code-ignore-above
export type Item = Readonly<{ id: string; title: string }>;

/** 検索ボックスが表示するもの。このページのすべての実装がこれを生成する。 */
export type SearchState = Readonly<
  | { status: 'idle' }
  | { status: 'loading'; query: string }
  | { status: 'success'; query: string; items: readonly Item[] }
  | { status: 'error'; query: string; message: string }
>;

export const idleState: SearchState = { status: 'idle' } as const;

export const debounceMs = 300;

export const searchUrl = (query: string): string => {
  const params = new URLSearchParams({ q: query });

  return `/api/search?${params.toString()}`;
};

/** 2xx 以外のステータスと、アイテムの配列でないボディで reject する。 */
export const parseResponse = async (
  response: Response,
): Promise<readonly Item[]> => {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const body: unknown = await response.json();

  if (!Arr.isArray(body) || !body.every(isItem)) {
    throw new TypeError('Unexpected response body');
  }

  return body;
};

/** `signal` が中断されると `fetch` は `AbortError` で reject する。 */
export const fetchItems = (
  query: string,
  /* embed-sample-code-ignore-this-line */ // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types -- `fetch` takes a mutable `AbortSignal`.
  signal: AbortSignal,
): Promise<readonly Item[]> =>
  fetch(searchUrl(query), { signal }).then(parseResponse);

export const toErrorMessage = (error: unknown): string =>
  isRecord(error) && isString(error['message'])
    ? error['message']
    : 'Unknown error';

const isItem = (u: unknown): u is Item =>
  isRecord(u) && isString(u['id']) && isString(u['title']);
// embed-sample-code-ignore-below

if (import.meta.vitest !== undefined) {
  describe('parseResponse', () => {
    test('returns the items of a 2xx response', async () => {
      const items = await parseResponse(
        Response.json([{ id: '1', title: 'SynState' }]),
      );

      assert.deepStrictEqual(items, [{ id: '1', title: 'SynState' }]);
    });

    test('rejects a non-2xx status', async () => {
      await expect(
        parseResponse(Response.json([], { status: 503 })),
      ).rejects.toThrow('HTTP 503');
    });

    test('rejects a body that is not a list of items', async () => {
      await expect(parseResponse(Response.json({ items: [] }))).rejects.toThrow(
        'Unexpected response body',
      );
    });
  });

  test('searchUrl encodes the query', () => {
    assert.strictEqual(searchUrl('a&b c'), '/api/search?q=a%26b+c');
  });
}

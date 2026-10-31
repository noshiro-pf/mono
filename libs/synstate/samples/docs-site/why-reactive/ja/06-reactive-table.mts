/* eslint-disable total-functions/no-partial-division */
/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable @stylistic/padding-line-between-statements */
// embed-sample-code-ignore-above

import {
  combine,
  createState,
  createValueEmitter,
  debounce,
  derive,
  fromPromise,
  map,
  mapTo,
  merge,
} from 'synstate';
import { Result } from 'ts-data-forge';

// embed-sample-code-ignore-below
const mut_shown = { rows: [] as readonly Row[] };
const renderTable = (rows: readonly Row[]): void => {
  mut_shown.rows = rows;
};
const renderError = (_error: unknown): void => {};
const serverRows: readonly Row[] = Array.from({ length: 25 }, (_, i) => ({
  name: i % 2 === 0 ? `Ann ${i}` : `Bob ${i}`,
  email: `user${i}@example.com`,
  gender: i % 3 === 0 ? 'female' : 'male',
}));
// The server the sample talks to: 25 rows `user0` … `user24`. The visible code
// calls `fetch` as it would in a browser; this stands in for it.
// eslint-disable-next-line @typescript-eslint/no-shadow
const fetch = (_url: string): Promise<Response> =>
  Promise.resolve(Response.json(serverRows));
// embed-sample-code-ignore-above

// ソース状態 — 各入力は独立した Observable
const [filterName, setFilterName] = createState('');
const [filterEmail, setFilterEmail] = createState('');
const [filterGender, setFilterGender] = createState('');
const [itemsPerPage, setItemsPerPage] = createState(10);

// ページ指定はイベント： リセット後に同じページ 2 をもう一度指定しても表に届く
// 必要がある（state だと保持している値と等しいとして捨てられる）
const [pageRequest, requestPage] = createValueEmitter<number>();

// サーバーからテーブルデータを取得
// fromPromise は成功時に Result.Ok(rows)、失敗時に Result.Err(error) を発行
const tableDataResult = fromPromise(
  fetch('/api/rows').then((r) => {
    if (!r.ok) {
      throw new Error(`HTTP ${r.status}`);
    }
    /* embed-sample-code-ignore-this-line */ /* eslint-disable-next-line total-functions/no-unsafe-type-assertion */ // @ts-expect-error `Response.json()` is `MutableJsonValue` under the strict standard library, whose arrays are mutable, so a cast to a readonly array is not one TypeScript accepts. The cast is still what a reader would write; this line is stripped from the embedded output.
    return r.json() as Promise<readonly Row[]>;
  }),
);

// 派生： デバウンスされたフィルター → フィルタ結果（データ取得成功時のみ）
const headerValues = combine([filterName, filterEmail, filterGender]).pipe(
  debounce(300),
);

const filteredRows = derive(
  [headerValues, tableDataResult],
  (filters, result) =>
    Result.isErr(result)
      ? [] // エラー時は空テーブルを表示
      : result.value.filter(
          (row) =>
            row.name.includes(filters[0]) &&
            row.email.includes(filters[1]) &&
            row.gender.includes(filters[2]),
        ),
);

// エラー状態も派生値 — 別のミュータブル変数は不要
const fetchError = tableDataResult.pipe(
  map((result) => (Result.isErr(result) ? result.value : undefined)),
);

// 派生： ページ数
const pageLength = derive([filteredRows, itemsPerPage], (rows, perPage) =>
  Math.ceil(rows.length / perPage),
);

// 行（デバウンス後のフィルター、データ）かページサイズが変わったらページを 1 にリセット
const pageReset = merge([filteredRows, itemsPerPage]).pipe(mapTo(1));

// 派生： 現在のページ — 最新の指定またはリセットを、ページ数の範囲にクランプ
const currentPage = derive(
  [merge([pageRequest, pageReset]), pageLength],
  (page, maxPage) => Math.max(1, Math.min(page, maxPage)),
);

// 出力： 表示するテーブル行
const tableSliced = derive(
  [filteredRows, currentPage, itemsPerPage],
  (rows, page, perPage) => {
    const start = (page - 1) * perPage;
    return rows.slice(start, start + perPage);
  },
);

// subscribe で描画 — 依存が変化すると自動的に呼ばれる
tableSliced.subscribe(renderTable);

// エラーを subscribe — エラー状態が変化したときのみ renderError が呼ばれる
fetchError.subscribe((err) => {
  renderError(err);
});
// embed-sample-code-ignore-below

type Row = Readonly<{
  name: string;
  email: string;
  gender: string;
}>;

if (import.meta.vitest !== undefined) {
  const settle = async (): Promise<void> => {
    await vi.advanceTimersByTimeAsync(300);
  };

  /**
   * Runs `body` from page 1 of all 25 rows, 10 per page, on fake timers.
   * Vitest does not isolate this package's test files, so the timers go back to
   * real ones whatever `body` does.
   */
  const fromPage1 =
    (body: () => Promise<void> | undefined) => async (): Promise<void> => {
      vi.useFakeTimers();

      try {
        setFilterName('');
        setFilterEmail('');
        setFilterGender('');
        setItemsPerPage(10);
        await settle();
        requestPage(1);

        await body();
      } finally {
        // A debounce a failed test left pending would otherwise never fire.
        await vi.runOnlyPendingTimersAsync();

        vi.useRealTimers();
      }
    };

  const shownEmails = (): readonly string[] =>
    mut_shown.rows.map((row) => row.email);

  describe('reactive data table', () => {
    // First, before any test requests a page.
    test('renders page 1 once the rows arrive, with no page requested', () => {
      assert.deepStrictEqual(
        shownEmails(),
        Array.from({ length: 10 }, (_, i) => `user${i}@example.com`),
      );
    });

    test(
      'a requested page is clamped to the page count',
      fromPage1(() => {
        requestPage(3);

        assert.deepStrictEqual(
          shownEmails(),
          Array.from({ length: 5 }, (_, i) => `user${20 + i}@example.com`),
        );

        requestPage(2);

        requestPage(9);

        assert.strictEqual(shownEmails()[0], 'user20@example.com');

        requestPage(0);

        assert.strictEqual(shownEmails()[0], 'user0@example.com');
      }),
    );

    test(
      'a filter change resets the page even when the page count stays',
      fromPage1(async () => {
        requestPage(2);

        // 'e' is in every e-mail address: the rows, and so the page count, stay.
        setFilterEmail('e');

        assert.strictEqual(shownEmails()[0], 'user10@example.com');

        await settle();

        assert.strictEqual(shownEmails()[0], 'user0@example.com');
      }),
    );

    test(
      'a filter change resets the page when the page count changes',
      fromPage1(async () => {
        requestPage(2);

        // 13 rows: 2 pages.
        setFilterName('Ann');

        await settle();

        assert.strictEqual(shownEmails()[0], 'user0@example.com');
      }),
    );

    test(
      'a page size change resets the page',
      fromPage1(() => {
        requestPage(2);

        setItemsPerPage(5);

        assert.deepStrictEqual(
          shownEmails(),
          Array.from({ length: 5 }, (_, i) => `user${i}@example.com`),
        );
      }),
    );

    test(
      'the page held before a reset can be requested again',
      fromPage1(async () => {
        requestPage(2);

        // 'female' contains 'male': every row stays.
        setFilterGender('male');

        await settle();

        assert.strictEqual(shownEmails()[0], 'user0@example.com');

        requestPage(2);

        assert.strictEqual(shownEmails()[0], 'user10@example.com');
      }),
    );
  });
}

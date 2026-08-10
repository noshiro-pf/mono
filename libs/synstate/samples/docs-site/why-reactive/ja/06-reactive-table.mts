/* eslint-disable total-functions/no-partial-division */
/* eslint-disable unicorn/prefer-top-level-await */
/* eslint-disable @stylistic/padding-line-between-statements */
// embed-sample-code-ignore-above

import {
  combine,
  createState,
  debounce,
  fromPromise,
  map,
  mapTo,
  merge,
} from 'synstate';
import { Result } from 'ts-data-forge';

/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ const renderTable = (_rows: readonly Row[]): void => {};
/* embed-sample-code-ignore-this-line */ // prettier-ignore
/* embed-sample-code-ignore-this-line */ const renderError = (_error: unknown): void => {};

// ソース状態 — 各入力は独立した Observable
const [filterName, setFilterName] = createState('');
const [filterEmail, setFilterEmail] = createState('');
const [filterGender, setFilterGender] = createState('');
const [itemsPerPage, setItemsPerPage] = createState(10);
const [pageInput, setPageInput] = createState(1);

// サーバーからテーブルデータを取得
// fromPromise は成功時に Result.Ok(rows)、失敗時に Result.Err(error) を発行
const tableDataResult = fromPromise(
  fetch('/api/rows').then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json() as Promise<readonly Row[]>;
  }),
);

// 派生： デバウンスされたフィルター → フィルタ結果（データ取得成功時のみ）
const headerValues = combine([filterName, filterEmail, filterGender]).pipe(
  debounce(300),
);

const filteredRows = combine([headerValues, tableDataResult]).pipe(
  map(([filters, result]) =>
    Result.isErr(result)
      ? [] // エラー時は空テーブルを表示
      : result.value.filter(
          (row) =>
            row.name.includes(filters[0]) &&
            row.email.includes(filters[1]) &&
            row.gender.includes(filters[2]),
        ),
  ),
);

// エラー状態も派生値 — 別のミュータブル変数は不要
const fetchError = tableDataResult.pipe(
  map((result) => (Result.isErr(result) ? result.value : undefined)),
);

// 派生： ページ数
const pageLength = combine([filteredRows, itemsPerPage]).pipe(
  map(([rows, perPage]) => Math.ceil(rows.length / perPage)),
);

// pageLength が変わったらページを1にリセット
const pageReset = pageLength.pipe(mapTo(1));

// 派生： 現在のページ — ユーザー入力と自動リセットを merge し、クランプ
const currentPage = merge([
  pageReset,
  combine([pageInput, pageLength]).pipe(
    map(([page, maxPage]) => Math.max(1, Math.min(page, maxPage))),
  ),
]);

// 出力： 表示するテーブル行
const tableSliced = combine([filteredRows, currentPage, itemsPerPage]).pipe(
  map(([rows, page, perPage]) => {
    const start = (page - 1) * perPage;
    return rows.slice(start, start + perPage);
  }),
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

const noop = (..._args: readonly unknown[]): void => {};

noop(
  setFilterName,
  setFilterEmail,
  setFilterGender,
  setItemsPerPage,
  setPageInput,
  renderTable,
  fetchError,
  pageLength,
  currentPage,
);

if (import.meta.vitest !== undefined) {
  test('dummy', () => {
    assert.isTrue(true);
  });
}

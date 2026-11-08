---
title: 宣言的な状態管理
description: 何が何に依存するかを宣言し、最新に保つのはグラフに任せる。map の連鎖から、デバウンス付きの検索、フィルター付きのデータテーブルまで。
---

synstate-next は**リアクティブプログラミング**のためのライブラリです。値同士がどう依存するかを宣言すれば、どれかが変わったときにライブラリが他を合わせてくれます。

## スプレッドシートのたとえ

スプレッドシートでセル A1 を変えると、A1 を参照するセルはすべて計算し直されます。B1 や C1 を手で計算し直すことはありません。スプレッドシートが依存関係と、それを辿る順序を知っているからです。リアクティブプログラミングは、これをアプリケーションのコードに持ち込みます。何かが変わったときにどの変数を更新すべきかを覚えておく代わりに、依存関係を一度だけ宣言します。

## もう知っているパターン

React の `useMemo` は、他の値に依存する値を宣言します。

```text
const [count, setCount] = React.useState(0);
const doubled = React.useMemo(() => count * 2, [count]);
const quadrupled = React.useMemo(() => doubled * 2, [doubled]);
```

同じものを synstate-next で書くとこうなります。

```tsx
import { createState, map } from 'synstate-next';

const [count, setCount] = createState(0);

const doubled = count.pipe(map((n) => n * 2));

const quadrupled = doubled.pipe(map((n) => n * 2));

setCount(3);

assert.strictEqual(quadrupled.value, 12);
```

考え方は同じですが、仕組みは違います。React はコンポーネントを再実行し、並べた依存が変わっていなければメモ化した結果を使います。synstate-next は、書き込まれた状態から、それに依存する値にだけ変化を押し出し、それ以外は何も実行しません。

|                        | React `useMemo`                          | synstate-next                            |
| :--------------------- | :--------------------------------------- | :--------------------------------------- |
| **更新のモデル**       | 再レンダリングし、メモ化したものを再利用 | プッシュ型。変化に依存するものだけが動く |
| **範囲**               | 1 つのコンポーネント                     | アプリケーション全体                     |
| **非同期オペレーター** | なし                                     | `debounce`・`throttle`・`switchMap` など |
| **寿命**               | コンポーネント                           | 作ったときの owner                       |

## 非同期の振る舞いを正確に制御する

検索ボックスをデバウンスして最新のクエリだけを取得するには、React のコンポーネントではタイマー、`AbortController`、effect とそのクリーンアップが要り、そのどれもが競合や古いクロージャの原因になりえます。パイプラインにすれば、関心事の 1 つ 1 つが 1 つのオペレーターです。

```tsx
import {
    createState,
    debounce,
    fromAbortablePromise,
    just,
    switchMap,
} from 'synstate-next';
import { Result } from 'ts-std-forge';

const [query, setQuery] = createState('');

const results = query
    // Wait for typing to pause.
    .pipe(debounce(300))
    .pipe(
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
                          async (r) => r.json() as Promise<readonly string[]>,
                      );
                  }),
        ),
    );
```

`fromAbortablePromise` は `fetch` に `AbortSignal` を渡します。新しいクエリが来ると、`switchMap` はそれまで追っていたリクエストを破棄し、それによってリクエストが中断されます。古い応答が新しい応答を上書きすることはありません。空の入力欄も他と同じ 1 つの値です。すでに手元にある答えである `just` を追うので、リクエストは送らず、それでも実行中のリクエストは破棄します。`switchMap` の前で `filter` で落とすと、そのリクエストが走り続け、その応答がもう空になった入力欄の結果を埋めてしまいます。

## 動機となる例: フィルター付きのデータテーブル

列ごとのテキストフィルター、1 ページあたりの件数、ページ送りのあるテーブルを考えます。フィルターが変わると、テーブルは入力が止まるのを待ち、行を絞り込み、ページ数を数え直し、1 ページ目に戻り、そのページの行を切り出します。命令的に書くと、これは依存の順に並べ続けなければならない 1 つの `updateTable()` 関数になり、すべてのイベントハンドラーから呼ばれ、「1 ページ目に戻す」はそれぞれに繰り返され、デバウンスは横から付け足すことになります。

グラフとして宣言すると次のとおりです。

```tsx
import {
    createState,
    createValueEmitter,
    debounce,
    derive,
    fromPromise,
    map,
    merge,
} from 'synstate-next';
import { Num } from 'ts-data-forge';
import { Result } from 'ts-std-forge';

type Row = Readonly<{ name: string; email: string; gender: string }>;

// Each input is a state of its own.
const [filterName, setFilterName] = createState('');

const [filterEmail, setFilterEmail] = createState('');

const [filterGender, setFilterGender] = createState('');

const [itemsPerPage, setItemsPerPage] = createState(10);

// Asking for a page is an event: asking for page 2 again after a reset
// has to reach the table, which a state would drop as unchanged.
const [pageRequest, requestPage] = createValueEmitter<number>();

// `Result.ok(rows)` once the rows arrive, `Result.err(error)` if not.
const tableData = fromPromise(
    fetch('/api/rows').then(async (r) => {
        if (!r.ok) {
            throw new Error(`HTTP ${r.status}`);
        }

        return r.json() as Promise<readonly Row[]>;
    }),
);

const filters = derive(
    [filterName, filterEmail, filterGender],
    (name, email, gender) => [name, email, gender] as const,
).pipe(debounce(300));

const filteredRows = derive(
    [filters, tableData],
    ([name, email, gender], result) =>
        Result.isErr(result)
            ? []
            : result.value.filter(
                  (row) =>
                      row.name.includes(name) &&
                      row.email.includes(email) &&
                      row.gender.includes(gender),
              ),
);

const fetchError = tableData.pipe(
    map((result) => (Result.isErr(result) ? result.value : undefined)),
);

const pageLength = derive([filteredRows, itemsPerPage], (rows, perPage) =>
    Num.isNonZero(perPage)
        ? Math.max(1, Math.ceil(Num.div(rows.length, perPage)))
        : 1,
);

// Back to page 1 whenever the rows or the page size change. An event, so
// `equals: () => false`: a reset to 1 when 1 is held still counts.
const pageReset = merge([filteredRows, itemsPerPage]).pipe(
    map(() => 1, { equals: () => false }),
);

// The latest request or reset, clamped to the page count.
const currentPage = derive(
    [merge([pageRequest, pageReset]), pageLength],
    (page, maxPage) => Math.max(1, Math.min(page, maxPage)),
);

const tableSliced = derive(
    [filteredRows, currentPage, itemsPerPage],
    (rows, page, perPage) => {
        const start = (page - 1) * perPage;

        return rows.slice(start, start + perPage);
    },
);

// `renderTable` and `renderError` stand for the view.
// Runs once every value above is up to date, consistent with each other.
tableSliced.subscribe(renderTable);

fetchError.subscribe((error) => {
    if (error !== undefined) {
        renderError(error);
    }
});
```

- **依存がコードに書いてあります。** `pageLength` は `filteredRows` と `itemsPerPage` に依存し、そう書いてあります。
- **順序はグラフが決めます。** 読むものより先に計算されるものはありません。各ノードの深さが、親の後に来るように置きます。
- **リセットは 1 か所です。** `pageReset` が、テーブルを 1 ページ目に戻すもの、つまり新しい行（デバウンスの後、またはデータが届いたとき）と新しいページサイズを示します。リセットは、何も書き足さなくてもデバウンスを待ちます。要求したページはイベントなので、リセット前に持っていたページをもう一度要求しても、テーブルに届きます。
- **取得もエラーも値です。** `fromPromise` がサーバーの応答を `Result` としてグラフに入れ、`fetchError` は派生値の 1 つにすぎません。
- **購読者は常に一貫したテーブルを見ます。** `tableSliced` の購読者は更新のすべての値が新しくなった後で実行され、フィルター・ページ数・ページはすべて同じ更新のものです。
- **値を足すのは `derive` 1 つです。** 既存のものは何も変わりません。

## 次に読むもの

- [状態と書き込み](/mono/synstate-next/ja/guides/state-and-writes/)では、`createState`・`createReducer`・イベントエミッターを見ていきます。
- [更新の伝わり方](/mono/synstate-next/ja/internals/how-an-update-propagates/)では、上のグラフがどうやって一貫性を保つかを説明します。

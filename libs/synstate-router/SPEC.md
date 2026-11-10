# synstate-router 実装仕様

<!-- cspell:ignore Rocon Chicane Valibot ArkType typegen splat devtools -->
<!-- doc-paths-ignore: apps/tiny-router-observable -->

アプリが書く遷移先・パスパラメータ・検索パラメータをすべて型で検査し、現在地を synstate の Observable として配るクライアントサイドルーターの実装仕様。v1 の目標は「文字列で書いた URL がどこにも残らない」ことで、TanStack Router と同等以上の型安全性を、コード生成も module augmentation もなしに得る。

- 状態: 仕様 v1 確定（2026-11-02）。「11. 実装計画」の 6 のうちサンプルアプリ・e2e・synstate-docs のページまで入り、3 パッケージの 0.1.0 を npm に公開した（2026-11-04）。`event-schedule-app`・`profile` を移し終え（#3400・#3401）、tiny-router-* を削除して 6 を終えた（2026-11-05）。
- 出典: issue [#1733](https://github.com/noshiro-pf/mono/issues/1733)、[`apps/tiny-router-observable`](https://github.com/noshiro-pf/mono/tree/04646e536b68d01e9806b99ed51f7a238568e30e/apps/tiny-router-observable)（削除済み）とその不具合 [#2912](https://github.com/noshiro-pf/mono/issues/2912)・[#2954](https://github.com/noshiro-pf/mono/issues/2954)・[#2956](https://github.com/noshiro-pf/mono/issues/2956)・[#3033](https://github.com/noshiro-pf/mono/issues/3033)。

## 1. 目的と範囲

### 1.1 最優先の 2 項目

- **型安全性（AI 駆動開発のハーネス）**: 遷移先は route ノードが作る `Href` 型（branded string）しか受け付けない。`router.push('/prodcts/1')` のような手書きの文字列は型エラーになる。パラメータは文字列に限らず整数・リテラル共用体・branded 型・Standard Schema（Zod / Valibot / ArkType）で宣言し、URL から読むときに検証する。描画の分岐は全ルートの網羅を型で強制する。
- **メンテナンスの活発さ（セキュリティ）**: 依存は synstate と ts-data-forge・ts-type-forge だけにし、この monorepo の CI・Dependabot・リリース手順にそのまま乗せる。外部依存がほぼないので、追うべき上流の脆弱性が増えない。

### 1.2 パッケージ

| パッケージ              | 責任                                                                          | peer         |
| :---------------------- | :---------------------------------------------------------------------------- | :----------- |
| `synstate-router`       | ルート定義・codec・照合・`Href`・履歴・Observable・リンクのクリック判定       | synstate     |
| `synstate-router-react` | React 向けの `Routes`・`Link`・hooks。社内プロジェクトが React なので先に作る | react >= 19  |
| `synstate-router-dom`   | synstate-dom 向けの `Routes`・`Link`                                          | synstate-dom |

Preact 版は v1 に入れない（「10. 今後のタスク」）。

## 2. 決定事項

途中まで実装した以前の版（表では「archive」。その branch は残さないので、比べるのに要る当時の決定はこの表に書く）からの変更点と、2026-11-02 に確定した事項。

| 論点                  | archive での決定                                                                             | v1                                                                                                                   |
| :-------------------- | :------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| ルート定義            | オブジェクトツリー + `param` ヘルパー（Rocon・TanStack・Type Route・Chicane を比較して採用） | 引き継ぐ。`params` のないノードはキー名がセグメント（`segment` で上書き）、`params` のあるノードは動的セグメントだけ |
| 遷移先の型            | `path()` が `string` を返し、`push` と `Link to` は任意の `string` を受ける                  | **変える**。`href()` は branded の `Href` を返し、`push`・`Link` は `Href` だけを受ける                              |
| パスパラメータの型    | 常に `string`。`param.path.branded` は型だけの飾りで、実行時には検証しない                   | **変える**。codec（decode / encode）で宣言し、decode に失敗したらそのルートは一致しない                              |
| 分岐                  | `switch` では params が絞れず、pattern 文字列をキーにしたハンドラーマップに移行              | **変える**。一致結果を `route` を判別子とする判別共用体にし、`switch` でもハンドラーマップでも絞れる                 |
| prefix / exact 一致   | `match()` と `matchExact()` を両方公開                                                       | 引き継ぐ。レイアウトは prefix、葉は exact                                                                            |
| 照合の優先順位        | セグメント数で並べるだけ。`/users/new` と `/users/:userId` の優先が定義順で決まる            | **変える**。静的 > 動的の順で順位を付け、同じ形の 2 ルートは定義時にエラー                                           |
| URL エンコード        | なし。`/` を含むパラメータでパスが壊れる                                                     | **変える**。生成で encode、照合で decode                                                                             |
| 子キーと API 名の衝突 | `path`・`match` などを子ルート名に使うと壊れる                                               | **変える**。予約名を型で拒否する                                                                                     |
| 検索パラメータ        | 個別のシリアライザー。`default` 付きでも型は `T \| undefined`                                | ルートごとの search オブジェクトにまとめ、`default` があれば `T`。refine と独自の検証を持つ                          |
| `Link` の `to`        | 文字列をそのまま渡す（route と params を分けても受け側で props にならないため）              | 引き継ぐが、値は `Href`。外部 URL は `externalHref()` で明示                                                         |
| `$` suffix            | Observable プロパティに付けない                                                              | 引き継ぐ（synstate-dom の「ライブラリの props に `$` を付けない」ともそろう）                                        |
| ブラウザ依存          | `createRouter` が `window` を直接読む。SSR・ベースパスは後回し                               | **変える**。tiny-router-observable の `RouterBrowser` 注入・`createMemoryBrowser`・`basePath` を v1 から入れる       |
| 履歴の移動            | 状態の更新時期をテストで保証していない                                                       | `popstate` だけで状態を更新する（#2912 の教訓）                                                                      |
| UI 向け               | `synstate-react-router` を別パッケージで用意                                                 | `synstate-router-react` と `synstate-router-dom`。React を先にする                                                   |

2026-11-02 に確定した残りの事項:

- **tiny-router-observable**: 履歴層（`RouterBrowser`・`createMemoryBrowser`・`basePath`）を synstate-router に移し、#2912 はそこで直す。アプリを移し終えたら tiny-router を引退させる。`createMemoryBrowser` の `popstate` は同期から `setTimeout` に変わるので、移行するアプリのテストは `back()` の後に待つよう書き換える。
- **末尾スラッシュ**: 既定値は `'always'`（tiny-router と GitHub Pages に合わせる）。
- **不正な検索パラメータ**: 「ない」として扱い、URL は書き換えない。
- **遷移のブロック**: v1.1。
- **スクロール**: 遷移先に `hash` があればその要素へ、なければパスが変わったときだけ先頭へ。戻る・進むはブラウザの `scrollRestoration` に任せる（詳細は「4.2」の 6）。

## 3. ルート定義

ルートは `defineRoutes` に渡すオブジェクトツリーで定義し、アプリは pattern 文字列を一度も書かない。パラメータは「文字列 ↔ 値」の codec で宣言し、型はそこから推論する。

```ts
import { defineRoutes, param, search } from 'synstate-router';

const userId = param.refine(param.string, isUserId); // isUserId: (s: string) => s is UserId

export const routes = defineRoutes({
    home: { segment: '' },
    products: {
        search: {
            page: search.int({ default: 1 }),
            q: search.string(),
            tags: search.array(search.string()),
        },
        children: {
            new: {}, // /products/new は /products/:productId より優先
            item: {
                params: { productId: param.int },
                children: {
                    reviews: {
                        page: false,
                        children: {
                            item: { params: { reviewId: param.string } },
                        },
                    },
                },
            },
        },
    },
    sandbox: {
        params: { env: param.literal('live', 'sandbox') },
        children: { projects: {} },
    },
    users: { children: { item: { params: { userId } } } },
    settings: {},
});
```

### 3.1 ノードの規則

- `params` を持たないノードは、キー名が静的セグメントになる。`segment: 'user-profiles'` で上書きし、`segment: ''` は親と同じパス（ルートなら `/`）。
- `params` を持つノードは動的セグメント 1 つだけになり、キー名はセグメントにならない（`products.item` は `/products/:productId` で、`/products/item/:productId` ではない）。`params` のキーはちょうど 1 つで、`segment` との併用は型エラーにする（archive では複数キーが定義順に並んだセグメントになり、順序が暗黙だった）。
- どのノードもそのパスちょうどのページになる。ページを持たない中間ノードは `page: false` と書く。このノードは `RouteMatch` と網羅チェックの対象にならない。
- 子のキーには予約名（`id`・`pattern`・`href`・`match`・`matchExact`・`params`・`search`・`children`・`segment`・`page`）を使えない。キーは空にせず、`.` と `/` を含めない（`.` はルート id の区切りなので、許すと別のノードが同じ id になる）。`segment` は `/` を含めず、`.`・`..` そのものにもしない（URL のパーサーが取り除くため。`sitemap.xml` のように `.` を含むのはよい）。どれも型エラーにし、`defineRoutes` も例外を投げる。
- 同じパスの階層に動的セグメントが 2 つある、静的セグメント名が重なる、または同じパスのページが 2 つある（`segment: ''` の子と親がどちらもページ）ときは、`defineRoutes` が例外を投げる。「同じ階層」は親子関係ではなくパスで数える。`segment: ''` のノードはパスに現れないので、その子は親の兄弟と同じ階層として検査する。照合の結果が定義順に依存する形を作らせない。`segment: ''` の子を置くなら、親か子のどちらかを `page: false` にする。
- 照合は深さ優先で、各階層で静的な子を動的な子より先に試し、最初に最後まで一致したものを採る。静的な枝が深い所で失敗したら、同じ階層の動的な子に戻って試す（`users.new` と `users.item.posts` があるとき、`/users/new/posts/` は `userId = 'new'` の `users.item.posts` に一致する）。動的セグメントの decode が失敗したら（`/products/abc` で `param.int`）その枝は一致しない。どの枝も一致しなければ notFound。

### 3.2 ノードが持つ API

`routes.products.item` のように辿った各ノードは次を持つ。

| メンバー                 | 型（`routes.products.item` の場合）                                                                                             | 用途                                                                                                                              |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `id`                     | `'products.item'`                                                                                                               | 分岐の判別子。ドット区切りのキーの道のりで、リテラル型                                                                            |
| `pattern`                | `'/products/:productId'`                                                                                                        | デバッグと表示用。照合や分岐のキーには使わない                                                                                    |
| `href(params, options?)` | `(p: { productId: SafeInt }, o?: { search?: { page?: SafeInt; q?: string; tags?: readonly string[] }; hash?: string }) => Href` | 遷移先を作る唯一の手段。params がないノードは `href(options?)`                                                                    |
| `match(location)`        | `Optional<{ params: { productId: SafeInt }; search: { page: SafeInt; q: string \| undefined; tags: readonly string[] } }>`      | prefix 一致。ツリー全体で照合して決まったページがこのノードかその子孫なら Some（下記）                                            |
| `search`                 | `{ page: SearchCodec<SafeInt>; q: ...; tags: ... }`                                                                             | 宣言した search の codec。`routes.products.search.page.decode(raw)` のように、select の文字列などをルートと同じ規則で読むのに使う |
| `matchExact(location)`   | 同上                                                                                                                            | ツリー全体で照合して決まったページがこのノードなら Some                                                                           |

- `match` / `matchExact` は自分のパターンだけを見ず、`defineRoutes` が持つツリー全体で照合した結果から答える。後戻り（「3.1」）で `/users/new/posts/` が `users.item.posts` に決まったとき、`routes.users.new.match` は None になる。どのページにも一致しない URL では、どのノードも None。`router.at`・`isActive`・`Routes` の `prefix` も同じ定義に従うので、表示中のページとレイアウトや強調表示が食い違わない。
- params は祖先の分も含む（`reviews.item` は `{ productId: SafeInt; reviewId: string }`）。search は宣言したノードとその子孫が継承する。
- `Href` は `Brand<string, 'synstate-router/Href'>`（ts-type-forge）。中身はベースパスを含まないアプリ内のパス（`/products/42/`）で、`string` から `Href` へは変換できない。ベースパスを知っているのはルーターなので、`<a>` の属性には `Link` か `router.toUrl(href)` を通して書く（`Link` はベースパスを付けた URL を `href` 属性に書く）。例外は 2 つだけで、名前で意図を示す: 外部 URL の `externalHref(url)`（受け取るのは `Link` だけで、`push` は受けない）と、外から来た URL を照合してから使う `router.parseHref(url): Optional<Href>`。どちらかを受ける側は `isHref(to)`（`/` で始まるかどうか）で見分ける。バインディングの `Link` はこれが真のときだけルーターに回す。
- 生成では params を RFC 3986 の path segment 規則で encode し、照合では decode してから codec に渡す。`productId` が `'a/b'` でも 1 セグメントのまま往復する。
- `href` は各 params を encode した結果を同じ codec の decode に通し、None なら例外を投げる。`param.string` に `''` を渡す、`param.refine` の guard を満たさない値を渡すなど、型を通っても一致しない URL は作らせない。型でも防ぎたい値は refine した型（`UserId` など）で受ける。さらに、作ったパスをツリー全体で照合し直し、自分と違うルートに決まったら例外を投げる（`users.new` があるときの `routes.users.item.href({ userId: 'new' })` など）。

### 3.3 codec

```ts
type ParamCodec<T> = Readonly<{
    decode: (raw: string) => Optional<T>; // 失敗は None
    encode: (value: T) => string;
}>;
```

| 宣言                                                            | 型                                                                           | decode の規則                                                                                       |
| :-------------------------------------------------------------- | :--------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `param.string`                                                  | `string`                                                                     | 空文字は不一致                                                                                      |
| `param.int`                                                     | `SafeInt`（ts-data-forge）                                                   | 正規形だけ一致（`01`・`1.0`・`+1` は不一致）。URL が 1 つに定まる                                   |
| `param.literal('live', 'sandbox')`                              | `'live' \| 'sandbox'`                                                        | 列挙外は不一致                                                                                      |
| `param.refine(codec, guard)`                                    | guard が絞る型（`UserId` など）                                              | guard が偽なら不一致。archive の `branded` と違い、実行時にも検証される                             |
| `param.custom({ decode, encode })`                              | 任意                                                                         | 上のどれにも当てはまらないとき                                                                      |
| `search.string()` / `.int()` / `.boolean()` / `.literal([...])` | `T \| undefined`、`{ default }` 付きなら `T`（`.int()` の `T` は `SafeInt`） | 不正な値は「ない」と同じ扱い（default があればそれ）。`search.string()` の `''` は不正ではなく `''` |
| `search.array(codec)`                                           | `readonly T[]`                                                               | `?tag=a&tag=b` の繰り返しキー。archive のカンマ区切りは値に `,` を含めないのでやめる                |
| `search.schema(schema)`                                         | Standard Schema の出力型                                                     | Zod・Valibot・ArkType をそのまま渡せる。同期の検証だけを受け付ける（下記）                          |

検索パラメータもパスパラメータと同じく refine と独自の検証を持つ。

```ts
const routes = defineRoutes({
    projects: {
        search: {
            project: search.refine(search.string(), isProjectId), // ProjectId | undefined
            page: search.refine(search.int(), isPageNumber, {
                default: asPageNumber(1),
            }), // PageNumber
            tags: search.array(search.refine(search.string(), isTagId)), // readonly TagId[]
            range: search.custom({
                decode: parseDateRange,
                encode: formatDateRange,
            }), // decode: (raw: string) => Optional<DateRange>
            sort: search.schema(z.enum(['name', 'price'])), // Standard Schema
            owner: search.from(userId), // パスと同じ codec を再利用
        },
    },
});
```

- `search.refine(codec, guard, { default? })` は元の codec で decode した値に guard をかけ、型を guard の型に絞る。`default` は refine 側に置き、絞った型で書く（元の codec に default があると型エラー。default が guard を満たさない形を作らせない）。
- `search.custom({ decode, encode })` はどの組み込みにも当てはまらない形式用。decode は `Optional<T>` を返し、None が検証失敗。
- 検証に失敗した値は「ない」として扱い、default があればそれになる。配列は要素が 1 つでも失敗したら配列全体を「ない」とする（一部だけ黙って捨てると URL の意味が変わるため）。開発ビルドではルート id とキーを添えて `console.warn` する。
- パスと検索の codec は「生文字列 → `Optional<T>`」という同じ形なので、`param.refine` で作った codec を `search.from(codec, { default? })` で検索パラメータにも使える。`UserId` の検証をパスとクエリで二重に書かない。空の値（`?owner=`）は、`search.string()` 以外のすべての codec で警告なしの「ない」とする（不正な値ではなく、フォームを空にした結果なので）。
- `search.schema` の `validate` が Promise を返したら（非同期の refine を含むスキーマ）、型では止められないので、その値は「ない」として扱い、`console.error` でルート id とキーを示す。Promise を値として流したり、照合の中で例外にしたりしない。返った Promise には何もしない `catch` を付け、reject が unhandled rejection にならないようにする。
- `href` は search の値も、encode した結果を同じ codec で decode して元の値と等しいか確かめ（スカラーは `Object.is`、配列は要素ごと、それ以外は ts-data-forge の `fastDeepEqual`）、等しくなければ例外を投げる。読むと別の値になる URL を作らせない。`search.schema` は `{ encode }` を取り、出力が `string`・`number`・`boolean` のときだけ省略できる（`String(value)`）。
- `href` は default と等しい search の値を URL に書かない。キーは宣言順に並べ、同じ状態は同じ URL になる。

## 4. ルーターと状態モデル

現在地は「どのルートか」を判別子にした判別共用体の Observable として配る。`switch (m.route)` で分岐すれば `m.params` と `m.search` がそのルートの型に絞られる。

```ts
const router = createRouter(routes, {
    basePath: import.meta.env.BASE_URL, // 省略時 '/'
    browser: createMemoryBrowser('https://example.com/'), // 省略時は実際の window
    trailingSlash: 'always', // 既定値
    redirect: (m) =>
        m.route === 'settings' && !signedIn() ? routes.home.href() : undefined,
});

type M = RouteMatch<typeof routes>;
// | { route: 'home'; params: {}; search: {} }
// | { route: 'products'; params: {}; search: { page: SafeInt; q: string | undefined; tags: readonly string[] } }
// | { route: 'products.item'; params: { productId: SafeInt }; search: { ... 同上 } }
// | ...（page: false のノードは含まない）
// | { route: undefined; pathname: string } // notFound
```

### 4.1 Router のメンバー

| メンバー                                | 型                                                                                 | 備考                                                                                                                                                                                                                                                                                                                                  |
| :-------------------------------------- | :--------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `match`                                 | `InitializedObservable<RouteMatch<R>>`                                             | route・params・search が構造的に同じなら流さない。search だけ変わっても params の参照は保つ                                                                                                                                                                                                                                           |
| `location`                              | `InitializedObservable<{ pathname; search: ReadonlyURLSearchParams; hash; href }>` | 未宣言のクエリを読むときの逃げ道。ベースパスを除いた pathname                                                                                                                                                                                                                                                                         |
| `at(node)`                              | `InitializedObservable<Optional<{ params; search }>>`                              | node の prefix 一致。レイアウトと、その枝の中でだけ意味のある値に使う                                                                                                                                                                                                                                                                 |
| `isActive(node, { exact? })`            | `InitializedObservable<boolean>`                                                   | ナビゲーションの強調表示用                                                                                                                                                                                                                                                                                                            |
| `push(href)` / `replace(href)`          | `(href: Href) => void`                                                             | `string` は受けない。archive の `redirect` は History API に合わせ `replace` に改名。redirect の後で今と同じ URL になる `push` は `replace` になる。履歴 state は型付きで入れるまで持たない（「10. 今後のタスク」）                                                                                                                   |
| `setSearch(node, recipe, { replace? })` | `recipe: (prev: Search<node>) => Search<node>`                                     | その node が prefix 一致（`at(node)` が Some）のときだけ書き換え、返り値 `boolean` で結果を返す。宣言外のクエリは残す                                                                                                                                                                                                                 |
| `back()` / `forward()` / `go(n)`        | `() => void`                                                                       | 状態は `popstate` が来たときにだけ変わる                                                                                                                                                                                                                                                                                              |
| `parseHref(url)`                        | `(url: string) => Optional<Href>`                                                  | 外から来た URL（メールのリンク、サーバーの応答）を照合して `Href` にする                                                                                                                                                                                                                                                              |
| `toUrl(href)`                           | `(href: Href) => string`                                                           | ベースパスを付けたブラウザ上の URL。`Link` 以外で `<a>` を書くとき、コピー用の URL を作るときに使う                                                                                                                                                                                                                                   |
| `follow(href$, { replace? })`           | `(href$: Observable<Href>, ...) => () => void`                                     | Observable から遷移する認められた手段（入力欄の debounce した検索語など）。値が来るたびに、伝播が終わった後（microtask）で `push` / `replace` する。返り値で止める。購読を始めたときに Observable が持っている値は状態であって移動ではないので飛ばす。Observable が complete したらルーターはそれを忘れる。`dispose` の後は何もしない |
| `dispose()`                             | `() => void`                                                                       | `popstate` の購読を外し、すべての `follow` を止め、まだ行っていないスクロールを捨てる                                                                                                                                                                                                                                                 |

### 4.2 振る舞いの約束

1. **履歴移動は `popstate` だけで反映する。** `back()` の直後に状態を読み直さない。ブラウザでは移動が非同期なので、読み直すと古い URL がもう一度流れる（#2912）。`createMemoryBrowser` も `popstate` を `setTimeout` で後の task に発火し、テストがブラウザより強い保証を前提にしないようにする（microtask では `await Promise.resolve()` だけで新しい状態が読めてしまい、ブラウザより強い）。`push` / `replace` は History API が同期なのでその場で反映する。
2. **リダイレクトは状態を流す前に適用する。** `redirect` オプションは照合結果と、解決している URL（`RouterLocation`。パスは正規化した後のもの）を受け取り、`Href` を返すとその先を照合し直し、行き着いた URL を書く（最初の読み込みと `popstate` では `replaceState`、`push` / `replace` ではその URL を `pushState` / `replaceState`）。購読者からのリダイレクト（伝播中の書き込み）を不要にするためで、tiny-router-observable の `redirect` と同じ考え方。`push`・`replace`・`setSearch` の中では、その URL はまだブラウザに書いていない遷移先であり、`window.location` を読んでも得られない。どのページにも一致しない URL（`index.html` など）から、その検索パラメータと hash を持ったままページへ送れる（#3170）。順序は、末尾スラッシュの正規化（4）→ `redirect` で、`redirect` の後はその先をまた正規化してから照合する。連鎖は 10 回で打ち切り、その時点の URL をアドレスバーに残してその照合結果を流し、`console.error` で連鎖を示す。
3. **ナビゲーションはイベントハンドラーから呼ぶ。** `push` は state への書き込みなので、購読者の中から呼ぶと synstate の伝播中書き込み警告になる。eslint-plugin-synstate の `no-write-during-propagation` が `router.push` も検出できるよう、型情報で追える形（メソッドが state の setter を呼ぶ）にしておく。
4. **URL は定義から一意に決まる。** 末尾スラッシュは `trailingSlash: 'always' | 'never'`（既定値 `'always'`）で統一する。照合ではどちらも受け、正規形でない URL（`/products`）は、最初の読み込みと `popstate` のたびに状態を流す前に正規形へ `replaceState` する（リダイレクトと同じ扱い）。`isActive` や `Link` の「同じ URL なら `replace`」は正規形同士で比べる。ベースパスは tiny-router-observable と同じく、アプリがルートにあるものとして扱う。URL 全体を渡されたらそのパスを使い、`./` のような相対のベースはパスを持たないので例外にする。照合は空のセグメント（`//`）を含むパスを一致させない（`href` は書かず、URL では host の始まりと読まれるため）。
5. **ブラウザは注入できる。** `RouterBrowser` と `createMemoryBrowser` を tiny-router-observable から移し、store を factory にして Node でテストする既存の書き方（#2094 の流れ）をそのまま使える。ただし `popstate` は後の task に届くので（1）、履歴移動を確かめるテストは待つ必要がある。`createRouter` は `window` を呼び出し時にしか読まない。
6. **スクロール。** パスと検索パラメータが今と同じで `hash` だけが違う遷移は、`push` は `pushState` を使わず `location.hash` への代入でブラウザに任せる（スクロール、`hashchange`、`:target` が揃う。#3033 と同じ考え方）。`replace` は代入では履歴を置き換えられないので `replaceState` し、下の規則でその要素へスクロールする。それ以外の `push` / `replace` は、`hash` があればその要素へ、なくパスが変わったら先頭へスクロールする。スクロールは新しいページが描かれた後に行う: `Routes` が分岐を作り直した後（React は `useLayoutEffect`、synstate-dom は更新が終わった後の microtask）に行い、`Routes` を使わないアプリでは `requestAnimationFrame` の後に行う。検索パラメータだけが変わる遷移（`setSearch` を含む）はスクロールしない。最初に読み込んだ URL に `hash` があれば、最初のページが描かれた後に同じ規則でその要素へスクロールする（ブラウザ自身のスクロールは、ページが描かれる前の、要素がまだない文書で走るため）。ただし再読み込みと、戻る・進むで来た文書では何もしない。スクロール位置はブラウザか、`history.scrollRestoration` を `'manual'` にしたアプリ自身が戻すため（`RouterBrowser` の `restoresScroll`）。`Routes` のないアプリのためのフレーム後のスクロールが fragment の要素を見つけられなければ、その後 URL が変わっていなければ（同じ URL への `replace` は変化に数えず、別の URL へ移って戻ってきたら変化に数える）、次の `flushScroll` が 1 回だけもう一度試す。React の最初の commit は `requestAnimationFrame` より後になることがあるため。戻る・進むはブラウザの `history.scrollRestoration` に任せる。

### 4.3 データ取得（v1 ではルーターに持たせない）

v1 は loader を持たない。ルートの params は Observable なので、取得と取り消しは synstate の演算子で書ける。

```ts
const product$ = router
    .at(routes.products.item)
    .pipe(filter(Optional.isSome))
    .pipe(map((m) => m.value.params.productId))
    .pipe(skipIfNoChange())
    .pipe(
        switchMap((id) =>
            fromAbortablePromise((signal) => fetchProduct(id, signal)),
        ),
    );
// 別の商品へ移ると前のリクエストは abort される
```

`switchMap` はパイプラインを組んだ時点で親が持っている値も射影するので（#3133）、最初に開いたページのデータもすぐに取得する。

キャッシュ・再取得・重複排除はルーターではなくデータ層の責任とする。ルーターが loader を持つと、キャッシュの寿命や先読みをルーターが決めることになり、層が混ざるため。

## 5. React との連携（`synstate-router-react`）

React 版は synstate-dom 版と同じ保証（`Href` だけを受ける `Link`、全ページを要求する `Routes`）を持つ。Observable は server snapshot を渡す自前の `useSyncExternalStore` の hook で読み、memory browser 上のルーターをサーバーでも描けるようにする。`synstate-react-hooks` の `useObservableValue` も同じく server snapshot を渡す（#3639）が、hook 1 つのためにそのパッケージへ依存はしない。

```tsx
export const { Routes, Link, useRouteMatch, useAt, useIsActive } =
    createReactRouter(router);

export const App = (): React.JSX.Element => (
    <Routes
        cases={{
            home: () => <Home />,
            products: ({ search }) => <ProductList page={search.page} />,
            'products.new': () => <NewProduct />,
            'products.item': ({ params }) => (
                <ProductDetail productId={params.productId} />
            ),
            'products.item.reviews.item': ({ params }) => (
                <Review {...params} />
            ),
            sandbox: undefined, // ページがまだない → notFound を描く
            'sandbox.projects': ({ params }) => <Projects env={params.env} />,
            users: () => <UserList />,
            'users.item': ({ params }) => <UserDetail userId={params.userId} />,
            settings: () => <Settings />,
        }}
        notFound={<NotFound />}
    />
);
```

- `Routes`: `cases` は `page: false` でないすべてのルート id を必須キーにする。ルートを足して描画を書き忘れると型エラーになる。意図して描かないルートは `undefined` と書き、notFound に落ちる。case はその時点の `{ params; search }` を受け取る。返した要素にルート id を `key` として付けるので、ルートが変われば remount、同じルートで params だけ変われば state を保ったまま再描画される。
- レイアウトは `under` と `prefix` で入れ子にする（「6. synstate-dom との連携」と同じ規則）。
- `useRouteMatch()`: `RouteMatch<R>` を返す。`switch (m.route)` と `default: m satisfies never` でも網羅できる。内部は `useSyncExternalStore`。`router.match` は構造的に同じなら流さないので、snapshot の参照が安定し余分な再描画を生まない。
- case の引数と `useAt(node)` の中身は `withSearch(patch): Href` も持つ。今のルートと params のまま search の一部だけ変えた `Href` を作る（一覧の絞り込みリンクの多くはこれで書ける）。
- データの 404（params は正しいが対象がない）はルーターの状態にしない。ページが `notFound` と同じ部品を描く。URL は変えない。
- `useAt(node)` は `Optional<{ params; search }>`、`useIsActive(node, { exact? })` は `boolean` を返す。
- `Link`: `to: Href | ExternalHref`、`replace?`、残りは `<a>` の props。クリック判定はコアの `handleLinkClick(router, event)` を呼ぶだけで、synstate-dom 版と同じ規則（「6.2 `Link`」）が 1 箇所にある。
- ナビゲーションはイベントハンドラーから `router.push(href)` を呼ぶ。`useNavigate` のような hook は作らない（`router` は普通の値で、どこからでも呼べる）。
- React の context も module augmentation も使わない。`createReactRouter(router)` の戻り値が `typeof routes` から型を受け取るので、TanStack Router の `Register` のような全体登録は要らず、テストでは memory browser の router から作ればよい。

## 6. synstate-dom との連携（`synstate-router-dom`）

synstate-dom は context を持たないと決めているので（`libs/synstate-dom/SPEC.md`）、ルーターに束縛した部品を factory で作り、props に毎回 `router` を書かずに済むようにする。

```tsx
export const { Routes, Link } = createRouterComponents(router);

const App = (): JSX.Element => (
    <Routes
        cases={{
            home: () => <Home />,
            products: (m) => (
                <ProductList page={m.pipe(map((x) => x.search.page))} />
            ),
            'products.new': () => <NewProduct />,
            'products.item': (m) => (
                <ProductDetail
                    productId={m.pipe(map((x) => x.params.productId))}
                />
            ),
            'products.item.reviews.item': (m) => <Review match={m} />,
            sandbox: undefined,
            'sandbox.projects': (m) => (
                <Projects env={m.pipe(map((x) => x.params.env))} />
            ),
            users: () => <UserList />,
            'users.item': (m) => (
                <UserDetail userId={m.pipe(map((x) => x.params.userId))} />
            ),
            settings: () => <Settings />,
        }}
        notFound={<NotFound />}
    />
);
```

### 6.1 `Routes`

- `cases` の必須キーは React 版と同じ。
- 各 case はそのルートに絞られた `InitializedObservable<{ params; search; withSearch }>` を受け取る（`withSearch` は React 版と同じ）。内部は synstate-dom の `mountSwitch` と同じ方式で、**ルート id が変わったときだけ分岐を作り直す**。`mountSwitch` は synstate-dom の公開 API にないので、同じ処理を公開されている部品（`subscribe`・`toNodes`）で持つ。`/products/1` から `/products/2` では分岐を保ったまま Observable に新しい params が流れ、`MatchOptional` と同じ細粒度の更新になる。
- レイアウトは `under` と `prefix` で入れ子にする。`<Routes prefix cases={...}>` は直下の子の prefix 一致で分岐し、その中で `<Routes under={routes.products} cases={...}>` が `products` 以下のページを完全一致で分岐する。`under` を付けたときの必須キーはその枝のルート id だけ。
- キーは常に完全なルート id（`'products.item'`）。枝の中でも略さないので、`grep` で定義と描画を結べる。

```tsx
<Routes
  prefix
  cases={{
    products: () => (
      <ProductsLayout>
        <Routes
          under={routes.products}
          cases={{ products: ..., 'products.new': ..., 'products.item': ... }}
        />
      </ProductsLayout>
    ),
    // ...他の最上位ノード
  }}
  notFound={<NotFound />}
/>
```

### 6.2 `Link`

```tsx
<Link
  to={routes.products.item.href({ productId }, { search: { page: 2 } })}
  class={{ active: router.isActive(routes.products) }}
>
  {constant('商品')}
</Link>
<Link to={externalHref('https://example.com/')}>{constant('外部')}</Link>
```

- `to: Href | ExternalHref | Bindable<Href | ExternalHref>`、`replace?: boolean`、残りは `<a>` の props。変わらない遷移先は `constant` で包まずに書ける。`ExternalHref` は同じ origin でもルーターに回さない。`href` 属性には、`Href` なら `router.toUrl(to)`（ベースパス付き）を、`ExternalHref` ならその URL をそのまま書くので、新しいタブで開く・コピーするなどブラウザの動作はそのまま。
- クリックをルーターに回すのは、主ボタンで、修飾キーがなく、`target` が `_self` かなしで、`download` がなく、同じ origin の `Href` のときだけ。
- tiny-router の不具合を繰り返さない: アンカーは `currentTarget` から読む（#2954、アイコンを押しても SPA 遷移）。今と同じ URL かどうかは、どちらも正規形（「4.2」の 4）にした絶対 URL 同士で比べ、同じなら `replace` にする（#2956）。同じページ内の fragment だけの移動も `router.push` に渡す。`push` はそれを `location` へのブラウザ自身の fragment navigation にするので、スクロール・`hashchange`・`:target` が残り（#3033）、まだ実行していないスクロールもその fragment へ向け直せる（その場合、要素はまだ描かれていないので `:target` は付かない）。`replace` の `Link` は「4.2」の 6 のとおり `replaceState` とルーター自身のスクロールになる。それぞれにブラウザテストを付ける。

## 7. TanStack Router・React Router との比較

2026-11 時点。型安全性では v1 は TanStack Router と同じ項目を押さえ、コード生成と module augmentation を使わない点と、描画分岐の網羅チェックがある点で上回る。反対に loader・SSR・ファイルベースルーティングは v1 になく、展開先が SPA であることが前提になる。

| 観点           | synstate-router v1                                         | TanStack Router                                      | React Router v7                                                                   |
| :------------- | :--------------------------------------------------------- | :--------------------------------------------------- | :-------------------------------------------------------------------------------- |
| 遷移先の検査   | `Href` 型だけを受ける。手書き文字列は型エラー              | `to` を登録済みルートツリーと照合し、`params` も検査 | `Link to` は `string`。framework mode では 7.2.0 から `href()` で検査できるが任意 |
| 型の登録       | 不要（`routes` の値から推論）                              | `declare module` で `Register` に router を登録      | framework mode の typegen（`+types/*.d.ts`）                                      |
| コード生成     | なし                                                       | ファイルベースでは `routeTree.gen.ts` が必要         | framework mode では `react-router typegen` が必要                                 |
| パスパラメータ | codec で `SafeInt`・リテラル・branded。decode 失敗は不一致 | `params.parse` / `stringify` で変換できる            | 常に `string`。正規表現の `unstable_validateParams` が試験中                      |
| 検索パラメータ | ルートごとに codec または Standard Schema                  | `validateSearch`（Standard Schema 対応）             | `useSearchParams` の `URLSearchParams`（型なし）                                  |
| 描画分岐の網羅 | `Routes` の `cases` が全ページを要求                       | ルートごとに component を持たせるので分岐自体がない  | 同左                                                                              |
| データ取得     | なし。synstate の `switchMap` + `fromAbortablePromise`     | loader と組み込みキャッシュ、TanStack Query と連携   | loader / action                                                                   |
| SSR            | v1 は対象外（memory browser で拡張の余地は残す）           | あり（TanStack Start）                               | あり（framework mode）                                                            |

- 型検査のコスト: v1 は再帰の mapped type を使うので、「200 ルートで `tsc` が何秒増えるか」を実装と一緒に測り、上限をテストで押さえる。
- React Router の型安全性は framework mode の型生成に限られる（[Type Safety](https://github.com/remix-run/react-router/blob/main/docs/explanation/type-safety.md) が `[MODES: framework]`）。`href()` は [CHANGELOG](https://github.com/remix-run/react-router/blob/main/CHANGELOG.md) の 7.2.0 で追加され、`unstable_validateParams` と RFC 3986 準拠の param encode も同じ CHANGELOG にある。
- TanStack Router の列は記憶と調査メモによるもので、外部に出す前に [TanStack/router](https://github.com/TanStack/router) の文書で確かめる。

## 8. テスト計画

- 型: `expectType` で `RouteMatch`・`href` の引数・`cases` の必須キー・予約名の拒否を固定する。手書き文字列を `push` / `Link` に渡すと型エラーになることを `@ts-expect-error` で確かめる。
- 照合: 静的 > 動的、decode 失敗で次の枝へ、曖昧な定義の例外、encode / decode の往復（`/`・`%`・空白・非 ASCII）、末尾スラッシュの両受け、静的な枝から動的な枝への後戻り、`.` を含むキーと同じパスのページ 2 つの拒否、`href` が一致しない値で例外を投げること。
- codec: 各組み込みの正規形、refine・custom・Standard Schema、配列の all-or-nothing、default の省略、search の往復の検査、Promise を返す `validate` が「ない」になり unhandled rejection を出さないこと。
- ルーター: memory browser で `push` / `replace` / `setSearch` / `redirect`（連鎖の打ち切りを含む）。`back` / `go` は `popstate` を待ってから状態が変わり、`await Promise.resolve()` だけではまだ変わっていないこと（#2912）。`match` / `at` / `isActive` が後戻りした照合結果と一致すること。スクロール規則（hash、パスの変化、search だけの変化）。末尾スラッシュの正規化、ベースパス付きの `toUrl`。
- `Link`: ブラウザテストで修飾キー、`target`、`download`、子要素のクリック（#2954）、同じ URL の `replace`（#2956）、fragment だけの移動（#3033）。
- 型検査のコスト: 200 ルートの定義で `tsc` の時間と instantiation 数を測り、上限を超えたら失敗させる。
- よくある間違いの回帰: 手書きの文字列・テンプレートリテラル・`string` 変数を遷移先に渡す、存在しないルート id、params の型違い、`cases` の書き漏れ、search の型違いなどを、`@ts-expect-error` を付けた型テストとして並べる。

## 9. 先行例

- [Rocon](https://github.com/uhyo/rocon): builder で文字列パスを廃止する。型安全性は最強だが API が独特で、2022 年以降更新がない。
- [TanStack Router](https://github.com/TanStack/router): 文字列 pattern + ツリー。module augmentation と生成したルートツリーで型を通す。
- [Type Route](https://github.com/zilch/type-route): パラメータ型の明示宣言。フラット構造のみ。
- [Chicane](https://github.com/swan-io/chicane): 文字列 pattern + フラット。union 型パラメータ。
- [`apps/tiny-router-observable`](https://github.com/noshiro-pf/mono/tree/04646e536b68d01e9806b99ed51f7a238568e30e/apps/tiny-router-observable): Observable ベースの既存ルーター。履歴層の出発点。synstate-router に置き換えて削除した。

## 10. 今後のタスク（React Router・TanStack Router にあって v1 にない機能）

「方針」は入れる時期と、入れないものはその理由。v1.1・v1.2 の行はそれぞれ issue にした（#3363）。React Router・TanStack Router の名前は、2026-11-04 に React Router 8.5 と TanStack Router の文書で確かめた。

| 機能                                   | React Router                                                              | TanStack Router                                                 | 方針                                                                                                                                    |
| :------------------------------------- | :------------------------------------------------------------------------ | :-------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------- |
| 遷移のブロック（未保存フォームの確認） | `useBlocker`                                                              | `useBlocker` / `Block`                                          | v1.1（[#3428](https://github.com/noshiro-pf/mono/issues/3428)）。`beforeunload` とルーター内遷移の両方                                  |
| ルートごとの非同期ガード（認証など）   | `clientMiddleware` / loader 内の `redirect`                               | `beforeLoad`                                                    | v1.1（[#3429](https://github.com/noshiro-pf/mono/issues/3429)）。v1 は同期の `redirect` オプションのみ                                  |
| 任意深さの catch-all（`/docs/*`）      | `*`                                                                       | `$`（splat）                                                    | v1.1（[#3430](https://github.com/noshiro-pf/mono/issues/3430)）。`param.rest` として枝の末尾だけに許す                                  |
| 省略可能セグメント                     | `:lang?`                                                                  | `{-$lang}`                                                      | v1.1（[#3431](https://github.com/noshiro-pf/mono/issues/3431)）。無しと有りの 2 ノードで表せるので優先度は低い                          |
| ルートごとのエラー表示                 | `ErrorBoundary`                                                           | `errorComponent`                                                | v1.1（[#3432](https://github.com/noshiro-pf/mono/issues/3432)）。React 版 `Routes` に case ごとの error boundary                        |
| コード分割（遅延読み込み）             | `lazy`（data mode）、route module ごと（framework mode）                  | `autoCodeSplitting` / `createLazyRoute`                         | v1.1（[#3433](https://github.com/noshiro-pf/mono/issues/3433)）。React は `React.lazy` を case に書けば動くので、書き方と例を先に整える |
| 型付きの履歴 state                     | `state`（型なし）                                                         | `state`（`HistoryState` の拡張で全体に 1 つの型）               | v1.1（[#3434](https://github.com/noshiro-pf/mono/issues/3434)）。ルートに codec を宣言する形                                            |
| パンくず・ルートの静的データ           | `handle` + `useMatches`                                                   | `staticData` + `useMatches`                                     | v1.1（[#3435](https://github.com/noshiro-pf/mono/issues/3435)）。ノードに型付き `meta` を置く                                           |
| 検索パラメータの引き継ぎ・除去の規則   | なし                                                                      | search middleware の `retainSearchParams` / `stripSearchParams` | v1.1（[#3436](https://github.com/noshiro-pf/mono/issues/3436)）。`href` のオプションとして                                              |
| Preact 版                              | なし                                                                      | なし                                                            | v1.1（[#3437](https://github.com/noshiro-pf/mono/issues/3437)）。React 版と同じ形                                                       |
| View Transitions                       | `viewTransition`（非推奨。React の `<ViewTransition>` へ）                | `viewTransition`                                                | v1.2（[#3438](https://github.com/noshiro-pf/mono/issues/3438)）                                                                         |
| head / meta の管理                     | `meta` export（framework mode）。React 19 の `<title>`・`<meta>` を勧める | `head` + `<HeadContent />`                                      | v1.2（[#3440](https://github.com/noshiro-pf/mono/issues/3440)）。`document.title` をルートの `meta` から設定する程度から                |
| devtools                               | なし（コミュニティの `react-router-devtools`）                            | `TanStackRouterDevtools`                                        | v1.2（[#3439](https://github.com/noshiro-pf/mono/issues/3439)）。現在の match とルートツリーを表示                                      |
| loader・キャッシュ・先読み             | `loader` / `clientLoader` / `action`、`<Link prefetch>`                   | loader + キャッシュ、`preload: 'intent'`                        | 別検討。データ層（TanStack Query との比較の結論）を決めてから。まずリンクの hover での先読みフックだけを優先                            |
| 遷移中の状態（pending UI）             | `useNavigation`                                                           | `useRouterState` の `status`                                    | loader を入れるなら一緒に。データ取得を持たない v1 では不要                                                                             |
| SSR・ストリーミング・ハイドレーション  | framework mode                                                            | `@tanstack/react-router/ssr`（experimental）、TanStack Start    | 別検討。memory browser で URL を与える層は用意済み                                                                                      |
| hash ルーティング                      | `createHashRouter`                                                        | `createHashHistory`                                             | 要望が出たら。`RouterBrowser` の実装を足すだけで済む                                                                                    |
| ルートのマスク（別 URL を表示）        | `<Link mask>`                                                             | route masking（`mask`・`routeMasks`）                           | 要望が出たら                                                                                                                            |
| 相対遷移（`..`）                       | 相対パス                                                                  | `from` + `to: '..'`                                             | 入れない。`routes.x.href()` で絶対指定でき、文字列の相対パスは型で検査できない                                                          |
| フォーム・mutation                     | `Form` / `useFetcher` / action                                            | なし（Query と併用）                                            | 入れない。ルーターの責任ではない                                                                                                        |
| ファイルベースルーティングとコード生成 | `@react-router/fs-routes`                                                 | router plugin                                                   | 入れない。生成物が古いと型が緩む問題を持ち込みたくない                                                                                  |

## 11. 実装計画

stacked pull request で次の順に進める。

1. 本書（この pull request）。
2. `synstate-router` の骨格と `defineRoutes`・codec・`href`・照合。純粋関数だけで Node でテストし、`expectType` で型を固める。
3. `createRouter`: ブラウザ注入、`setTimeout` で `popstate` を発火する memory browser、`basePath`、`redirect`、末尾スラッシュ、`setSearch`。型検査コストの計測（200 ルート）もここ。
4. `synstate-router-react`（`Routes`・`Link`・hooks）。社内検討に使うので synstate-dom 版より先にする。
5. `synstate-router-dom`（`mountSwitch` の上の `Routes` と `Link`）。
6. サンプルアプリと e2e、synstate-docs のページ。その後、tiny-router-observable を使うアプリを 1 つずつ移し、tiny-router を引退させる。

# synstate-react-router API 設計調査レポート

## 概要

synstate-react-router の API 設計にあたり、既存の型安全ルーターライブラリと、Observable ベースのルーター実装を調査・比較した。本ドキュメントはその議論と決定事項を記録する。

---

## 調査対象ライブラリ

### 1. Rocon (uhyo)

**リポジトリ**: <https://github.com/uhyo/rocon>

**アプローチ**: Builder / Fluent パターン。文字列ベースのパスを完全に廃止し、プログラム的にルートを構築する。

**ルート定義例**:

```ts
const routes = Rocon.Path()
  .route("foo", (foo) => foo.action(() => <p>foo</p>))
  .route("bar", (bar) =>
    bar.attach(Rocon.Path())
      .route("baz", (baz) => baz.action(() => <p>baz</p>))
  );
```

**パスパラメータ**: `.any("userId", { ... })` メソッドで動的セグメントを宣言。型は TypeScript テンプレートリテラル型で推論。

**ネスト**: `.attach()` メソッドで子パスビルダーを接続。

**評価**:

- 型安全性は最強（文字列パターンが一切ない）
- しかし API が独特で学習曲線が急
- メンテナンス停止（2022年が最終リリース）
- ルート名 = パスセグメントという制約がある

### 2. TanStack Router

**サイト**: <https://tanstack.com/router>

**アプローチ**: String pattern + Tree 構造。`$` プレフィックスで動的セグメントを表現。

**ルート定義例**:

```ts
const postRoute = createRoute({
    getParentRoute: () => postsRoute,
    path: '$postId',
});

const routeTree = rootRoute.addChildren([postsRoute.addChildren([postRoute])]);
```

**パスパラメータ**: `$postId` がテンプレートリテラル型から `{ postId: string }` に推論される。

**型安全性**: module augmentation（`declare module`）でグローバルに型を登録。

**評価**:

- 成熟・アクティブに開発中・大規模コミュニティ
- File-based routing + code-based routing の両方をサポート
- `getParentRoute` による親子関係の明示が冗長
- Search params は Zod 等によるバリデーションをサポート

### 3. Type Route (zilch/type-route)

**リポジトリ**: <https://github.com/zilch/type-route>

**アプローチ**: 明示的パラメータ宣言。`param` ヘルパーオブジェクトで型を宣言。

**ルート定義例**:

```ts
const { routes } = createRouter({
    userList: defineRoute({ page: param.query.optional.number }, () => '/user'),
    user: defineRoute(
        { userId: param.path.string },
        (p) => `/user/${p.userId}`,
    ),
});
```

**パスパラメータ**: `param.path.string`, `param.query.optional.number` で明示的に型宣言。

**評価**:

- パラメータ型の明示宣言が明快
- フラット構造のみ（ネストなし）
- `number` 等の非 string パラメータ型をサポート
- メンテナンス停止

### 4. Chicane (swan-io/chicane)

**リポジトリ**: <https://github.com/swan-io/chicane>

**アプローチ**: String pattern + Flat 構造。パターン文字列からテンプレートリテラル型で推論。

**ルート定義例**:

```ts
const Router = createRouter({
    Home: '/',
    UserDetail: '/users/:userId',
    Projects: '/:env{live|sandbox}/projects',
});
```

**ユニーク機能**: Union 型パラメータ（`:env{live|sandbox}` → `"live" | "sandbox"` 型）。

**評価**:

- API がシンプル
- Union 型パラメータは強力
- ネストは `createGroup` + ワイルドカードで対応（限定的）
- 小さなバンドルサイズ（~4kB）

---

## ルート定義アプローチの比較

| アプローチ                  | 代表            | 型安全性 | ネスト           | 学習コスト |
| --------------------------- | --------------- | -------- | ---------------- | ---------- |
| Builder/Fluent              | Rocon           | 最強     | `.attach()`      | 高い       |
| String pattern + Tree       | TanStack Router | 強い     | `.addChildren()` | 中         |
| String pattern + Flat       | Chicane         | 良い     | 限定的           | 低い       |
| Explicit param + Builder fn | Type Route      | 良い     | なし             | 低い       |

---

## 設計決定の経緯

### ルート定義方式の選択

**検討**: Rocon の builder パターンと Observable base 実装 のオブジェクトツリー方式を比較。

**決定**: **オブジェクトツリー + 明示的パラメータ宣言**（案 C）を採用。

**理由**:

- Rocon の builder パターンは型安全性が最強だが、文字列パスを完全に廃止する設計はデバッグ時の URL の読みにくさ・既存 URL 設計との互換性の問題がある
- フラット構造は親パスの一貫性（共通プレフィックス）を構造的に保証できない
- オブジェクトツリーは階層関係が定義上明確で、Type Route の明示的パラメータ宣言と組み合わせることで型安全性も確保できる

### switch 文によるルートマッチング

**検討**: 3つの案を比較。

1. コンポーネントベース（`<Switch>` / `<Route>`）
2. hook + TypeScript switch 文（`useSwitch`）
3. ネスト対応コンポーネント

**決定**: **案 2（hook + switch 文）** を採用。

**理由**: TypeScript の switch 文で網羅性チェックが効く。case の discriminant にはオブジェクト参照ではなく string literal 型の `pattern` プロパティを使用（参照等値判定を避けるため）。

### switch の discriminant

**検討**: オブジェクト参照の `===` 比較 vs string 比較。

**決定**: **string（`pattern` プロパティ）** を使用。

**理由**: オブジェクト参照の一致性判定は `switch` 文で使うには脆弱（import パス、bundler の挙動等に依存する可能性）。string literal 型なら安全。

### match() と matchExact()

**検討**: ネストした Switch をサポートするために、プレフィックス一致と完全一致の両方が必要。

**決定**: 両方を公開 API として提供。

- `match()` — プレフィックス一致。ネストした親 Switch で使用。
- `matchExact()` — 完全一致。リーフレベルのルーティングで使用。
- `useSwitch` のデフォルトは `matchExact`、`{ matchMode: 'prefix' }` オプションでプレフィックス一致に切り替え。

### クエリパラメータ API

**検討**: 4つの hook パターンを比較。

1. 個別 hook（`useQueryParam(routes.X.queryParams.page)`）
2. ルート単位で一括取得
3. セレクター（ルート + キー名）
4. Observable 直接利用

**決定**: **案 1（個別 hook）** を採用。

**理由**: 必要なパラメータだけ購読できるため不要な再レンダリングを避けられる。

### Link コンポーネント

**検討**: `to` に route オブジェクト + params を分けて渡す方式 vs `path()` の戻り値（string）を直接渡す方式。

**決定**: **`to` に string を直接渡す方式** を採用。

**理由**: `to` と `params` を分けても、遷移先コンポーネントで params を props として受け取れるわけではないため、分ける意味がない。`path()` が型安全な string を返すので、Link 側は string を受け取るだけで十分。

### branded type サポート

**決定**: `param.path.branded(BrandedType)` で opt-in。内部的には `param.path.string` と同じ動作だが、型レベルで branded type として扱われる。

### SSR 対応

**決定**: 初期実装では対象外。将来的に `createMemoryRouter()` で `window` 非依存版を提供できるよう、ルーターの状態管理と History API の操作を分離した設計にしている。

参考: React Router v6+ は `StaticRouter`、TanStack Router も SSR 対応済み。

### ベースパス対応

**決定**: 初期実装では対象外。API が複雑にならない形で後から追加予定。

---

## Observable ベースルーター実装からの知見

既存の Observable ベースルーター実装の調査から得られた知見:

### アーキテクチャ

- URL 状態を Observable として管理し、`map` で `pathname`, `pathSegments`, `searchParams` に分解
- `popstate` イベントをリスンしてブラウザの戻る/進むに対応
- `pushState` / `replaceState` 後に Observable を手動更新（History API はイベントを発火しないため）

### クエリパラメータ管理

- 型安全なシリアライザー（`boolean`, `number`, `string`, `stringArray`, branded type）を提供
- `useQueryParam` hook で個別パラメータを購読
- `setQueryParam` / `deleteQueryParam` でプログラム的に更新
- `replaceState` オプションで履歴を汚さない更新が可能

### HistoryAwareLink

- modifier キー（Ctrl, Cmd, Shift, Alt）を検出して通常のブラウザナビゲーションにフォールバック
- `target` 属性を尊重
- 外部 URL は通常の `<a>` として動作
- `replace` prop で `pushState` / `replaceState` を切り替え

### ルート定義と型ガード

- パスセグメントをオブジェクトで階層的に定義
- 型ガード関数（`routeIs.X.Y(pathSegments)`）でパスパラメータを型安全に抽出
- このパターンは synstate-react-router の `match()` / `matchExact()` に引き継がれた

---

## 最終的な API 設計

上記の調査と議論を経て、以下の API を採用した:

- **ルート定義**: `defineRoutes()` — オブジェクトツリー + `param` ヘルパーによる明示的型宣言
- **マッチング**: `match()` / `matchExact()` — 純粋関数、React 外でも使用可能
- **マッチング（ハンドラーマップ）**: `routeMatch()` — ルートパターンをキーとするオブジェクトでハンドラーを定義し、マッチしたハンドラーを実行
- **React hook**: `useRouteMatch()` — `routeMatch()` の React ラッパー。`router.pathSegments`（Observable）を購読し、URL 変更時に自動でマッチングを再実行
- **ナビゲーション**: `createRouter()` — Observable ベース + History API ラッパー（プロパティに `$` suffix は使わない）
- **クエリパラメータ**: 型安全なシリアライザー + `useQueryParam` / `setQueryParam` / `deleteQueryParam`
- **Link**: string ベースの `to` prop + SPA ナビゲーション

### `useSwitch` から `useRouteMatch` への変更理由

当初は `useSwitch` + TypeScript `switch` 文で route を分岐する方針だったが、以下の理由で `useRouteMatch` に変更:

1. **型安全性**: `switch` 文では `matched.route` で分岐しても `matched.params` の型が絞り込まれない。`useRouteMatch` のハンドラーマップでは各ハンドラーの引数に正しい params 型が付く。
2. **簡潔さ**: ルートノード配列を別途渡す必要がなく、routes 定義からルートノードが自動収集される。
3. **match 式パターン**: computed property key (`[routes.X.pattern]`) を使うことで switch 文に近い見た目を維持しつつ、型推論が効く。

詳細な API 仕様は [DESIGN.md](./DESIGN.md) を参照。

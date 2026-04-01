# synstate-react-router 設計ドキュメント

## 概要

synstate の Observable をベースにした型安全クライアントサイドルーター。

- `synstate-router`: フレームワーク非依存のコアパッケージ
- `synstate-react-router`: React 向けの hooks / Link コンポーネント

## 設計方針

- ルート定義はオブジェクトツリー
- パラメータ型は明示的宣言（Type Route 方式）、branded type サポート
- ルートマッチングは `useRouteMatch` hook + ハンドラーマップ（match 式パターン）
- `match()`（プレフィックス一致）と `matchExact()`（完全一致）の2種類を提供
- クエリパラメータは型安全なシリアライザー内蔵
- ナビゲーション状態は synstate Observable で管理（`$` suffix は使わない）
- SSR は初期実装では対象外（将来の `createMemoryRouter` で対応可能な設計にする）
- ベースパス対応は後回し

## パッケージ構成

```txt
synstate-router (framework-agnostic)
├── コアルーター（URL Observable, History API ラッパー）
├── ルート定義（defineRoutes, param）
├── マッチング関数（match, matchExact, routeMatch, collectRouteNodes）
├── クエリパラメータ管理（シリアライザー）
└── パスユーティリティ（splitToPathSegments）

synstate-react-router (React 固有、synstate-router に依存)
├── React hooks（useRouteMatch, useQueryParam, usePathSegments）
├── Link コンポーネント
└── synstate-router の全 API を re-export
```

## API 設計

### ルート定義

```ts
import { defineRoutes, param } from 'synstate-react-router';

const routes = defineRoutes({
    home: { segment: '' },
    products: {
        queryParams: {
            page: param.query.number({ default: 1 }),
            search: param.query.string(),
        },
        children: {
            item: {
                params: { productId: param.path.string },
                children: {
                    reviews: {
                        children: {
                            item: {
                                params: {
                                    reviewId: param.path.branded(ReviewId),
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    users: {
        children: {
            item: {
                params: { userId: param.path.branded(UserId) },
            },
        },
    },
    settings: {},
});
```

- キー名がパスセグメントとして使われる（`products` → `/products`）
- `segment: ''` でルートパス（`/`）を定義
- `segment` プロパティでカスタムセグメント名を指定可能（`userProfiles` → `segment: 'user-profiles'`）
- `params` があるノードは動的セグメント（`:productId`）
- `params` がないノードは静的セグメント

各ルートノードは `pattern` プロパティ（string literal 型）を持つ:

```ts
routes.products.pattern; // '/products'
routes.products.item.pattern; // '/products/:productId'
routes.home.pattern; // '/'
```

### ルーター作成

```ts
const router = createRouter(routes);
```

Router のプロパティ（`$` suffix なし）:

```ts
router.state; // InitializedObservable<RouterState>
router.pathname; // InitializedObservable<string>
router.pathSegments; // InitializedObservable<readonly string[]>
router.searchParams; // InitializedObservable<URLSearchParams>
```

### パス生成（型安全）

```ts
routes.products.path();
// => '/products'

routes.products.item.path({ productId: '123' });
// => '/products/123'

routes.products.item.reviews.item.path({
    productId: '123',
    reviewId: asReviewId('456'),
});
// => '/products/123/reviews/456'
```

### マッチング関数

React 外でも使える純粋関数。2種類のマッチングを提供:

```ts
// match(): プレフィックス一致
routes.products.match(pathSegments);
// => {} | undefined

// matchExact(): 完全一致
routes.products.matchExact(pathSegments);
// => {} | undefined

// routeMatch(): ハンドラーマップベースのマッチング
routeMatch(pathSegments, routeNodes, {
    '/products/:productId': ({ productId }) => `Product ${productId}`,
    '/products': () => 'Product List',
    fallback: () => 'Not Found',
});
```

Observable の subscribe 内でも使用可能:

```ts
router.state.subscribe((state) => {
    const productMatch = routes.products.item.match(state.pathSegments);
    if (productMatch !== undefined) {
        analytics.track('view_product', { productId: productMatch.productId });
    }
});
```

### ルートマッチング（useRouteMatch）

`useRouteMatch` はハンドラーマップを受け取り、マッチしたハンドラーの結果を返す。
ルートノードは `routes` 定義から自動収集され、深いルートが優先される。

```tsx
const content = useRouteMatch(router.pathSegments, routes, {
    [routes.products.item.pattern]: ({ productId }) => (
        <ProductDetail productId={productId} />
    ),
    [routes.products.pattern]: () => <ProductList />,
    [routes.users.item.pattern]: ({ userId }) => (
        <UserProfile userId={userId} />
    ),
    [routes.users.pattern]: () => <UserList />,
    [routes.settings.pattern]: () => <Settings />,
    [routes.home.pattern]: () => <Home />,
    fallback: () => <NotFound />,
});
```

ネストも同じパターン:

```tsx
// 親コンポーネント — prefix マッチ
const area = useRouteMatch(
    router.pathSegments,
    routes,
    {
        [routes.products.pattern]: () => <ProductsArea />,
        [routes.users.pattern]: () => <UsersArea />,
        fallback: () => <NotFound />,
    },
    { matchMode: 'prefix' },
);

// 子コンポーネント — exact マッチ（デフォルト）
const content = useRouteMatch(router.pathSegments, routes, {
    [routes.products.item.pattern]: ({ productId }) => (
        <ProductDetail productId={productId} />
    ),
    [routes.products.pattern]: () => <ProductList />,
    fallback: () => <NotFound />,
});
```

### クエリパラメータ

```tsx
// hook で購読（Observable を直接渡す）
const page = useQueryParam(
    router.searchParams,
    routes.products.queryParams.page,
);

// プログラム的に設定
router.setQueryParam(routes.products.queryParams.page, 2);
router.setQueryParam(routes.products.queryParams.search, 'widget', {
    method: 'replaceState',
});

// 削除（default 値に戻る）
router.deleteQueryParam(routes.products.queryParams.page);

// 同期的に読み取り
const currentPage = router.getQueryParam(routes.products.queryParams.page);
```

### Link コンポーネント

```tsx
// 動的ルート — path() で型安全な URL を生成
<Link router={router} to={routes.products.item.path({ productId: product.id })}>
  {product.name}
</Link>

// 静的ルート
<Link router={router} to={routes.settings.path()}>Settings</Link>

// replace（履歴に残さない）
<Link router={router} to={routes.products.path()} replace>Products</Link>

// 外部 URL（通常の <a> にフォールバック）
<Link router={router} to="https://example.com">External</Link>
```

`to` は `string` 型。`path()` が型安全なパス文字列を返す。
Link は SPA ナビゲーション対応（modifier キー、target 属性を考慮）。

### プログラム的ナビゲーション

```ts
router.push(routes.products.item.path({ productId: '123' }));
router.redirect(routes.products.path()); // replaceState
router.back();
router.forward();
router.go(-2);
```

### Observable 直接利用

```ts
// React 外で subscribe
router.state.subscribe((state) => {
    console.log(state.pathname, state.pathSegments, state.searchParams);
});

// synstate オペレーターとの組み合わせ
const currentProjectId = router.searchParams.pipe(
    map((params) => params.get('projectId')),
);
```

## クエリパラメータシリアライザー

```ts
param.query.string(); // string | undefined
param.query.number(); // number | undefined
param.query.number({ default: 1 }); // number (default 付き)
param.query.boolean(); // boolean | undefined
param.query.boolean({ default: false }); // boolean
param.query.stringArray(); // readonly string[] | undefined
param.query.branded(ProjectId); // ProjectId | undefined
param.query.brandedArray(TagId); // readonly TagId[] | undefined
```

## 参考にしたライブラリ

- Rocon (uhyo) — builder pattern の思想
- TanStack Router — ツリー構造 + 型推論
- Type Route — 明示的パラメータ宣言
- Chicane — シンプルな API

詳細は [api-design-research.md](./api-design-research.md) を参照。

## 未決事項

- [ ] ベースパス対応のタイミング
- [ ] SSR 対応（`createMemoryRouter`）のタイミング

## 完了済み

- [x] `match()`（プレフィックス一致）と `matchExact()`（完全一致）の両方を公開 API として提供
- [x] ネストした routing をサポート（`useRouteMatch` の `matchMode` オプション）
- [x] ルート定義オブジェクトの型推論の実装
- [x] `synstate-router`（framework-agnostic）への切り出し
- [x] `useSwitch` + switch 文から `useRouteMatch` + ハンドラーマップに変更
- [x] Observable プロパティから `$` suffix を除去（`state$` → `state` 等）
- [x] `usePathSegments` / `useQueryParam` の引数を `Router<D>` から Observable に変更

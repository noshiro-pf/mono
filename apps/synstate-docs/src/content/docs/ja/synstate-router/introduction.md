---
title: synstate-router の紹介
description: すべての遷移先・パスパラメータ・検索パラメータを型検査する SynState のクライアントサイドルーター synstate-router と、その React・synstate-dom 向けバインディングの紹介です。
sidebar:
    order: 1
---

synstate-router は SynState の上に作ったクライアントサイドルーターです。アプリケーションが書くすべての遷移先・パスパラメータ・検索パラメータを型検査します。コード生成も module augmentation も使わず、型はルートツリーそのものから得ます。状態（今の照合結果、あるノードの値、リンクが現在のページを指しているか）は SynState の Observable なので、グラフの他の部分とそのまま組み合わせられます。

描画には 2 つのバインディングがあります。React 向けの `synstate-router-react` と、[synstate-dom](/mono/synstate/ja/synstate-dom/introduction/) 向けの `synstate-router-dom` です。

:::caution
synstate-router はまだバージョン 0.x なので、マイナーリリースで API が変わることがあります。設計は [SPEC.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-router/SPEC.md) にあります。
:::

## 何を検査するか

- **遷移先。** ルートノードの `href` は branded な文字列 `Href` を返します。`router.push` は `Href` しか受けず、`Link` は `Href` か、`externalHref(url)` でしか作れない `ExternalHref` を受けます。手書きの文字列・テンプレートリテラル・`string` の変数は、ブラウザで失敗する代わりに `tsc` で失敗します。
- **パラメータ。** パスパラメータと検索パラメータは、生の文字列を値に読む codec です。`param.int` は `SafeInt` を、`param.literal` は union を、`param.refine` と `search.refine` は自分で書いたガードで検査する branded 型を返します。検索パラメータは Standard Schema も受けます。decode できないパスのセグメントはそのルートに一致せず、decode できない検索値は「ない」か既定値として読みます。
- **分岐。** 照合結果はドット区切りのルート id をキーにした union なので、`route` で `switch` すると `params` と `search` が絞り込まれます。
- **描画。** バインディングの `Routes` はすべてのページ id に case を要求します。case のないルートを足すと `tsc` が失敗します。まだ描かないページは `undefined` と書き、`notFound` になります。
- **ツリー。** 定義した順番次第で同じ URL に一致してしまう 2 つのルートは、ツリーを定義した時点で拒否します。

## インストール

ルーター・そのバインディング・例が import するライブラリをインストールします（React バインディングには `react` 19 以降が必要です）。

```sh
npm install react react-dom synstate synstate-router synstate-router-react ts-data-forge # React
npm install synstate synstate-dom synstate-router synstate-router-dom ts-data-forge # synstate-dom
```

以下の例は import を省いています。ルートツリー・codec・ルーターは `synstate-router` から、コンポーネントはバインディングから、`render`・`constant`・`inlineMap` は `synstate-dom` から、`renderToStaticMarkup` は `react-dom/server` から、`switchMap` などの operator は `synstate` から、`asSafeInt`・`Optional`・`Result` は `ts-data-forge` から import します。`fetchProductName` はアプリケーション自身のリクエスト関数の代わりです。

## ルートの定義

ルートツリーはただのオブジェクトです。ノードのキーがそのままパスのセグメントになり（`segment` で変えられます）、`params` を持つノードは動的なセグメントになります。

```tsx
const routes = defineRoutes({
    home: { segment: '' },
    products: {
        search: {
            page: search.int({ default: 1 }),
            q: search.string(),
        },
        children: {
            new: {}, // /products/new/ wins over /products/:productId/
            item: { params: { productId: param.int } },
        },
    },
});

// The only way to make an `Href` is a node's `href`.
const href = routes.products.item.href(
    { productId: asSafeInt(42) },
    { search: { q: 'shoe' } },
);

assert.strictEqual(href, '/products/42/?q=shoe');

const m = matchRoutes(routes, {
    pathname: '/products/42/',
    search: 'q=shoe',
});

switch (m.route) {
    case 'products.item':
        // `params` and `search` are narrowed to this route's types.
        assert.strictEqual(m.params.productId, 42);

        assert.strictEqual(m.search.page, 1);

        break;

    case 'home':
    case 'products':
    case 'products.new':
    case undefined:
        throw new Error(`unexpected ${m.route ?? 'not found'}`);
}
```

## ルーター

`createRouter` はブラウザの履歴に従います。リダイレクトは `match` がページを示す前に適用するので、購読側が遷移し直す必要はありません。`basePath` でアプリをあるパスの下に置けます。テストでは memory browser が window の代わりをします。

```tsx
const routes = defineRoutes({
    home: { segment: '' },
    products: {
        search: { q: search.string() },
        children: { item: { params: { productId: param.int } } },
    },
    signIn: { segment: 'sign-in' },
    settings: {},
});

const [signedIn] = createState(false);

const router = createRouter(routes, {
    basePath: '/shop/', // `import.meta.env.BASE_URL` in a Vite app
    browser: createMemoryBrowser('https://example.com/shop/'), // the window when left out
    // Applied before `match` shows a page, so no subscriber has to navigate.
    redirect: (m) =>
        m.route === 'settings' && !signedIn.getSnapshot().value
            ? routes.signIn.href()
            : undefined,
});

// `push` takes an `Href` only; `router.push('/settings/')` fails `tsc`.
router.push(routes.settings.href());

assert.strictEqual(router.match.getSnapshot().value.route, 'signIn');

// The URL the browser shows, below the base path.
assert.strictEqual(
    router.toUrl(routes.products.item.href({ productId: asSafeInt(42) })),
    '/shop/products/42/',
);

// Observables for layouts and navigation links.
const inProducts = router.isActive(routes.products);

router.push(routes.products.href());

assert.isTrue(inProducts.getSnapshot().value);

// Rewrites the search of a node, keeping the rest of the URL.
router.setSearch(routes.products, (prev) => ({ ...prev, q: 'shoe' }));

assert.deepStrictEqual(router.match.getSnapshot().value, {
    route: 'products',
    params: {},
    search: { q: 'shoe' },
});
```

ルーターはブラウザと同じようにスクロールします。遷移先に fragment があればその要素へ、パスが変わったら先頭へ、検索パラメータだけが変わったときはスクロールしません。戻る・進むと再読み込みは、ブラウザ自身のスクロール復元に任せます。

## React

`createReactRouter(router)` は、そのルーターに結び付いた `Routes`・`Link` と、hooks の `useRouteMatch`・`useAt(node)`・`useIsActive(node)` を返します。context もグローバルな登録もありません。case は `{ params, search, withSearch }` を受け取ります。要素はルート id を key にするので、ルートが変われば作り直し、同じルートで params が変われば更新します。

```tsx
const routes = defineRoutes({
    home: { segment: '' },
    products: {
        search: { page: search.int({ default: 1 }) },
        children: { item: { params: { productId: param.int } } },
    },
    settings: {},
});

const router = createRouter(routes, {
    // The real window when left out.
    browser: createMemoryBrowser('https://example.com/products/42/'),
});

// Bound to the router: no context, no global registration. Export these
// from one module of the application.
const { Routes, Link } = createReactRouter(router);

// Outside the component, so that `Routes` gets the same object every
// render: in an application, at the top level of the module.
const pages: PageCases<typeof routes, RouteId<typeof routes>> = {
    // Every page is a required key: a new route without a case fails `tsc`.
    home: () => <h1>{'Home'}</h1>,
    products: (list) => (
        <Link to={list.withSearch({ page: asSafeInt(list.search.page + 1) })}>
            {'Next page'}
        </Link>
    ),
    'products.item': (item) => <h1>{`Product ${item.params.productId}`}</h1>,
    settings: undefined, // not drawn yet: falls to notFound
} as const;

const notFound = <h1>{'Not found'}</h1>;

const App = (): React.JSX.Element => (
    <>
        <nav>
            <Link to={routes.products.href()}>{'Products'}</Link>
            <Link to={externalHref('https://example.com/help')}>{'Help'}</Link>
        </nav>
        <Routes cases={pages} notFound={notFound} />
    </>
);

assert.strictEqual(
    renderToStaticMarkup(<App />),
    '<nav><a href="/products/">Products</a><a href="https://example.com/help">Help</a></nav><h1>Product 42</h1>',
);
```

レイアウトは入れ子にできます。`<Routes prefix cases={...}>` はページがどのトップレベルのノードの下にあるかで分岐し、`<Routes under={routes.products} cases={...}>` はその枝のページだけを要求します。`cases` のオブジェクトは、コンポーネントの外で（アプリケーションではモジュールのトップレベルで）一度だけ書いてください。React の lint 規則は描画中に作ったオブジェクトや関数を props に渡すことを拒否しますし、そうすれば `Routes` は毎回同じオブジェクトを受け取ります。[サンプルアプリ](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-router-react-sample-app)は、レイアウト・検索パラメータ・リダイレクトをこの書き方で示しています。

## synstate-dom

`createRouterComponents(router)` は synstate-dom 向けの `Routes` と `Link` を返します。case はそのページに入ったときに一度だけ呼ばれ、`{ params, search, withSearch }` の Observable を受け取ります。同じルートの新しい params と検索パラメータはその Observable に流れ、別の case をマウントするのはルートが変わったときだけです。

```tsx
import { map } from 'synstate';
import { constant, inlineMap, render } from 'synstate-dom';
import {
    createMemoryBrowser,
    createRouter,
    defineRoutes,
    externalHref,
    param,
    search,
} from 'synstate-router';
import { createRouterComponents } from 'synstate-router-dom';
import { asSafeInt } from 'ts-data-forge';

const routes = defineRoutes({
    home: { segment: '' },
    products: {
        search: { page: search.int({ default: 1 }) },
        children: { item: { params: { productId: param.int } } },
    },
    settings: {},
});

const router = createRouter(routes, {
    // The real window when left out.
    browser: createMemoryBrowser('https://example.com/products/42/'),
});

// Bound to the router: synstate-dom has no context. Export these from one
// module of the application.
const { Routes, Link } = createRouterComponents(router);

const unmount = render(
    () => (
        <>
            <nav>
                <Link to={routes.products.href()}>{constant('Products')}</Link>
                <Link to={externalHref('https://example.com/help')}>
                    {constant('Help')}
                </Link>
            </nav>
            <Routes
                cases={{
                    // Every page is a required key: a new route without a case fails
                    // `tsc`.
                    home: () => <h1>{constant('Home')}</h1>,
                    // Called once on entering the page; new params and search flow
                    // through the observable.
                    products: (list$) => (
                        <Link
                            to={list$.pipe(
                                map((list) =>
                                    list.withSearch({
                                        page: asSafeInt(list.search.page + 1),
                                    }),
                                ),
                            )}
                        >
                            {constant('Next page')}
                        </Link>
                    ),
                    'products.item': (item$) => (
                        <h1>
                            {inlineMap(
                                item$,
                                (item) => `Product ${item.params.productId}`,
                            )}
                        </h1>
                    ),
                    settings: undefined, // not drawn yet: falls to notFound
                }}
                notFound={<h1>{constant('Not found')}</h1>}
            />
        </>
    ),
    document.body,
);

assert.strictEqual(document.querySelector('h1')?.textContent, 'Product 42');

assert.strictEqual(
    document.querySelector('nav')?.getHTML(),
    '<a href="/products/">Products</a><a href="https://example.com/help">Help</a>',
);

unmount();
```

## データ取得

synstate-router は loader を持ちません。ページのデータはルーターに従う SynState のグラフです。`router.at(node)` は、ページがそのノード以下にある間はノードの値の `Optional.some` を、それ以外では `Optional.none` を持ちます。`switchMap` と `fromAbortablePromise` で値ごとにデータを取得します。`switchMap` はグラフを組んだ時点で元の Observable が持っている id も射影するので、アプリケーションが最初に開いたページのリクエストは、購読があるかどうかにかかわらずその時点で始まります。その後は新しい id のたびに、置き換えられたリクエストを中断します。[サンプルアプリ](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-router-react-sample-app/src/store)は、グラフを store のモジュールの最上位で組み、ページを離れたことを idle の値に写すので、リクエストは中断されその結果は捨てられます。コンポーネントは store を読んで dispatch するだけで、自分では何も取得しません。

```tsx
const routes = defineRoutes({
    home: { segment: '' },
    products: {
        children: { item: { params: { productId: param.int } } },
    },
});

const router = createRouter(routes, {
    browser: createMemoryBrowser('https://example.com/products/42/'),
});

// `at` holds the node's values while the page is at or below it, and `none`
// elsewhere. `map` passes a new id only, and `switchMap` aborts the request
// for the id it replaces.
const productName = router
    .at(routes.products.item)
    .pipe(filter(Optional.isSome))
    .pipe(map((some) => some.value.params.productId))
    .pipe(
        switchMap((productId) =>
            fromAbortablePromise((signal) =>
                fetchProductName(productId, signal),
            ),
        ),
    );

const mut_names: string[] = [];

productName.subscribe((result) => {
    if (Result.isOk(result)) {
        mut_names.push(result.value);
    }
});

// `switchMap` projects the id the router already holds, so the page it
// opened on (42) is fetched at once.
await new Promise((resolve) => {
    setTimeout(resolve, 10);
});

assert.deepStrictEqual(mut_names, ['Product 42']);

// Two moves before the next answer: only the last one is fetched to the
// end.
router.push(routes.products.item.href({ productId: asSafeInt(7) }));

router.push(routes.products.item.href({ productId: asSafeInt(8) }));

await new Promise((resolve) => {
    setTimeout(resolve, 10);
});

assert.deepStrictEqual(mut_names, ['Product 42', 'Product 8']);
```

---
title: Introducing synstate-router
description: synstate-router, a client-side router for SynState in which every destination, path parameter and search parameter is checked by the type checker, with bindings for React and synstate-dom.
sidebar:
    order: 1
---

synstate-router is a client-side router built on SynState. Every destination, path parameter and search parameter an application writes is checked by the type checker, with no code generation and no module augmentation: the types come from the route tree itself. Its state (the current match, the values of a node, whether a link is current) is a set of SynState Observables, so it composes with the rest of the graph.

Two bindings draw it: `synstate-router-react` for React, and `synstate-router-dom` for [synstate-dom](/mono/synstate/synstate-dom/introduction/).

:::caution
synstate-router is in development and not on npm yet. The design is in its [SPEC.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-router/SPEC.md) (Japanese).
:::

## What it checks

- **Destinations.** A route node's `href` returns an `Href`, a branded string. `router.push` takes only an `Href`, and `Link` an `Href` or an `ExternalHref`, which only `externalHref(url)` makes. A hand-written string, a template literal or a `string` variable fails `tsc` instead of failing in the browser.
- **Parameters.** Path and search parameters are codecs that read the raw string into a value: `param.int` gives a `SafeInt`, `param.literal` a union, and `param.refine` or `search.refine` a branded type checked by your own guard. Search parameters also take a Standard Schema. A path segment that does not decode means the route does not match; a search value that does not decode reads as absent, or as its default.
- **Branching.** A match is a union keyed by the dotted route id, so a `switch` on `route` narrows `params` and `search`.
- **Drawing.** A binding's `Routes` requires a case for every page id. A route added without a case fails `tsc`; a page not drawn yet is written as `undefined` and falls to `notFound`.
- **The tree.** Two routes that would match the same URL, depending on the order they were defined in, are rejected when the tree is defined.

## Installation

Once the packages are published, an application installs the router, its binding and the libraries the examples import (`react` 19 or later for the React binding):

```sh
npm install react react-dom synstate synstate-router synstate-router-react ts-data-forge # React
npm install synstate synstate-dom synstate-router synstate-router-dom ts-data-forge # synstate-dom
```

The examples below leave out their imports. The route tree, the codecs and the router come from `synstate-router`, the components from the binding, `render`, `constant` and `view` from `synstate-dom`, `renderToStaticMarkup` from `react-dom/server`, operators such as `switchMap` from `synstate`, and `asSafeInt`, `Optional` and `Result` from `ts-data-forge`. `fetchProductName` stands in for the application's own request function.

## Defining routes

The route tree is a plain object. A node's key is its path segment unless `segment` says otherwise; a node with `params` is a dynamic segment.

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

## The router

`createRouter` follows the browser history. Redirects are applied before `match` shows a page, so no subscriber has to navigate; `basePath` serves the app below a path; and in a test, a memory browser stands in for the window.

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

The router also scrolls as a browser does: to the fragment when the destination has one, to the top when the path changed, and not at all when only the search changed. Back and forward, and a reload, are left to the browser's own scroll restoration.

## React

`createReactRouter(router)` returns `Routes`, `Link` and the hooks `useRouteMatch`, `useAt(node)` and `useIsActive(node)`, bound to the router, with no context and no global registration. A case receives `{ params, search, withSearch }`; the element is keyed by the route id, so a new route remounts and new params of the same route update.

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

Layouts nest: `<Routes prefix cases={...}>` branches on the top-level node the page is under, and `<Routes under={routes.products} cases={...}>` requires the pages of that branch alone. Write each `cases` object once, outside the component (in an application, at the top level of its module): the React lint rules reject an object or a function created during render as a prop, and `Routes` then gets the same object every render. The [sample app](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-router-react-sample-app) shows layouts, search parameters and redirects written this way.

## synstate-dom

`createRouterComponents(router)` returns `Routes` and `Link` for synstate-dom. A case is called once when its page is entered, with an Observable of `{ params, search, withSearch }`; new params and search of the same route flow through it, and only a new route mounts another case.

```tsx
import { constant, render, view } from 'synstate-dom';
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
                            to={view(list$, (list) =>
                                list.withSearch({
                                    page: asSafeInt(list.search.page + 1),
                                }),
                            )}
                        >
                            {constant('Next page')}
                        </Link>
                    ),
                    'products.item': (item$) => (
                        <h1>
                            {view(
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

## Data fetching

synstate-router has no loaders. A page's data is a SynState graph that follows the router: `router.at(node)` holds `Optional.some` of the node's values while the page is at or below the node, and `Optional.none` elsewhere, and `switchMap` with `fromAbortablePromise` fetches for each value. `switchMap` also projects the id its source already holds when the graph is built, so the request for the page the application opens on starts then, whether or not anything subscribes; after that, each new id aborts the request it replaces. The [sample app](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-router-react-sample-app/src/store) builds its graphs in a store module, at its top level, and maps leaving the page to an idle value, so that the request is aborted and its result dropped: the components read the store and dispatch, and fetch nothing themselves.

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

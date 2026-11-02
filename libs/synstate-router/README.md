# synstate-router

A client-side router for [SynState](https://github.com/noshiro-pf/mono/tree/main/libs/synstate) in which every destination, path parameter and search parameter the application writes is checked by the type checker, with no code generation and no module augmentation.

> **Status:** in development, not published yet. This package has the route tree, the parameter codecs, `href`, matching and the router, which follows the browser history; [synstate-router-react](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-router-react) and [synstate-router-dom](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-router-dom) draw it. The design is in [SPEC.md](./SPEC.md) (Japanese).

## What it checks

- **Destinations.** A route node's `href` returns an `Href`, a branded string. A hand-written string, a template literal or a `string` variable is not an `Href`, so `/prodcts/1` fails `tsc` instead of failing in the browser.
- **Parameters.** Path and search parameters are codecs that read the raw string into a value (`param.int` gives a `SafeInt`, `param.literal` a union, `param.refine` a branded type) and are checked when the URL is read, not only declared. A path segment that does not decode means the route does not match; a search value that does not decode is read as absent, or as its default.
- **Branching.** A match is a union keyed by the dotted route id, so a `switch` on `route` narrows `params` and `search`.
- **The tree.** Two routes that would match the same URL, depending on the order they were defined in, are rejected when the tree is defined.

## Example

```ts
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

`createRouter` follows the browser history and passes the match on as a SynState observable. The browser can be injected, and `createMemoryBrowser` keeps a browser's timing (history moves land in a later task), so a store that routes can be tested in Node.

```ts
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

- `push`, `replace` and `follow` (navigating from an observable) take an `Href` only. `back`, `forward` and `go` change the state when the browser fires `popstate`, never before.
- The URL is canonical: `trailingSlash` (`'always'` by default) is applied to every URL read, by `replaceState`, before `match` shows it, and so is `redirect`. A chain of redirects stops after ten. `basePath` must name a path: a relative base such as Vite's `base: './'` throws.
- `match` passes nothing on when the route, params and search stay the same, and keeps the references of what did not change. `at(node)` and `isActive(node)` derive from it.
- Scrolling: to the fragment when the destination has one, to the top when the path changed, and not at all when only the search changed. Back and forward are left to the browser.

## Installation

```sh
npm install synstate-router
```

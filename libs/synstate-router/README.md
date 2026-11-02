# synstate-router

A client-side router for [SynState](https://github.com/noshiro-pf/mono/tree/main/libs/synstate) in which every destination, path parameter and search parameter the application writes is checked by the type checker, with no code generation and no module augmentation.

> **Status:** in development, not published yet. This version has the route tree, the parameter codecs, `href` and matching; the router, which follows the browser history, and the React and synstate-dom bindings follow. The design is in [SPEC.md](./SPEC.md) (Japanese).

## What it checks

- **Destinations.** A route node's `href` returns an `Href`, a branded string. A hand-written string, a template literal or a `string` variable is not an `Href`, so `/prodcts/1` fails `tsc` instead of failing in the browser.
- **Parameters.** Path and search parameters are codecs that read the raw string into a value (`param.int` gives a `SafeInt`, `param.literal` a union, `param.refine` a branded type) and are checked when the URL is read, not only declared. A path segment that does not decode means the route does not match; a search value that does not decode is read as absent.
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

## Installation

```sh
npm install synstate-router
```

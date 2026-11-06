# synstate-router-dom

[synstate-dom](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-dom) bindings for [synstate-router](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-router): a `Routes` that requires a case for every page and rebuilds it only on a new route, and a `Link` that takes an `Href` or an `ExternalHref`, or an observable of either, never a plain string.

> **Status:** at version 0.x, the API may still change in a minor release. The design is in synstate-router's [SPEC.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-router/SPEC.md) (Japanese), section 6.

## Example

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

- **`Routes`** mounts the case of the page the location is. Every page id is a required key of `cases`, so a route added without a case fails `tsc`; `undefined` falls to `notFound`. A case is called once when its page is entered, with an observable of `{ params, search, withSearch }`; new params and search of the same route flow through it, and only a new route mounts another case. `withSearch(patch)` is the `Href` of the same page with part of its search changed.
- **Layouts** nest with `prefix` and `under`: `<Routes prefix cases={...}>` branches on the top-level node the page is under, and its case gets an observable of that node's values. Inside it, `<Routes under={routes.products} cases={...}>` requires the pages of that branch alone. The layout stays mounted while the page moves within its branch.
- **`Link`** takes an `Href`, an `ExternalHref`, or an observable of either, and writes the URL below the base path. It routes a click through `handleLinkClick`, whose rules are in synstate-router: a modified or middle click, `target`, `download` and another origin stay the browser's; a fragment of the current page becomes the browser's own fragment navigation; a click on an icon inside the link counts; a link to the current URL replaces the entry. An `ExternalHref` is never routed, even to this origin.
- **Scrolling**: `Routes` makes the navigation's scroll in a microtask once the update has finished, when the new page is in the document and before the next paint; one scroll per update, however many `Routes` are mounted.

## Installation

```sh
npm install synstate synstate-dom synstate-router synstate-router-dom
```

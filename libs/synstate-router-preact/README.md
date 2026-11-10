# synstate-router-preact

Preact bindings for [synstate-router](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-router): a `Routes` that requires a case for every page, a `Link` that takes an `Href` or an `ExternalHref`, never a plain string, and hooks.

> **Status:** at version 0.x, the API may still change in a minor release. The design is in synstate-router's [SPEC.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-router/SPEC.md) (Japanese), section 5. This package has the same API as [synstate-router-react](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-router-react), on Preact.

## Example

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
const { Routes, Link } = createPreactRouter(router);

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

const App = (): JSX.Element => (
    <>
        <nav>
            <Link to={routes.products.href()}>{'Products'}</Link>
            <Link to={externalHref('https://example.com/help')}>{'Help'}</Link>
        </nav>
        <Routes cases={pages} notFound={notFound} />
    </>
);

assert.strictEqual(
    renderToString(<App />),
    '<nav><a href="/products/">Products</a><a href="https://example.com/help">Help</a></nav><h1>Product 42</h1>',
);
```

- **`Routes`** draws the case of the page the location is. Every page id is a required key of `cases`, so a route added without a case fails `tsc`; `undefined` falls to `notFound`. The element is keyed by the route id (with `prefix`, by the top-level node): a new route remounts it, new params of the same route update it. A case is drawn as a component of its own, so the hooks it calls are its own and are remounted on a new route; one that calls hooks is best a named component (`settings: SettingsPage`), which `react-hooks/rules-of-hooks` accepts. A case receives `{ params, search, withSearch }`, where `withSearch(patch)` is the `Href` of the same page with part of its search changed.
- **Layouts** nest with `prefix` and `under`: `<Routes prefix cases={...}>` branches on the top-level node the page is under, and inside it `<Routes under={routes.products} cases={...}>` requires the pages of that branch alone.
- **`Link`** writes the URL below the base path and routes a click through `handleLinkClick`, whose rules are in synstate-router: a modified or middle click, `target`, `download` and another origin stay the browser's; a fragment of the current page becomes the browser's own fragment navigation; a click on an icon inside the link counts; a link to the current URL replaces the entry. It takes no `ref`: Preact passes none to a function component, and forwarding one would take `preact/compat`.
- **`useRouteMatch`**, **`useAt(node)`** and **`useIsActive(node, { exact })`** read the router's observables with `preact/hooks`, so a router on a memory browser renders with `preact-render-to-string` too.
- **Scrolling**: `Routes` makes the navigation's scroll in a layout effect, once the new page is in the document.

## Installation

```sh
npm install preact synstate synstate-router synstate-router-preact
```

Preact 10 or later. The package imports `preact` and `preact/hooks` only, never `preact/compat`, whose import changes how every element of the application takes its props (`onChange` on a text input becomes `onInput`).

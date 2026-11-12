# synstate-router-react

React bindings for [synstate-router](https://github.com/noshiro-pf/mono/tree/main/libs/synstate-router): a `Routes` that requires a case for every page, a `Link` that takes an `Href` or an `ExternalHref`, never a plain string, and hooks.

> **Status:** at version 0.x, the API may still change in a minor release. The design is in synstate-router's [SPEC.md](https://github.com/noshiro-pf/mono/blob/main/libs/synstate-router/SPEC.md) (Japanese), section 5.

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

- **`Routes`** draws the case of the page the location is. Every page id is a required key of `cases`, so a route added without a case fails `tsc`; `undefined` falls to `notFound`. The element is keyed by the route id (with `prefix`, by the top-level node): a new route remounts it, new params of the same route update it. A case is drawn as a component of its own, so the hooks it calls are its own and are remounted on a new route; one that calls hooks is best a named component (`settings: SettingsPage`), which `react-hooks/rules-of-hooks` accepts. A case receives `{ params, search, withSearch }`, where `withSearch(patch)` is the `Href` of the same page with part of its search changed. Until the router is `ready` (an asynchronous `redirect` for the URL the document was loaded at still pending), it draws its `pending` element instead of any page. With `error`, a case that throws while rendering is replaced by `error({ error, retry })` while the layouts around `Routes` stay drawn; a navigation to another route, or to other params or search, clears it.
- **Layouts** nest with `prefix` and `under`: `<Routes prefix cases={...}>` branches on the top-level node the page is under, and inside it `<Routes under={routes.products} cases={...}>` requires the pages of that branch alone.
- **`Link`** writes the URL below the base path and routes a click through `handleLinkClick`, whose rules are in synstate-router: a modified or middle click, `target`, `download` and another origin stay the browser's; a fragment of the current page becomes the browser's own fragment navigation; a click on an icon inside the link counts; a link to the current URL replaces the entry. `viewTransition` makes the navigation inside a View Transition; React's own `<ViewTransition>` (React 19.3 or later) around a case is the other way to animate it.
- **`useBlocker(shouldBlock)`** blocks leaving the page while the component is mounted (`router.block`) and returns the blocker's state, `'blocked'` with `proceed` and `reset` while a navigation waits for the user's answer.
- **`useRouteMatch`**, **`useBranch`** (the matched nodes with their `meta`, for a breadcrumb), **`useAt(node)`** and **`useIsActive(node, { exact })`** read the router's observables with `useSyncExternalStore`, whose server snapshot is the same value, so a router on a memory browser renders on a server.
- **Scrolling**: `Routes` makes the navigation's scroll in a layout effect, once the new page is in the document. A page behind `Suspense`, such as a `React.lazy` case, commits its fallback first; the router then waits for the fragment's element and scrolls to it once the page draws it.

## A page loaded later

The route tree holds no components, so a case can return a `React.lazy` page under its own `Suspense` boundary: the page is split out of the main bundle, and the layouts around `Routes` stay drawn while it loads. A link to a fragment of such a page scrolls once the page draws the element.

```tsx
const routes = defineRoutes({
    home: { segment: '' },
    reports: {},
});

const router = createRouter(routes, {
    browser: createMemoryBrowser('https://example.com/reports/'),
});

const { Routes } = createReactRouter(router);

// In an application: `React.lazy(() => import('./reports-page.js'))`, which
// the bundler splits into a chunk of its own.
const ReportsPage = React.lazy(
    async () =>
        new Promise<Readonly<{ default: () => React.JSX.Element }>>(() => {
            // Never settles here, so that the fallback is what is drawn.
        }),
);

const pages: PageCases<typeof routes, 'home' | 'reports'> = {
    home: () => <h1>{'Home'}</h1>,
    // The case itself is the `Suspense` boundary: the layouts around `Routes`
    // stay drawn while the page loads.
    reports: () => (
        <React.Suspense fallback={<p>{'Loading…'}</p>}>
            <ReportsPage />
        </React.Suspense>
    ),
} as const;

assert.strictEqual(
    renderToStaticMarkup(<Routes cases={pages} />),
    '<p>Loading…</p>',
);
```

## Installation

```sh
npm install synstate synstate-router synstate-router-react
```

React 19 or later: `Link` passes `ref` on as a prop, which React 18 does not.

# synstate-router-dom-sample-app

The app of [synstate-router-react-sample-app](../synstate-router-react-sample-app), built on [synstate-dom](../../libs/synstate-dom) with [synstate-router](../../libs/synstate-router) and [synstate-router-dom](../../libs/synstate-router-dom), served by the Vite dev server. It draws the same pages, and its Playwright config runs that app's e2e suite against it, so one suite checks both and is the browser check of synstate-router-dom.

The two apps differ in where the requests live:

- **React** keeps them in a [global store](../synstate-router-react-sample-app/src/store/), because a React component runs on every render: a request built in it would be built again each time, and its lifetime is not the page's.
- **synstate-dom** builds them in the page itself (`src/components/product-list-page.tsx`, `product-page.tsx`). A component runs once, when its `Routes` case is entered, and what it creates lives in its scope, so the graph is built once per visit and disposed when the page is left, which aborts a request still in flight. The page receives its params and search as an observable (`list$`, `item$`); a new query or id flows through it to `switchMap`, which aborts the request it replaces. Nothing is fetched while the page is not drawn, with no `idle` state to model it.

The rest follows the React app:

- **Routes and links** (`src/routes.mts`): one `defineRoutes`, the router, and the `Routes` and `Link` that `createRouterComponents` binds to it. synstate-dom has no context, so they are made once there and imported. A link's current state is `router.isActive` (`src/components/nav-link.tsx`).
- **A fake server** (`src/api/`): the same one, which answers after 150 ms and honors the `AbortSignal`.
- **Search and path parameters, layouts, the redirect and scrolling**: as there. A `Routes` case is a function called once on entering its page, so the cases are written in place.

## Run

From the repository root, build the workspace once so that the libraries have a `dist/`:

```sh
pnpm install
pnpm run ws:build
```

Then start the dev server:

```sh
cd apps/synstate-router-dom-sample-app
pnpm run dev
```

It listens on <http://localhost:5200> (`tools/configs/app-dev-ports.mts`). The dev server reads the libraries from their `dist/`, so rebuild a library (`pnpm run build` in it) to see a change to it.

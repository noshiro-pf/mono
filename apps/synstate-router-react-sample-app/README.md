# synstate-router-react-sample-app

A small React app built with [synstate-router](../../libs/synstate-router) and [synstate-router-react](../../libs/synstate-router-react), served by the Vite dev server. Its e2e suite is the browser check of both packages, and [synstate-router-dom-sample-app](../synstate-router-dom-sample-app) runs it too, against the same pages built on synstate-dom; `e2e/data.spec.mts` holds the page's clock to read what is drawn while a request is in flight.

What it shows:

- **Routes and links** (`src/routes.mts`): one `defineRoutes` for the app, the router, and the `Routes`, `Link` and `useIsActive` bound to it. Every link is an `Href` made by a route node.
- **Data in a global store** (`src/store/`): the components fetch nothing. `productList$` and `productDetail$` are built once, at module level, from the router's observables: the query of the list page, and the `productId` of the product page, each through `switchMap` to a request (`fromAbortablePromise`), so moving on aborts the request before. They hold `AsyncData` from ts-std-forge: idle while the page is not the current one, pending while its request is in flight, then the answer or the error. The components only read the store (`useObservableValue`) and dispatch: `searchProducts`, or a navigation through a `Link`. A page opened from its URL is fetched at once, because `switchMap` projects the value the location already has.
- **A fake server** (`src/api/`): `GET /api/products` answers one page of summaries (id, name, price), filtered, sorted and paged by the server; `GET /api/products/{id}` answers the detail the product page needs, or nothing for a 404. Both answer after 150 ms and honor the `AbortSignal`.
- **Search parameters** (`src/routes.mts`, `src/components/product-list-page.tsx`): `q`, `sort` (`search.literal` with a default) and `page` (`search.refine` to a branded page number). A value that does not decode reads as absent or as its default. Typing a search rewrites the history entry with `router.setSearch`; the sort and page links come from `withSearch`.
- **Path parameters** (`src/components/product-page.tsx`): `/products/abc/` is not found, since `productId` is `param.int`; `/products/99/` matches, and the page says there is no such product when the server answers 404. The page keeps its layout while it loads, so a `#reviews` link has its element to scroll to, and the element does not move when the product arrives.
- **Layouts** (`src/components/app.tsx`, `settings-layout.tsx`): a `prefix` `Routes` for the sections, and `under` for the pages of one section. The settings layout stays mounted between its tabs.
- **Redirect**: `/settings/` leads to `/settings/profile/`.
- **Scrolling**: a fragment link scrolls to its element, also when the page is opened with the fragment; a new page starts at the top.

The `cases` of each `Routes` are written once at the top level of their module, so that `Routes` gets the same object every render, which is what the React lint rules ask for.

## Run

From the repository root, build the workspace once so that the libraries have a `dist/`:

```sh
pnpm install
pnpm run ws:build
```

Then start the dev server:

```sh
cd apps/synstate-router-react-sample-app
pnpm run dev
```

It listens on <http://localhost:5199> (`tools/configs/app-dev-ports.mts`). The dev server reads the libraries from their `dist/`, so rebuild a library (`pnpm run build` in it) to see a change to it.

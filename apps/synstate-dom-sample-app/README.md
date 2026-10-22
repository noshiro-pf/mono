# synstate-dom-sample-app

A small app built with [synstate-dom](../../libs/synstate-dom), served by the Vite dev server.

It shows a counter, a todo list (`For`, `If`, `class` bindings), a stopwatch whose timer is disposed together with the `If` branch it lives in, and a dialog mounted through `Portal`.

## Run

From the repository root, build the workspace once so that `synstate` and `synstate-dom` have a `dist/`:

```sh
pnpm install
pnpm run ws:build
```

Then start the dev server:

```sh
cd apps/synstate-dom-sample-app
pnpm run dev
```

It listens on <http://localhost:5196> (`tools/configs/app-dev-ports.mts`). The dev server reads `synstate-dom` from its `dist/`, so rebuild that package (`pnpm run build` in `libs/synstate-dom`) to see a change to the library.

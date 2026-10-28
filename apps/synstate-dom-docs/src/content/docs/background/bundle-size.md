---
title: Bundle size
description: The minified and compressed size of the same applications written with synstate-dom, Solid, Preact + Signals, Preact, React and VanJS, bundled by the same Vite.
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) also measures how much each library adds to an application. Its `pnpm run bundle-size` takes the implementations the [benchmark](/mono/synstate-dom/background/benchmark/) times and bundles them one application and one library at a time, then minifies and compresses each bundle. The figures below come from that app's [`BUNDLE-SIZE.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/BUNDLE-SIZE.md).

## What is measured

- **everything exported**: every export of the library's entry points, kept whole, so nothing is shaken off. synstate-dom counts `synstate-dom` and `synstate`; Solid `solid-js` and `solid-js/web`; Preact `preact` and `preact/hooks`, plus `@preact/signals` for Preact + Signals; React `react`, `react-dom` and `react-dom/client`; VanJS `vanjs-core`. Treat it as an upper bound: no application actually ships all of it.
- **counter**: a button that shows a count and adds one when clicked, written in each library's own idiom. This is what a library costs you before you write any application code.
- **js-framework-benchmark table**: the table of the [benchmark](/mono/synstate-dom/background/benchmark/), with its eight operations.
- **loan**, **schedule** and **zoom scenarios**: the three [scenarios](/mono/synstate-dom/background/benchmark/#scenarios) of the benchmark.

Every bundle is built by the same Vite (Rolldown, with Oxc's minifier), with the same configuration as the timed runs: the production build of every library, the production JSX runtimes, and Solid's files passed through `vite-plugin-solid`. So every library is tree-shaken the same way, and the code whose size you see is the code that was timed. Code the implementations share (the table's row factory and each scenario's model) is included in every column.

## Results

<!-- bundle-size:environment -->

Bundled by Vite 8.3.4. Versions: `synstate-dom 0.3.0`, `synstate 6.0.0`, `solid-js 1.9.17`, `preact 10.29.8`, `@preact/signals 2.11.3`, `react 19.3.1`, `react-dom 19.3.1`, `vanjs-core 1.6.1`.

<!-- /bundle-size -->

### Minified and gzipped

gzip at level 9. One kB is 1,000 bytes; smaller is better.

<!-- bundle-size:gzip -->

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         15.2 |  14.7 |              9.3 |    6.2 |  67.7 |   1.2 |
| counter                      |          8.3 |   4.0 |              7.9 |    5.4 |  67.5 |   1.2 |
| js-framework-benchmark table |         10.6 |   5.1 |              8.7 |    8.3 |  68.3 |   1.9 |
| loan scenario                |         10.8 |   4.8 |              9.1 |    6.7 |  68.7 |   2.4 |
| schedule scenario            |         10.8 |   4.2 |              8.5 |    6.1 |  68.1 |   1.7 |
| zoom scenario                |         10.5 |   3.9 |              8.2 |    5.9 |  67.9 |   1.5 |

<!-- /bundle-size -->

### Minified and Brotli-compressed

Brotli at quality 11.

<!-- bundle-size:brotli -->

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         13.7 |  13.4 |              8.5 |    5.6 |  58.3 |   1.1 |
| counter                      |          7.5 |   3.6 |              7.3 |    4.9 |  58.2 |   1.1 |
| js-framework-benchmark table |          9.7 |   4.6 |              8.0 |    7.6 |  58.9 |   1.8 |
| loan scenario                |          9.8 |   4.4 |              8.3 |    6.1 |  59.2 |   2.1 |
| schedule scenario            |          9.8 |   3.8 |              7.8 |    5.6 |  58.7 |   1.6 |
| zoom scenario                |          9.6 |   3.6 |              7.6 |    5.4 |  58.5 |   1.4 |

<!-- /bundle-size -->

## Reading the results

- **The counter row is the floor.** On top of it, an application adds only its own code and the parts of the library it uses, and in these applications that comes to a few kB at most for every library. The order of the libraries is set by the counter row and stays the same in the rows below it.
- **React** is mostly react-dom, whatever the application. Its reconciler and scheduler do not split by what a component uses, so the rows differ by only about a kB.
- **VanJS** is one small module with nothing to shake off, so even the counter includes all of it.
- **Solid** compiles JSX into templates and calls into a small runtime, so a counter uses only a little of `solid-js/web`. Everything it exports is several times that.
- **Preact** is a small virtual DOM; Signals adds its reactive core and the integration that binds a signal to the DOM. The Preact table is larger than everything exported because its rows use `memo` from `preact/compat`, which the everything-exported row does not count.
- **synstate-dom** carries synstate's propagation core (the graph, its depth-ordered pass and scopes), its own JSX runtime and binding tables, and the helpers both import from ts-data-forge and ts-std-forge. It is the largest after React in every row. If your application already uses synstate, though, you pay for that core only once, and in the scenarios, whose models use ts-data-forge in every column, synstate-dom shares those helpers with them.
- **Everything exported** is largest, after React, for synstate-dom and Solid. synstate exports a full set of operators, as RxJS does, but an application keeps only the ones it imports.

## Running it

```sh
pnpm run ws:build            # synstate-dom and synstate are imported from dist/
cd apps/synstate-dom-benchmark
pnpm run bundle-size         # rewrites BUNDLE-SIZE.md
cd ../synstate-dom-docs
pnpm run gen:bundle-size     # embeds BUNDLE-SIZE.md into this page
```

The sizes depend only on the sources and the installed versions, so one run is enough. None of this runs in CI, so BUNDLE-SIZE.md reflects the tree it was last run on.

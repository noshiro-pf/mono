---
title: Bundle size
description: The minified and compressed size of the same applications written with synstate-dom, Solid, Preact + Signals, Preact, React and VanJS, bundled by the same Vite.
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) also measures how much each library adds to an application. Its `pnpm run bundle-size` takes the implementations the [benchmark](/mono/synstate-dom/background/benchmark/) times and bundles them one application and one library at a time, then minifies and compresses each bundle. The figures below come from that app's [`BUNDLE-SIZE.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/BUNDLE-SIZE.md).

## What is measured

- **everything exported**: every export of the library's entry points, kept whole, so nothing is shaken off. synstate-dom counts `synstate-dom` and `synstate`; Solid `solid-js` and `solid-js/web`; Preact `preact` and `preact/hooks`, plus `@preact/signals` for Preact + Signals; React `react`, `react-dom` and `react-dom/client`; VanJS `vanjs-core`. Treat it as an upper bound: no application actually ships all of it.
- **counter**: a button that shows a count and adds one when clicked, written in each library's own idiom. This is roughly what a library costs you before you write any application code.
- **js-framework-benchmark table**: the table of the [benchmark](/mono/synstate-dom/background/benchmark/), with its eight operations.
- **loan**, **schedule** and **zoom scenarios**: the three [scenarios](/mono/synstate-dom/background/benchmark/#scenarios) of the benchmark.

Every bundle is built by the same Vite (Rolldown, with Oxc's minifier), with the same configuration as the timed runs: the production build of every library, the production JSX runtimes, and Solid's files passed through `vite-plugin-solid`. So every library is tree-shaken the same way, and the code whose size you see is the code that was timed. Code the implementations share (the table's row factory and each scenario's model) is included in every column.

## Results

<!-- bundle-size:environment -->

Bundled by Vite 8.3.5. Versions: `synstate-dom 0.9.0`, `synstate 8.0.0`, `solid-js 1.9.17`, `preact 10.29.8`, `@preact/signals 2.11.3`, `react 19.3.1`, `react-dom 19.3.1`, `vanjs-core 1.6.1`.

<!-- /bundle-size -->

### Minified and gzipped

gzip at level 9. One kB is 1,000 bytes; smaller is better.

<!-- bundle-size:gzip -->

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         12.8 |  14.7 |              9.3 |    6.2 |  67.7 |   1.2 |
| counter                      |          6.7 |   4.0 |              7.9 |    5.4 |  67.5 |   1.2 |
| js-framework-benchmark table |          8.8 |   5.1 |              8.7 |    8.3 |  68.3 |   2.0 |
| loan scenario                |          7.6 |   4.2 |              8.5 |    6.1 |  68.1 |   1.8 |
| schedule scenario            |          7.6 |   4.2 |              8.5 |    6.1 |  68.2 |   1.8 |
| zoom scenario                |          7.3 |   4.0 |              8.3 |    5.9 |  67.9 |   1.5 |

<!-- /bundle-size -->

### Minified and Brotli-compressed

Brotli at quality 11.

<!-- bundle-size:brotli -->

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         11.5 |  13.4 |              8.5 |    5.6 |  58.3 |   1.1 |
| counter                      |          6.1 |   3.6 |              7.3 |    4.9 |  58.2 |   1.1 |
| js-framework-benchmark table |          8.0 |   4.7 |              8.0 |    7.6 |  58.9 |   1.8 |
| loan scenario                |          6.9 |   3.8 |              7.8 |    5.6 |  58.7 |   1.6 |
| schedule scenario            |          6.9 |   3.8 |              7.8 |    5.6 |  58.7 |   1.6 |
| zoom scenario                |          6.7 |   3.6 |              7.6 |    5.4 |  58.5 |   1.4 |

<!-- /bundle-size -->

## Reading the results

<!-- `checkReadingTheResults` in scripts/embed-bundle-size.mts checks the sentences below against the tables and fails `gen:bundle-size` when one no longer holds. It quotes them word for word, so a reworded sentence is reworded there too, and a new claim about an order or a margin gets a case there. -->

- **The counter row is the baseline.** The applications below it differ from it by their own code and by the parts of the library they use, and in these applications every row below the counter stays within a few kB of it for every library. The rows below it keep the counter row's order of the libraries, except that synstate-dom and Preact + Signals, within about a kB of each other from the counter row down, may change places.
- **React** is mostly react-dom, whatever the application. Its reconciler and scheduler do not split by what a component uses, so the rows differ by only about a kB.
- **VanJS** is one small module with nothing to shake off, so even the counter includes all of it.
- **Solid** compiles JSX into templates and calls into a small runtime, so a counter uses only a little of `solid-js/web`. Everything it exports is several times that.
- **Preact** is a small virtual DOM; Signals adds its reactive core and the integration that binds a signal to the DOM. The Preact table is larger than everything exported because its rows use `memo` from `preact/compat`, which the everything-exported row does not count.
- **synstate-dom** carries synstate's propagation core (the graph, its depth-ordered pass and scopes), its own JSX runtime and binding tables, and the helpers both import from ts-data-forge and ts-std-forge. synstate-dom and Preact + Signals are the largest after React in every row but everything exported. If your application already uses synstate, though, you pay for that core only once, and in the scenarios, whose models use ts-data-forge in every column, synstate-dom shares those helpers with them.
- **Everything exported**: synstate-dom and Solid are the largest after React in this row. synstate exports a full set of operators, as RxJS does, but an application keeps only the ones it imports.

## Running it

```sh
pnpm run ws:build            # synstate-dom and synstate are imported from dist/
cd apps/synstate-dom-benchmark
pnpm run bundle-size         # rewrites BUNDLE-SIZE.md
cd ../synstate-dom-docs
pnpm run gen:bundle-size     # embeds BUNDLE-SIZE.md into this page
```

The sizes depend only on the sources and the installed versions, so one run is enough. None of this runs in CI, so BUNDLE-SIZE.md reflects the tree it was last run on.

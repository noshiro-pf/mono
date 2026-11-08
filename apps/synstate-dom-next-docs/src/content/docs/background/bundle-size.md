---
title: Bundle size
description: The minified and compressed size of the same applications written with synstate-dom, synstate-dom-next and Solid, bundled by the same Vite.
---

[`apps/synstate-dom-benchmark`](https://github.com/noshiro-pf/mono/tree/main/apps/synstate-dom-benchmark) also measures how much each library adds to an application. Its `pnpm run bundle-size -- --next` takes the implementations the [benchmark](/mono/synstate-dom-next/background/benchmark/) times and bundles them one application and one library at a time, then minifies and compresses each bundle. The figures below come from that app's [`BUNDLE-SIZE-NEXT.md`](https://github.com/noshiro-pf/mono/blob/main/apps/synstate-dom-benchmark/BUNDLE-SIZE-NEXT.md); the comparison with Preact + Signals, Preact, React and VanJS is on [synstate-dom's site](https://noshiro-pf.github.io/mono/synstate-dom/background/bundle-size/).

## What is measured

- **everything exported**: every export of the library's entry points, kept whole, so nothing is shaken off. synstate-dom-next counts `synstate-dom-next` and `synstate-next`; synstate-dom `synstate-dom` and `synstate`; Solid `solid-js` and `solid-js/web`. Treat it as an upper bound: no application actually ships all of it.
- **counter**: a button that shows a count and adds one when clicked, written in each library's own idiom. This is roughly what a library costs you before you write any application code.
- **js-framework-benchmark table**: the table of the [benchmark](/mono/synstate-dom-next/background/benchmark/), with its eight operations.
- **loan**, **schedule** and **zoom scenarios**: the three [scenarios](/mono/synstate-dom-next/background/benchmark/#scenarios) of the benchmark.

Every bundle is built by the same Vite (Rolldown, with Oxc's minifier), with the same configuration as the timed runs: the production build of every library, the production JSX runtimes, and Solid's files passed through `vite-plugin-solid`. So every library is tree-shaken the same way, and the code whose size you see is the code that was timed. Code the implementations share (the table's row factory and each scenario's model) is included in every column.

## Results

<!-- bundle-size:environment -->

Bundled by Vite 8.3.5. Versions: `synstate-dom 0.8.0`, `synstate 7.0.2`, `synstate-dom-next 0.0.0`, `synstate-next 0.0.0`, `solid-js 1.9.17`.

<!-- /bundle-size -->

### Minified and gzipped

gzip at level 9. One kB is 1,000 bytes; smaller is better.

<!-- bundle-size:gzip -->

| application (kB)             | synstate-dom | synstate-dom-next | Solid |
| :--------------------------- | -----------: | ----------------: | ----: |
| everything exported          |         12.8 |              11.9 |  14.7 |
| counter                      |          6.7 |               6.6 |   4.0 |
| js-framework-benchmark table |          8.8 |               9.1 |   5.1 |
| loan scenario                |          7.6 |               7.3 |   4.2 |
| schedule scenario            |          7.6 |               7.3 |   4.2 |
| zoom scenario                |          7.4 |               7.1 |   4.0 |

<!-- /bundle-size -->

### Minified and Brotli-compressed

Brotli at quality 11.

<!-- bundle-size:brotli -->

| application (kB)             | synstate-dom | synstate-dom-next | Solid |
| :--------------------------- | -----------: | ----------------: | ----: |
| everything exported          |         11.5 |              10.8 |  13.4 |
| counter                      |          6.1 |               6.0 |   3.6 |
| js-framework-benchmark table |          8.0 |               8.3 |   4.7 |
| loan scenario                |          6.9 |               6.6 |   3.8 |
| schedule scenario            |          6.9 |               6.7 |   3.8 |
| zoom scenario                |          6.7 |               6.4 |   3.6 |

<!-- /bundle-size -->

## Reading the results

The figures quoted here are the gzipped ones.

- **The counter row is the baseline**: <!-- bundle-size:counter-next -->6.6<!-- /bundle-size --> kB for synstate-dom-next, <!-- bundle-size:counter-dom -->6.7<!-- /bundle-size --> kB for synstate-dom and <!-- bundle-size:counter-solid -->4.0<!-- /bundle-size --> kB for Solid. Even a counter carries synstate-next's propagation core (owners, the per-depth queue, and the loop that recomputes the values) and the JSX runtime that turns a description into nodes and bindings. Solid compiles JSX into templates and calls into a small runtime, so a counter uses only a little of `solid-js/web`.
- **The rebuild is not a size project.** It replaced closures and subscriber records by classes whose methods are shared on a prototype, and dropped completion and reference counting, which takes code away; it also added the checks that let a branch component drop a branch before it recomputes, keyed rows that keep a state each, and `selector`, which bring code in. In the loan scenario, synstate-dom-next is <!-- bundle-size:loan-next -->7.3<!-- /bundle-size --> kB against synstate-dom's <!-- bundle-size:loan-dom -->7.6<!-- /bundle-size --> kB.
- **The table** is <!-- bundle-size:table-next -->9.1<!-- /bundle-size --> kB, against synstate-dom's <!-- bundle-size:table-dom -->8.8<!-- /bundle-size --> kB and Solid's <!-- bundle-size:table-solid -->5.1<!-- /bundle-size --> kB. It is the one application that uses `For` with keys and `selector`, which only it pulls in.
- **Everything exported** is <!-- bundle-size:everything-next -->11.9<!-- /bundle-size --> kB, against synstate-dom's <!-- bundle-size:everything-dom -->12.8<!-- /bundle-size --> kB and Solid's <!-- bundle-size:everything-solid -->14.7<!-- /bundle-size --> kB. synstate-next exports a full set of operators, as synstate does, but an application keeps only the ones it imports. The scenarios' models use ts-data-forge in every column, and synstate-dom-next shares those helpers with them.

## Running it

```sh
pnpm run ws:build                  # the libraries are imported from dist/
cd apps/synstate-dom-benchmark
pnpm run bundle-size -- --next     # rewrites BUNDLE-SIZE-NEXT.md
cd ../synstate-dom-next-docs
pnpm run gen:bundle-size           # embeds BUNDLE-SIZE-NEXT.md into this page
```

The sizes depend only on the sources and the installed versions, so one run is enough. None of this runs in CI, so BUNDLE-SIZE-NEXT.md reflects the tree it was last run on.

---
title: Bundle Size
description: What SynState and each library of the benchmark add to an application, dependencies included, for the code each benchmark scenario uses.
sidebar:
    order: 7
---

The [benchmark](/mono/synstate/guides/library-comparison/benchmark/) times each library; this page measures what each one costs to ship. For every scenario, the exports that the scenario's implementation imports from the library are bundled with everything they depend on, then minified and compressed. The figures are measured by `pnpm run bundle-size` in `apps/synstate-docs` and committed with the page; the versions they were measured with are listed under Results. synstate-dom is compared with UI frameworks on [its own bundle-size page](/mono/synstate-dom/background/bundle-size/).

## What Is Measured

- **Everything exported**: every export of the library's entry point, kept whole: `synstate`, `rxjs`, `mobx`, `jotai/vanilla` with `jotai/vanilla/utils`, `@reduxjs/toolkit`, `solid-js`, `@preact/signals-core`, `zustand/vanilla` and `valtio/vanilla`. Treat it as an upper bound: an application keeps only what it imports. Jotai is measured through its vanilla entry points, which export the same functions without the React bindings.
- **A scenario row**: the exports that the scenario's implementation imports, for example `createState`, `derive` and `map` from `synstate` in the diamond, each kept alive so that none is shaken off. The bundle is the library code that implementation needs. The implementation's own loops and the ts-data-forge helpers the benchmark harness calls are not counted: they would count against every library except SynState, which depends on ts-data-forge itself. Where the benchmark measures a library twice, the row uses its natural form, not the one labelled "(naive …)". A dash marks a scenario the library is not measured in.
- **Dependencies included**: `synstate` is bundled with `ts-data-forge` and `ts-std-forge`, Redux Toolkit with Redux, Immer and Reselect, and RxJS with tslib. This is what an application downloads. The size quoted on the [home page](/mono/synstate/), in the [introduction](/mono/synstate/getting-started/introduction/) and in the README is of `synstate` alone instead: every export, bundled by esbuild as here but with ts-data-forge and ts-std-forge left out, <!-- bundle-size:comparison-synstate-alone -->7.7 kB<!-- /bundle-size:comparison-synstate-alone --> minified and gzipped. The site's generators measure it from the current sources, so it can be ahead of the tables below.

Every bundle is built twice, for the browser and minified, with the production build of every library (`process.env.NODE_ENV` and `import.meta.env.MODE` set to `production`): by Vite in production mode, resolving the `browser` and `production` export conditions, and by esbuild, without license comments. The two bundlers do not shake off the same code, and the difference is far larger for some libraries than for others, so both are shown. gzip runs at level 9, Brotli at quality 11. One kB is 1,000 bytes; smaller is better.

## Results

<!-- bundle-size:comparison-environment -->

Bundled by Vite 8.3.5 and esbuild 0.28.2. `synstate`, `ts-data-forge` and `ts-std-forge` are built from this repository's sources, which can be ahead of the versions their manifests name (`synstate 7.0.0`, `ts-data-forge 14.11.0`, `ts-std-forge 0.5.3`). Versions of the others: `rxjs 7.8.2`, `jotai 3.0.1`, `mobx 7.1.0`, `@reduxjs/toolkit 2.13.0`, `zustand 5.0.15`, `valtio 2.3.2`, `solid-js 1.9.17`, `@preact/signals-core 1.14.4`.

<!-- /bundle-size:comparison-environment -->

### Vite: Minified and Gzipped

<!-- bundle-size:comparison-gzip -->

| Scenario (kB)                                                                                           | **SynState** | RxJS | MobX | Jotai | Redux | Solid | Preact Signals | Zustand | Valtio |
| :------------------------------------------------------------------------------------------------------ | -----------: | ---: | ---: | ----: | ----: | ----: | -------------: | ------: | -----: |
| Everything exported                                                                                     |          8.4 | 17.5 | 15.1 |   4.8 |  14.2 |   8.4 |            2.0 |     0.3 |    1.5 |
| [Single state](/mono/synstate/guides/library-comparison/benchmark/#scenario-single-state)               |          3.2 |  3.3 | 11.3 |   2.4 |   7.1 |   2.3 |            1.6 |     0.2 |    1.0 |
| [Derived chain](/mono/synstate/guides/library-comparison/benchmark/#scenario-derived-chain)             |          3.8 |  3.6 | 11.3 |   2.4 |   8.5 |   2.4 |            1.6 |       — |      — |
| [Diamond](/mono/synstate/guides/library-comparison/benchmark/#scenario-diamond-dependency)              |          4.1 |  6.0 | 11.3 |   2.4 |   8.5 |   2.4 |            1.6 |       — |      — |
| [Deep chain](/mono/synstate/guides/library-comparison/benchmark/#scenario-deep-chain-throughput)        |          3.4 |  6.1 | 11.4 |   2.5 |   3.8 |   2.4 |            1.6 |       — |      — |
| [Cascaded diamond](/mono/synstate/guides/library-comparison/benchmark/#scenario-cascaded-diamond)       |          4.1 |  6.0 | 11.3 |   2.4 |   8.5 |   2.4 |            1.6 |       — |      — |
| [Conditional fan-out](/mono/synstate/guides/library-comparison/benchmark/#scenario-conditional-fan-out) |          4.3 |  5.7 | 11.3 |   2.4 |   3.8 |   2.4 |            1.6 |       — |      — |
| [Equality cut-off](/mono/synstate/guides/library-comparison/benchmark/#scenario-equality-cut-off)       |          3.8 |  6.0 | 11.3 |   2.4 |   8.5 |   2.4 |            1.6 |       — |      — |

<!-- /bundle-size:comparison-gzip -->

### Vite: Minified and Brotli-Compressed

<!-- bundle-size:comparison-brotli -->

| Scenario (kB)                                                                                           | **SynState** | RxJS | MobX | Jotai | Redux | Solid | Preact Signals | Zustand | Valtio |
| :------------------------------------------------------------------------------------------------------ | -----------: | ---: | ---: | ----: | ----: | ----: | -------------: | ------: | -----: |
| Everything exported                                                                                     |          7.6 | 15.8 | 13.7 |   4.4 |  13.0 |   7.7 |            1.8 |     0.3 |    1.4 |
| [Single state](/mono/synstate/guides/library-comparison/benchmark/#scenario-single-state)               |          3.0 |  3.0 | 10.3 |   2.2 |   6.5 |   2.1 |            1.5 |     0.2 |    0.9 |
| [Derived chain](/mono/synstate/guides/library-comparison/benchmark/#scenario-derived-chain)             |          3.5 |  3.2 | 10.3 |   2.2 |   7.8 |   2.2 |            1.5 |       — |      — |
| [Diamond](/mono/synstate/guides/library-comparison/benchmark/#scenario-diamond-dependency)              |          3.8 |  5.5 | 10.3 |   2.2 |   7.8 |   2.2 |            1.5 |       — |      — |
| [Deep chain](/mono/synstate/guides/library-comparison/benchmark/#scenario-deep-chain-throughput)        |          3.0 |  5.5 | 10.4 |   2.3 |   3.4 |   2.2 |            1.5 |       — |      — |
| [Cascaded diamond](/mono/synstate/guides/library-comparison/benchmark/#scenario-cascaded-diamond)       |          3.8 |  5.5 | 10.3 |   2.2 |   7.8 |   2.2 |            1.5 |       — |      — |
| [Conditional fan-out](/mono/synstate/guides/library-comparison/benchmark/#scenario-conditional-fan-out) |          4.0 |  5.2 | 10.3 |   2.2 |   3.4 |   2.2 |            1.5 |       — |      — |
| [Equality cut-off](/mono/synstate/guides/library-comparison/benchmark/#scenario-equality-cut-off)       |          3.5 |  5.5 | 10.3 |   2.2 |   7.8 |   2.2 |            1.5 |       — |      — |

<!-- /bundle-size:comparison-brotli -->

### esbuild: Minified and Gzipped

<!-- bundle-size:comparison-esbuild-gzip -->

| Scenario (kB)                                                                                           | **SynState** | RxJS | MobX | Jotai | Redux | Solid | Preact Signals | Zustand | Valtio |
| :------------------------------------------------------------------------------------------------------ | -----------: | ---: | ---: | ----: | ----: | ----: | -------------: | ------: | -----: |
| Everything exported                                                                                     |          9.8 | 18.6 | 15.8 |   5.1 |  15.2 |   8.7 |            2.0 |     0.3 |    1.6 |
| [Single state](/mono/synstate/guides/library-comparison/benchmark/#scenario-single-state)               |          3.8 |  3.5 | 12.0 |   2.5 |   8.5 |   2.7 |            1.6 |     0.3 |    1.0 |
| [Derived chain](/mono/synstate/guides/library-comparison/benchmark/#scenario-derived-chain)             |          4.4 |  3.8 | 11.9 |   2.5 |  10.1 |   2.8 |            1.7 |       — |      — |
| [Diamond](/mono/synstate/guides/library-comparison/benchmark/#scenario-diamond-dependency)              |          4.7 |  6.4 | 11.9 |   2.5 |  10.1 |   2.8 |            1.7 |       — |      — |
| [Deep chain](/mono/synstate/guides/library-comparison/benchmark/#scenario-deep-chain-throughput)        |          3.9 |  6.4 | 12.1 |   2.7 |   5.1 |   2.8 |            1.7 |       — |      — |
| [Cascaded diamond](/mono/synstate/guides/library-comparison/benchmark/#scenario-cascaded-diamond)       |          4.7 |  6.4 | 11.9 |   2.5 |  10.1 |   2.8 |            1.7 |       — |      — |
| [Conditional fan-out](/mono/synstate/guides/library-comparison/benchmark/#scenario-conditional-fan-out) |          5.0 |  6.1 | 11.9 |   2.5 |   5.1 |   2.8 |            1.7 |       — |      — |
| [Equality cut-off](/mono/synstate/guides/library-comparison/benchmark/#scenario-equality-cut-off)       |          4.4 |  6.4 | 11.9 |   2.5 |  10.1 |   2.8 |            1.7 |       — |      — |

<!-- /bundle-size:comparison-esbuild-gzip -->

## Where SynState's Bytes Come From

SynState's single-state bundle, which imports `createState` alone, split by the package its code comes from, as a share of the bundle. esbuild reports each module's minified bytes; Rolldown, under Vite, reports each module's length before the chunk is minified, so the Vite column is a share of the code before minification.

<!-- bundle-size:comparison-breakdown -->

| Package                           | Vite | esbuild |
| :-------------------------------- | ---: | ------: |
| `synstate`                        |  57% |     47% |
| `ts-std-forge`                    |  19% |     31% |
| `ts-data-forge`                   |  24% |     22% |
| Bundle, minified and gzipped (kB) |  3.2 |     3.8 |

<!-- /bundle-size:comparison-breakdown -->

<!-- `claimsOfTheResults` in scripts/embed-bundle-size.mts quotes the claims of this paragraph and of "Reading the Results" word for word and fails `gen:bundle-size` when the figures no longer bear one out. A reworded claim is re-quoted there, and a new claim about an order or a margin gets a case there. -->

The largest share is `synstate` itself. The rest is ts-data-forge and ts-std-forge, which ts-data-forge builds on and re-exports. `synstate` imports `Arr` from the `ts-data-forge/array` subpath, standalone functions from both packages (`panic` from ts-std-forge, for example), and the `Optional` and `Result` objects, which ts-std-forge defines and ts-data-forge re-exports. The single-state bundle uses `Optional`. esbuild keeps such an object whole once a member of it is used, so under esbuild the ts-std-forge share includes members of `Optional` that `synstate` never calls. Neither package brings in a third package's code (their one other dependency, ts-type-forge, ships only types), so no other package is in the bundle. An application that already uses ts-data-forge pays for that part once, shared with its own code.

## Reading the Results

- **SynState** is 5 kB or under in every scenario row with either bundler. In every row it is smaller than MobX, and in every scenario beyond the single state and the derived chain (the diamond, the deep chain, the cascaded diamond, the conditional fan-out and the equality cut-off) it is smaller than RxJS as well. In every scenario row its esbuild figure is within 1 kB of its Vite figure.
- **RxJS** keeps each operator in a module of its own, so a row grows with the operators its implementation imports: `BehaviorSubject` alone in the single state, `combineLatest` and `map` as well in the diamond.
- **MobX** keeps most of the library as soon as any part of it is used, so its scenario rows hardly move.
- **Redux** includes Immer where the implementation uses `createSlice`, whose reducers draft with Immer. The deep chain and the conditional fan-out write a plain reducer matched against `createAction`, and their bundles have no Immer.
- **Solid** is counted as `solid-js` only, its reactive core. These scenarios render nothing, so `solid-js/web` is not in the bundle.
- **Jotai**, **Preact Signals**, **Zustand** and **Valtio** each have a small core, and every row of theirs is smaller than SynState's. Zustand and Valtio are measured in the single state only, as in the benchmark: their vanilla APIs have no derived-value node.

## Running It

```sh
pnpm run ws:build:deps       # synstate and its dependencies are bundled from dist/
cd apps/synstate-docs
pnpm run bundle-size         # measures, records src/data/bundle-size-comparison.json, rewrites the tables
```

The sizes depend only on the sources and the installed versions. No workflow measures them again, so after a change to `synstate`, its dependencies, a compared library or a bundler, the tables keep the figures of the versions they name until the command is run. The site's generators render the tables from the recorded figures, and fail when a claim they check in "Where SynState's Bytes Come From" or "Reading the Results" no longer holds.

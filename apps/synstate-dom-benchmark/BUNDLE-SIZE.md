# Bundle size

<!-- Written by `pnpm run bundle-size`; edits here are overwritten. -->

Each figure is the size of one application bundled by Vite 8.3.4 with the production build of every library, as `pnpm run benchmark` compiles it, then minified; gzip at level 9, Brotli at quality 11. One kB is 1,000 bytes. Versions: `synstate-dom 0.3.0`, `synstate 6.0.0`, `solid-js 1.9.17`, `preact 10.29.8`, `@preact/signals 2.11.3`, `react 19.3.1`, `react-dom 19.3.1`, `vanjs-core 1.6.1`. See README.md for what each application is.

## Minified and gzipped

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         15.2 |  14.7 |              9.3 |    6.2 |  67.7 |   1.2 |
| counter                      |          8.3 |   4.0 |              7.9 |    5.4 |  67.5 |   1.2 |
| js-framework-benchmark table |         10.6 |   5.1 |              8.7 |    8.3 |  68.3 |   1.9 |
| loan scenario                |         10.8 |   4.8 |              9.1 |    6.7 |  68.7 |   2.4 |
| schedule scenario            |         10.8 |   4.2 |              8.5 |    6.1 |  68.1 |   1.7 |
| zoom scenario                |         10.5 |   3.9 |              8.2 |    5.9 |  67.9 |   1.5 |

## Minified and Brotli-compressed

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         13.7 |  13.4 |              8.5 |    5.6 |  58.3 |   1.1 |
| counter                      |          7.5 |   3.6 |              7.3 |    4.9 |  58.2 |   1.1 |
| js-framework-benchmark table |          9.7 |   4.6 |              8.0 |    7.6 |  58.9 |   1.8 |
| loan scenario                |          9.8 |   4.4 |              8.3 |    6.1 |  59.2 |   2.1 |
| schedule scenario            |          9.8 |   3.8 |              7.8 |    5.6 |  58.7 |   1.6 |
| zoom scenario                |          9.6 |   3.6 |              7.6 |    5.4 |  58.5 |   1.4 |

## Minified

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         50.8 |  39.1 |             24.7 |   15.4 | 219.5 |   2.5 |
| counter                      |         23.6 |  10.2 |             20.4 |   13.1 | 219.0 |   2.5 |
| js-framework-benchmark table |         30.0 |  12.4 |             22.1 |   20.5 | 220.6 |   4.1 |
| loan scenario                |         31.2 |  12.3 |             23.4 |   16.3 | 222.1 |   5.4 |
| schedule scenario            |         31.4 |  10.8 |             21.9 |   14.8 | 220.6 |   3.9 |
| zoom scenario                |         30.6 |  10.0 |             21.1 |   14.1 | 219.8 |   3.1 |

# Bundle size

<!-- Written by `pnpm run bundle-size`; edits here are overwritten. -->

Each figure is the size of one application bundled by Vite 8.3.5 with the production build of every library, as `pnpm run benchmark` compiles it, then minified; gzip at level 9, Brotli at quality 11. One kB is 1,000 bytes. Versions: `synstate-dom 0.9.0`, `synstate 8.0.0`, `solid-js 1.9.17`, `preact 10.29.8`, `@preact/signals 2.11.3`, `react 19.3.1`, `react-dom 19.3.1`, `vanjs-core 1.6.1`. See README.md for what each application is.

## Minified and gzipped

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         12.8 |  14.7 |              9.3 |    6.2 |  67.7 |   1.2 |
| counter                      |          6.7 |   4.0 |              7.9 |    5.4 |  67.5 |   1.2 |
| js-framework-benchmark table |          8.8 |   5.1 |              8.7 |    8.3 |  68.3 |   2.0 |
| loan scenario                |          7.6 |   4.2 |              8.5 |    6.1 |  68.1 |   1.8 |
| schedule scenario            |          7.6 |   4.2 |              8.5 |    6.1 |  68.2 |   1.8 |
| zoom scenario                |          7.3 |   4.0 |              8.3 |    5.9 |  67.9 |   1.5 |

## Minified and Brotli-compressed

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         11.5 |  13.4 |              8.5 |    5.6 |  58.3 |   1.1 |
| counter                      |          6.1 |   3.6 |              7.3 |    4.9 |  58.2 |   1.1 |
| js-framework-benchmark table |          8.0 |   4.7 |              8.0 |    7.6 |  58.9 |   1.8 |
| loan scenario                |          6.9 |   3.8 |              7.8 |    5.6 |  58.7 |   1.6 |
| schedule scenario            |          6.9 |   3.8 |              7.8 |    5.6 |  58.7 |   1.6 |
| zoom scenario                |          6.7 |   3.6 |              7.6 |    5.4 |  58.5 |   1.4 |

## Minified

| application (kB)             | synstate-dom | Solid | Preact + Signals | Preact | React | VanJS |
| :--------------------------- | -----------: | ----: | ---------------: | -----: | ----: | ----: |
| everything exported          |         41.3 |  39.1 |             24.7 |   15.4 | 219.5 |   2.5 |
| counter                      |         17.6 |  10.2 |             20.4 |   13.1 | 218.9 |   2.5 |
| js-framework-benchmark table |         23.2 |  12.5 |             22.1 |   20.6 | 220.7 |   4.1 |
| loan scenario                |         20.0 |  10.7 |             21.8 |   14.7 | 220.5 |   3.8 |
| schedule scenario            |         20.2 |  10.8 |             21.9 |   14.9 | 220.6 |   3.9 |
| zoom scenario                |         19.3 |  10.0 |             21.1 |   14.1 | 219.9 |   3.1 |

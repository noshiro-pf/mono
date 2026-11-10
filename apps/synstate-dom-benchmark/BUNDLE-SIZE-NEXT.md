# Bundle size

<!-- Written by `pnpm run bundle-size -- --next`; edits here are overwritten. -->

Each figure is the size of one application bundled by Vite 8.3.5 with the production build of every library, as `pnpm run benchmark:next` compiles it, then minified; gzip at level 9, Brotli at quality 11. One kB is 1,000 bytes. Versions: `synstate-dom 0.9.0`, `synstate 8.0.0`, `synstate-dom-next 0.0.0`, `synstate-next 0.0.0`, `solid-js 1.9.17`. See README.md for what each application is.

## Minified and gzipped

| application (kB)             | synstate-dom | synstate-dom-next | Solid |
| :--------------------------- | -----------: | ----------------: | ----: |
| everything exported          |         12.8 |              11.9 |  14.7 |
| counter                      |          6.7 |               6.6 |   4.0 |
| js-framework-benchmark table |          8.8 |               9.2 |   5.1 |
| loan scenario                |          7.6 |               7.3 |   4.2 |
| schedule scenario            |          7.6 |               7.3 |   4.2 |
| zoom scenario                |          7.3 |               7.1 |   4.0 |

## Minified and Brotli-compressed

| application (kB)             | synstate-dom | synstate-dom-next | Solid |
| :--------------------------- | -----------: | ----------------: | ----: |
| everything exported          |         11.5 |              10.7 |  13.4 |
| counter                      |          6.1 |               6.0 |   3.6 |
| js-framework-benchmark table |          8.0 |               8.3 |   4.7 |
| loan scenario                |          6.9 |               6.6 |   3.8 |
| schedule scenario            |          6.9 |               6.7 |   3.8 |
| zoom scenario                |          6.7 |               6.5 |   3.6 |

## Minified

| application (kB)             | synstate-dom | synstate-dom-next | Solid |
| :--------------------------- | -----------: | ----------------: | ----: |
| everything exported          |         41.3 |              38.4 |  39.1 |
| counter                      |         17.6 |              18.5 |  10.2 |
| js-framework-benchmark table |         23.2 |              25.4 |  12.5 |
| loan scenario                |         20.0 |              20.3 |  10.7 |
| schedule scenario            |         20.2 |              20.6 |  10.8 |
| zoom scenario                |         19.3 |              19.8 |  10.0 |

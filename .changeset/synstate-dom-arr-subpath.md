---
'synstate-dom': patch
---

synstate-dom imports `Arr` from `ts-data-forge/array` instead of the ts-data-forge root, so esbuild no longer keeps all of `Arr` in an application's bundle: a counter bundled by esbuild drops from 12.3 to 7.4 kB minified and gzipped. Vite already shook it off.

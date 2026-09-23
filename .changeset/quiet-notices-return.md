---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

The published bundles now carry the attribution Apache-2.0 asks of a
derivative work.

Every generated declaration file is a rewrite of a TypeScript lib file, which
is Copyright Microsoft Corporation under Apache-2.0. The generator used to
strip the upstream copyright banner and the bundles shipped no license text.
Now each file keeps the banner and states beneath it that it was modified,
and each bundle ships `LICENSE` and a `NOTICE` naming the upstream commit it
was generated from. Nothing about the declarations themselves changed.

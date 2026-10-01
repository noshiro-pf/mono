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

The `strict-ts-lib-v7.0` README now leads with the linker
(`npx strict-ts-lib-v7.0-link`, run from your `prepare` script) and offers
`paths` as the alternative. Both work under TypeScript 7, but only the linker
reaches TypeScript 6 — which is what typescript-eslint runs, so with `paths`
alone a type-aware lint silently sees the stock library. The comment at the
top of every bundle's `link-libs.mjs`, which called the two routes exclusive,
is corrected to match. Nothing about the declarations or the linker's
behavior changed.

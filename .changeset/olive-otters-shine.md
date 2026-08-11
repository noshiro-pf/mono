---
'ts-repo-utils': patch
---

Move `tsx` out of `dependencies`. Nothing this package ships uses it — every
executable runs compiled `.mjs` under `node`, and `tsx` appears only in the
package's own build scripts. It pulled esbuild along with it, so installing
`ts-repo-utils` fetched roughly 11MB of platform binaries that nothing would
ever execute: 64MB installed before, 53MB after.

---
'eslint-plugin-ts-data-forge': patch
'eslint-plugin-ts-fortress': patch
'eslint-plugin-ts-type-forge': patch
'synstate': patch
'synstate-preact-signals': patch
'ts-data-forge': patch
'ts-fortress': patch
'ts-type-forge': patch
---

Fix the links in the README. They were relative, and npm rewrites a relative
link against the repository root without regard for `repository.directory`, so
publishing from the monorepo would have pointed them at paths that do not
exist — `synstate`'s logo among them. They are absolute now. The links that
still named one of the repositories this package was merged from now name
`mono`, and a handful that had gone stale independently (a file that moved, one
that was renamed, three documents that became pages on the docs site) point
where those things actually are.

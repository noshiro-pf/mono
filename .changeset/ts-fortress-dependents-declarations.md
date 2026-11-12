---
'pr-report-core': patch
'octokit-safe-types': patch
'pr-merge-queue': patch
---

Requires the `ts-fortress` release in which the package's own declarations type-check. They declare codecs with inferred types, which `ts-fortress` rejected with TS2344 for a consumer compiling with `skipLibCheck: false`; nothing in the package's `dist/` changes.

---
'ts-codemod-lib': patch
---

Correct the `ts-repo-utils` peer dependency range. It was pinned to the exact
version `8.1.0`, which the shipped CLI has not been compatible with for a long
time — `src/cmd/run-transformer-cli.mts` uses the current API. The peer is
optional, so this only changes the warning consumers see when they do install
`ts-repo-utils` alongside this package.

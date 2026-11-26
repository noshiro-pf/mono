---
'ts-repo-utils': patch
---

`formatFiles` (and `formatFilesGlob`, `formatUncommittedFiles`, `formatDiffFrom`) with `ignore: false` still skips a file Prettier has no parser for unless `ignoreUnknown: false` is passed, instead of failing the whole run on it. `ignore: false` turns off the built-in ignore list and `.prettierignore`, and nothing else.

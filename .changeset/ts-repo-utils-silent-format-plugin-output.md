---
'ts-repo-utils': patch
---

`formatFiles`, `formatFilesGlob`, `formatUncommittedFiles` and `formatDiffFrom` (and the `format-uncommitted` and `format-diff-from` commands) with `silent` now drop what is printed through `console.log`, `info`, `debug`, `dir`, `dirxml`, `table` or `warn` from inside the formatting run, so a Prettier plugin or bundled parser no longer prints. That includes an `ignore` callback, and `assert`, `count`, `group` and `time*`, which Node prints through `log` or `warn`. The rest of the process prints as before.

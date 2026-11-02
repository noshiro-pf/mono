---
'ts-repo-utils': patch
---

`getUntrackedFiles`, `getModifiedFiles`, `getStagedFiles` and `getDiffFrom` now return names with non-ASCII characters, a `"`, or leading or trailing spaces as they are on disk. They read git's newline-separated output, which under the default `core.quotePath` quotes and octal-escapes such names (`"\346\227\245.md"`), and trimmed each line, so they returned paths that do not exist: `formatDiffFrom` and `formatUncommittedFiles` skipped those files without an error, and `checkShouldRun` matched the quoted string against its globs. The git commands now run with `-z`.

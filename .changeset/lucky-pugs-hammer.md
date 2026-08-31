---
'ts-repo-utils': minor
---

`genIndex` / `gen-index-ts`: add `preserve`, glob patterns naming index files that must be left as they are on disk.

An index file was written unconditionally, so a hand-written one — an executable entry point, or a curated list of named re-exports — was overwritten with a barrel every time the generator ran. `exclude` could not express the exception: it says what an index file may not _export_, index files are never exported in the first place, and its patterns are matched against a bare file name as well as a relative path, so `index.mts` there names every index file in the tree rather than the one at the root of the walk.

`preserve` matches on the path relative to the target directory alone, so `--preserve index.mts` names exactly one file and `--preserve 'v*/index.mts'` names one generation of them. A preserved directory is still walked, so index files below it are still generated, and its parent still re-exports it.

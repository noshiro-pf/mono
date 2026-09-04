---
'ts-repo-utils': patch
---

`genIndex`: leave an index file alone when it already re-exports exactly what would be generated for it, and write it through a temporary file and a `rename` when it does not.

The generator emits double quotes, no trailing newline and subdirectories first, and the formatter that runs after it rewrites all three — so every run rewrote every index file in the tree twice to arrive back at the bytes that were already there. That is invisible in a single package and not invisible at all in a workspace: `genIndex` is called from a package's `build`, those builds run several at a time, and each imports its siblings' sources through `tsx`. A file being rewritten cannot be read, so a barrel touched for no reason took a sibling's build down with `SyntaxError: The requested module 'ts-repo-utils' does not provide an export named '...'`.

The comparison is on the set of module specifiers rather than on the bytes, because the bytes never match for the reason above. Anything that is not a plain list of `export * from '...';` statements — a hand-written barrel, an empty file — compares unequal, so the fallback is always to write.

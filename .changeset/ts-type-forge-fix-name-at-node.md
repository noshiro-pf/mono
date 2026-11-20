---
'eslint-plugin-ts-type-forge': patch
---

The autofixes and suggestions that write a ts-type-forge type name now check
that name where they write it, not only at the top of the file: a type
parameter, local type alias or local interface of that name around the node
withholds the autofix or leaves out the suggestion, instead of capturing the
name the fix writes.

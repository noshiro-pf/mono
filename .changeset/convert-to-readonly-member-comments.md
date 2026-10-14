---
'ts-codemod-lib': patch
---

`convert-to-readonly` no longer loses or copies comments around the types it
rewrites. A comment in front of the `|` or `&` between union or intersection
members used to be dropped, and a comment in front of a rewritten type was
written a second time inside it, so with Prettier in between it doubled on
every run. Each comment is now kept exactly once; one in front of a member
that is merged into a `Readonly<…>` or `DeepReadonly<…>` moves inside it.

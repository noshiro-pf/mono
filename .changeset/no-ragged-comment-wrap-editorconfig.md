---
'eslint-config-typed': minor
---

`ts-restrictions/no-ragged-comment-wrap` resolves its default width as Prettier does: a Prettier configuration's `overrides` for the file apply, and with no `printWidth` there, the `.editorconfig` `max_line_length` is read (`off` turns the rule off) before falling back to 80.

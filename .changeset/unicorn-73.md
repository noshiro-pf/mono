---
'eslint-config-typed': minor
---

Support eslint-plugin-unicorn v73.

Five rules are new in v73 and the exported rule map has to name all of them.
`no-unsafe-sqlite-interpolation` is on; `no-barrel-files` is off, because
barrel files are how this repository is organized; the other three are off as
stylistic, `single-line-block-comment-style` among them — its fix rewrites
one-line JSDoc comments into three lines without the leading asterisk.

`prefer-single-call` and `no-array-fill-with-reference-type` stopped reporting
on code they used to flag, so the `eslint-disable` comments naming them are no
longer needed and have gone.

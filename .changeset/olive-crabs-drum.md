---
'ts-codemod-lib': patch
---

`convertToReadonlyTransformer` no longer adds a space before every union or
intersection member each time it runs. The members are read with
`getFullText()`, which carries the whitespace in front of each one, and were
joined with a separator that supplied its own — so the two compounded and the
transformer never reached a fixed point. A file that Prettier is told to leave
alone, such as a long single-line union under `// prettier-ignore`, grew on
every run and could not be brought to a state that `codemod:full` would leave
clean.

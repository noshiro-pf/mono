---
'eslint-plugin-ts-data-forge': patch
---

`prefer-arr-generate` now autofixes a negated test written with `!` in front (`!f(/* c */ x)`, `!(n < /* c */ 0)`) whose comments the fix carries over, where it only suggested. The ranges its fix copies verbatim now come from the code that writes the fix, so a comment in a parameter's type annotation is known to be dropped.

---
'eslint-config-typed': patch
---

`total-functions/no-partial-string-normalize` now judges any argument by its type, not only an identifier, so `s.normalize(cond ? 'NFC' : 'NFD')`, `s.normalize(options.form)` and `s.normalize(getForm())` are no longer reported when every value they may have is a valid form. A conditional or logical expression is judged by its operands, so a cast inside one still does not make it safe.

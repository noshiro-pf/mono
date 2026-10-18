---
'eslint-config-typed': patch
---

`ts-restrictions/prefer-logical-over-boolean-ternary` negates a logical test by De Morgan: `a || b ? false : c` becomes `!a && !b && c` rather than `!(a || b) && c`. The negation it writes now comes from `negationOf` in `eslint-rule-forge`, which `eslint-plugin-ts-data-forge` shares.

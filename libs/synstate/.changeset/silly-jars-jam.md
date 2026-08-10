---
'synstate': major
'synstate-react-hooks': major
'synstate-react-hooks-compat': major
'synstate-preact-hooks': major
'synstate-preact-signals': major
---

Upgrade to `ts-data-forge` 14 and `ts-type-forge` 9.

Both are dependencies whose types appear in these packages' public
signatures, so consumers that also depend on them directly have to upgrade in
step.

BREAKING CHANGE: requires `ts-data-forge` >= 14 and `ts-type-forge` >= 9.

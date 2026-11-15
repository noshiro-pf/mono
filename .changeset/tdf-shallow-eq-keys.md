---
'ts-data-forge': patch
---

`Obj.shallowEq` no longer reports two records with different keys as equal when the differing key of the first holds `undefined` (`Obj.shallowEq({ a: undefined }, { b: 1 })` was `true`), nor counts an inherited property of the second as one of its keys. Each key of the first must be an own key of the second.

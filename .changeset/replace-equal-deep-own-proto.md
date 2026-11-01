---
'ts-data-forge': patch
---

`replaceEqualDeep` now copies an own `__proto__` key, such as one `JSON.parse` produces, as a property. The copy it builds when a plain object changed was filled by assignment, so `__proto__` went through the setter and became the copy's prototype: the key was missing from `Object.keys` and `JSON.stringify`, its properties were inherited instead, and the result was not deeply equal to `next`.

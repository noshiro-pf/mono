---
'ts-data-forge': patch
---

`fastDeepEqual` no longer throws a `TypeError` on objects with a `null` prototype, such as `Object.create(null)` dictionaries and `Object.groupBy` results; it compares their keys like any other object. Two React elements that differ only in `_owner` now compare equal: the React rule meant to skip `_owner` made every element pair unequal instead, so a `shouldComponentUpdate`, memo or `equals` comparer built on it reported a change whenever a value held an element. An element is recognized by a `$$typeof` that is a symbol, as React sets it; an object with any other `$$typeof` has its `_owner` compared like any other key.

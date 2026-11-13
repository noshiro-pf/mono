---
'synstate': patch
---

The documentation of `merge` now says what it emits when several of its sources emit in the same update, for example an observable and what is mapped from it: it emits once, with the value of the first of them in the order of `parents`, and the other values of that update are not passed on. It no longer says that `merge` emits all values from all sources. The behavior is unchanged.

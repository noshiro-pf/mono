---
'synstate-dom': minor
---

`autocorrect={false}` and `async={false}` now take effect. Both were written as attributes, and `false` removed the attribute: `autocorrect` then stayed on, since its `false` is the value `off` rather than an absence, and a script made by the binding stayed async, since `createElement` makes it so until the property says otherwise. Both are now written as DOM properties, as `spellcheck` and `draggable` are.

Breaking: an observable bound to either takes `boolean` and no longer `undefined`, which used to remove the attribute and so left both on; write `true` for that. As with `spellcheck`, an `autocorrect` bound on a control always says its own value, rather than following its form's.

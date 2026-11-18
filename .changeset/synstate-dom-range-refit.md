---
'synstate-dom': patch
---

A range or number `<input>` whose `max` and `value` rise in one update draws the
new value: `{max: 200, value: 150}` then `{max: 400, value: 350}` drew 200 when
the observable bound to `value` was computed first. After a binding writes
`min`, `max`, `step` or `type` of an `<input>`, the bound `value` is written
again while the input still shows what the last write left and that differs from
the bound value; a value the user has changed since, a draft or an IME
composition, is kept.

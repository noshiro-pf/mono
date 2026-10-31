---
'synstate-dom': minor
'blueprint-synstate': patch
---

synstate-dom exports `isImeKeyDown(event)`, whether a key down belongs to an input method: one sent while a composition is going on, or the Enter or Escape that Safari sends with key code 229 after `compositionend`. blueprint-synstate's `NumericInput`, `TimePicker` and `DateInput` use it in place of their own copy, so blueprint-synstate needs a synstate-dom that exports it.

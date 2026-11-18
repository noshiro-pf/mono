---
'blueprint-synstate': minor
---

`NumericInput` keeps an input method's composition whole when its `value`
changes from outside meanwhile (by a linked control, or a reset from elsewhere):
the text follows the new value once the composition ends. It wrote the text at
once, which committed what was composed and started the rest as a new
composition, losing the text typed so far. `NumericInputView` takes
`onCompositionStart` and `onCompositionEnd`, called for the composition in its
input.

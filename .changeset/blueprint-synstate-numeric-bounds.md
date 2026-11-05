---
'blueprint-synstate': minor
---

`NumericInput` disables its up button while the text is at or past `max`, and its down button at or past `min`, as Blueprint's does. `NumericInputView` takes them as the new `incrementDisabled` and `decrementDisabled`, and a disabled step button now has `bp6-disabled`, as Blueprint draws it.

A bound that moves onto the button being held stops its repeat, and the number read out follows the bounds as they move. Empty text is taken as no number, whatever `decode` returns for it: blur, Enter or a step from it commits from `normalize(NaN)`, where a `decode` such as `Number` used to make it 0. A disabled `NumericInputView` gives its input `aria-disabled`, as Blueprint's does.

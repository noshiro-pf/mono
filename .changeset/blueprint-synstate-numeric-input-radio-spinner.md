---
'blueprint-synstate': minor
---

Add `Radio`, `RadioGroup`, `Spinner`, `NumericInputView` and `NumericInput`. A numeric input is built in two layers: `NumericInputView` is stateless and takes the text as its controlled value, and `NumericInput` holds that text while the user types and decodes it into a number only when it is committed (on blur, on Enter, or by a step). `Checkbox` now marks its native input `bp6-control-input`, which Blueprint 6's style sheet hides; without it the browser's own box was drawn beside Blueprint's.

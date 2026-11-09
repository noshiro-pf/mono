---
'blueprint-synstate': minor
---

The forwarded `aria-*` props take booleans: `Button`'s `aria-pressed`, `aria-checked` and `aria-expanded`, `Card`'s `aria-busy` and `HtmlSelect`'s `aria-invalid` are `Bindable<boolean | string | undefined>`, as synstate-dom writes a boolean on an `aria-*` attribute as `"true"` / `"false"`. The components' own `aria-*` pass their booleans and numbers as they are, rendering what they did.

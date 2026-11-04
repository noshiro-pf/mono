---
'synstate-dom': patch
---

A boolean on an `aria-*` attribute is written as `"true"` or `"false"`, as React does, instead of as an empty attribute, which `aria-*` reads as its default: `aria-busy={pending$}` now says what it means. `aria-*` props are typed `Bindable<boolean | number | string | undefined>`.

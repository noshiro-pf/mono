---
'synstate-dom': minor
---

A type-level break, released as a minor while synstate-dom is 0.x: `<style>` no longer takes a `disabled` prop. `HTMLStyleElement.disabled` has no attribute behind it, so binding it wrote a `disabled` attribute that nothing reads; `disabled` stays on every element whose attribute it is (`<button>`, `<link>`, …).

Breaking: to turn a style sheet off, set `element.disabled` from `ref` instead of binding `disabled`.

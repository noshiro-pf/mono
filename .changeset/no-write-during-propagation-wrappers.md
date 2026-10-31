---
'eslint-plugin-synstate': minor
---

`no-write-during-propagation` recognizes the factories imported from `synstate-react-hooks`, `synstate-react-hooks-compat`, `synstate-preact-hooks` and `synstate-preact-signals` as well as from `synstate`, and treats a `useObservableEffect` callback as a subscriber.

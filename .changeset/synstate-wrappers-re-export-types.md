---
'synstate-react-hooks': minor
'synstate-react-hooks-compat': minor
'synstate-preact-hooks': minor
'synstate-preact-signals': minor
---

Re-export synstate's types as well as its functions, so `import type { Observable } from 'synstate-react-hooks'` (and the same from the other wrapper packages) works without importing `synstate` directly.

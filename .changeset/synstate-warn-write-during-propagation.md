---
'synstate': minor
---

Warn (`console.warn`, once per observable) when a root observable is written to — `next`, `setState`, `dispatch` and the like — from a subscriber or a projection while another update is still propagating. The write still propagates immediately, as before; derive the value from its source (`map`, `combine`, …) instead. Writes from event handlers, timers and microtasks are unaffected, as is a root created during propagation emitting while it is created.

---
'synstate': patch
---

A completed observable is now removed from its parents and from the propagation order of the observables that start updates, so it no longer computes on every later update of its root. Creating many derived observables under one root is also no longer quadratic.

---
'synstate': patch
---

A child observable created from parents that have all completed now completes at creation. It keeps the value computed from the parents' final values, and is no longer registered to the completed parents.

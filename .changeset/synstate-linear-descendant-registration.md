---
'synstate': patch
---

Building a graph in which many roots reach deep descendants no longer takes cubic time. A root kept its descendants in one array per depth and copied that array whenever a descendant arrived at a new depth, so each root paid for its depth twice over: 1,000 tasks of a critical-path schedule, each with a state of its own, took 23 seconds to build. The array is now extended in place, and copied only while the root is propagating an update of its own, so that the walk under way keeps the array it began on; the same schedule builds in about a second.

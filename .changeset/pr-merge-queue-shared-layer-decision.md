---
'pr-merge-queue': minor
---

`unblock-prs` now judges the runs on its queue layers and decides what to do with its stack through `pr-report-core`'s `layerRunsVerdict`, `layerRunsRequest` and `decideSpeculation`, which the Pull Requests Manager reads too, so it needs the `pr-report-core` release that adds them. What the worker does is unchanged.

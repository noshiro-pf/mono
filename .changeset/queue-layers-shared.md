---
'pr-report-core': minor
'pr-merge-queue': minor
---

`pr-report-core` exports what decides which queue layers stay ahead of the queue's own order (`stackedAhead`, `isStackable`, the `Queue-Layer:` trailer and the `queue/pr-` prefix), so that the Pull Requests Manager draws the queue in the order `unblock-prs` releases it. `pr-merge-queue` now decides its release order by them, and keeps exporting its own names for them (`LAYER_BRANCH_PREFIX`, `numberOfLayerBranch`, `layerTrailer`, `layerOfMessage`, `isStackable`) as before.

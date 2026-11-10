---
'pr-merge-queue': minor
'pr-report-core': minor
---

`unblock-prs` now checks a queued pull request stacked on another one ahead of its turn, right above that one's queue layer, instead of only candidates on `main`: with `main <- A <- B` both `merge-queued`, B's layer is built from A's head on top of A's, checked, and released only once A has merged, when its verdict is already there. A layer whose pull request's head moved to a commit with the layer's tree, as releasing A does to B, is kept. `pr-report-core` exports `withStackedAbove` and `stackedLayerParent`, which the Pull Requests Manager's queue reads the same way.

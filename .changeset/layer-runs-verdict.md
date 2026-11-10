---
'pr-report-core': minor
---

Add what `unblock-prs` decides about its queue layers, so that it and the Pull Requests Manager judge them alike: `layerRunsVerdict` (where the checks on a layer stand, by the latest dispatched run of each workflow), `decideSpeculation` and `mayBuildAbove` (what a survey does with the stack), `layerStandings` (what that decision does with each layer), the request both read the runs with (`layerRunsRequest`), and `cancelledTooOften`, `MAX_DISPATCHES` and `UNBLOCK_PRS_CONFIG_PATH`.

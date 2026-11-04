---
'pr-merge-queue': patch
'pr-report-core': minor
---

`unblock-prs` sets a released pull request aside as `checks-not-started` once its head has gone five minutes with required contexts unreported and nothing running on it — GitHub started no check workflow — and tries the next candidate, instead of holding the queue until `--watch-timeout`. `pr-report-core` adds `checks-not-started` to `SET_ASIDE_REASONS`, owned by a person and cleared when the base moves.

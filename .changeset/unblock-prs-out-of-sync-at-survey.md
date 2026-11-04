---
'pr-merge-queue': patch
---

`unblock-prs` no longer re-lists the pull requests for a minute on every survey behind an armed pull request whose push GitHub dropped. When a survey finds an armed pull request `UNKNOWN`, it reads the branches' tips in one `git ls-remote --heads origin` and records one whose branch is not at the head GitHub shows. The next survey that finds the same mismatch does not wait on it; the first still does, since a push GitHub has yet to take in looks the same for a few seconds. A `merge-queued` one is set aside as `head-out-of-sync` once the mismatch has lasted `OUT_OF_SYNC_GRACE_MS`, before triage, wherever it stands in the queue. Before, only the candidate a cycle picked was checked, and only a set-aside this run held in memory stopped the wait.

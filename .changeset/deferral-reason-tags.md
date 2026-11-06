---
'pr-merge-queue': minor
---

`pr-description` and `open-pr --body-file` refuse a `## Review` section whose items under a `**Deferred**` line do not each open with why the finding is out of scope: `(predates)`, `(another change)` or `(too large)`. `deferralReasonOf` and `DEFERRAL_REASONS` read and list those tags. `pr-description` problems are now headed "the description cannot be posted as it is", since not all of them are about the layout.

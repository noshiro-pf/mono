---
'pr-merge-queue': patch
---

fix(pr-merge-queue): fail `pr-report`, `startable-issues` and the queue's owners on a REST rate limit spent after the open pull requests are read, rather than reporting the issues' blocked-by lists, bodies, references and queue comments it refused as absent

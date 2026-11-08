---
'pr-merge-queue': patch
---

Checking ahead reads a red layer's failed jobs as `autoFix` reads them before releasing its pull request for its own run to fix: a job whose run carries the `autoFix.notFixableAnnotation` annotation is not a fixer's, so that pull request is set aside at once instead of being released, run again and declined.

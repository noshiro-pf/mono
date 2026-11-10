---
'pr-merge-queue': patch
---

The `unblock-prs` skill describes checking ahead on queue layers: a pull request set aside because its layer failed is fixed from the set-aside comment, which links the layer's run, since its own checks are the skipped ones of `skip-ci` and the report's `checks.failed` is empty.

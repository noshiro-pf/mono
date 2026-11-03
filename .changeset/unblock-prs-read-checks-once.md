---
'pr-merge-queue': patch
---

`unblock-prs` reads a pull request's checks once per survey and once per watch poll, not twice. The required checks and the ones still running now come from the same answer, so a round that ends between two reads can no longer show as both unfinished and finished in a single verdict when the head's checks fit on one page of 100. The read also costs half the GraphQL requests it did.

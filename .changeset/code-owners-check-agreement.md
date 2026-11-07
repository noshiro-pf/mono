---
'pr-report-core': minor
'pr-merge-queue': patch
---

`codeOwnersEnforcedBy` now reads only the file's head, the comments before its first rule, as the file and the check describe it: an `# enforced-by:` line after a rule no longer counts. `codeOwnerReviewOf` gives the code-owner half of `reviewHold` on its own, and `reviewHold` takes it precomputed. `namesEveryChangedPath` says whether GraphQL's changed files name every path (a rename or copy hides its old one), and `unblock-prs` and the Pull Requests Manager count a pull request with one as not fully read; `codeOwnerReview` still settles such a read where every rule's owners have approved. `unblock-prs` holds a red check that enforces `CODEOWNERS` when the review read cannot judge it instead of re-running it, reads failing pull requests' reviews only where `CODEOWNERS` names a required check, and names the `CODEOWNERS` a regeneration is judged by — the default branch's — apart from the branch it rebases onto.

---
'pr-merge-queue': patch
---

`pr-report` no longer loses the issues a stacked pull request closes when it runs with a token. GitHub's `closingIssuesReferences` lists a closing keyword only for a pull request into the default branch, and the report took its empty list as the answer; it now joins that list with the keywords GitHub marked in the rendered body, for every open pull request. `startable-issues` and `run-issue-resolver`, which decide from the report, therefore stop offering an issue that only a stacked pull request closes. Where the report reads a body's text (the merged list, and an answer without the rendering), a closing keyword followed by this repository's issue URL now counts whatever the case of the owner and repository names in it.

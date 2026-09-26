---
'split-view-extension': patch
---

A split view put inside another page's frame now draws nothing. A build from
source also lets pages on `noshiro-pf.github.io` open a split view from a
link, which is how the PR Manager opens a pull request's diff beside its
conversation; the store package leaves that out.

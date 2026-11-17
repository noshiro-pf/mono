---
'split-view-extension': minor
'github-view-defaults-extension': patch
---

The merge-queued button is back in the panes of a split view. Chrome lets no extension reach a page inside another extension's page, so since the button moved to GitHub View Defaults it could not appear in Split View's panes. Split View now draws another extension's buttons in a pane and, once one is pressed and until it is answered, runs that extension's steps on the pane's page (the pane bridge in `split-view-link`), for GitHub View Defaults alone; the label picker stays GitHub View Defaults' code. GitHub View Defaults' manifest now has a `key`, pinning the id Split View answers: remove a build loaded before it and load `dist` again, once.

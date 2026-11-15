---
'github-view-defaults-extension': minor
'split-view-extension': minor
---

Move the buttons on a GitHub pull request — "⧉ Split view" and, on
noshiro-pf/mono, "＋ merge-queued" — and the "Open pull request in Split View"
context menu items from Split View to GitHub View Defaults, so that following
GitHub's markup no longer needs an update of Split View, which closes every
split view open. GitHub View Defaults shows the Split view button and the menu
items only while Split View is installed, which Split View now lets it tell by
listing `icons/16.png` for every extension to fetch. The merge-queued button
works again: GitHub's pull request page went back to its server-rendered
sidebar, whose label picker is a `<details>` menu the button did not know, and
the button now works that one as well as the React picker.

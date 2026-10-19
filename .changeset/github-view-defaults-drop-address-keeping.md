---
'github-view-defaults-extension': patch
---

Stop keeping `w=1` and `show-viewed-files=false` on a pull request diff's address after the page has loaded, and leave GitHub's "Refresh" button to GitHub. The wrapping of `history.pushState` and `history.replaceState`, the write-back behind it, and the taking of the Refresh click are removed; they did not keep the parameters reliably. GitHub now refreshes the diff in place, and a diff loaded again from an address without the parameters, by a reload or a bookmark, is redirected to one with them, as before.

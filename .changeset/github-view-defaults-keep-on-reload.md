---
'github-view-defaults-extension': patch
---

A pull request diff keeps `w=1` and `show-viewed-files=false` on its address after a reload. GitHub can write the diff's bare path more than once after loading it, and the extension answered each address only once, so the second write left the address without them. GitHub's own `pushState` and `replaceState` calls on the same page now keep the parameters the address carried, so the address never loses them.

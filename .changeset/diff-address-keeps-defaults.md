---
'github-view-defaults-extension': patch
---

Keep `w=1&show-viewed-files=false` on a pull request diff's address after GitHub takes them off, for example when it jumps to the first file not yet marked viewed and leaves `/changes#diff-…`. The extension writes them back in place, without loading the page again, and now also runs inside frames, so a diff in a split-view pane keeps them too.

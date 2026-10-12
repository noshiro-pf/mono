---
'github-view-defaults-extension': patch
---

Keep `w=1&show-viewed-files=false` when the "Refresh" button on a pull request diff is clicked after the pull request has been pushed to. GitHub reloaded the diff in place at its bare path, without them; the extension now has the click before any of GitHub's handlers, so the refresh loads the diff with the defaults on.

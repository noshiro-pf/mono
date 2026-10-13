---
'split-view-extension': patch
---

Fix the **⧉ Split view** button on GitHub doing nothing in a development build when the browser lacks one of the debugging APIs the diagnostics listen to. The service worker stopped halfway through starting up, so the button's click failed with "Could not establish connection" and then "F is not a function". The diagnostics are now skipped in such a browser, with an error in the worker's console, and the rest of the worker starts as usual.

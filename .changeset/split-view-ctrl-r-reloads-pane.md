---
'split-view-extension': minor
---

`Ctrl+R` (`Cmd+R` on macOS) and `F5` pressed with the focus in a pane reload that pane rather than the whole tab. The content script takes the key and reloads its own page, as the pane's reload button does. A pane the content script cannot run in, such as a `chrome://` page, and a site that binds `Ctrl+R` itself still leave the key to the browser.

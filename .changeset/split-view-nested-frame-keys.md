---
'split-view-extension': patch
---

`Ctrl+R` / `F5` with the focus in a frame nested inside a pane's page (an embedded editor, a comment widget, `about:blank` and `srcdoc` frames included) reloads that pane rather than the whole tab, and `Alt+1..9` switches split views from there too: the nested frame hands the key up to the pane's own frame. A workspace shortcut the page has already handled is left to it, as the reload shortcut was.

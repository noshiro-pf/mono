---
'ts-repo-utils': patch
---

The formatter behind `formatFiles`, `formatFilesGlob`, `formatUncommittedFiles`, `formatDiffFrom` and the `format-*` commands resolves each file's Prettier options with `.editorconfig` included, as the `prettier` CLI does. **This can change what they write**: where the Prettier configuration does not set the option, an `.editorconfig` `max_line_length`, `indent_style`, `indent_size` / `tab_width`, `end_of_line` or `quote_type` now applies, so a file these commands format reads the same as after `prettier --write`.

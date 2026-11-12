---
'ts-codemod-lib': patch
---

When `convert-to-readonly` or `replace-record-with-unknown-record` adds a ts-type-forge type to an existing import that spans several lines, the new name goes on a line of its own, with the import's indentation and trailing-comma style and the file's line breaks, instead of landing on the last line and pulling the closing brace up.

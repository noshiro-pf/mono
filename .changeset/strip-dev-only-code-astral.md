---
'ts-repo-utils': patch
---

`stripDevOnlyCode` no longer trims trailing whitespace from a line it erased nothing from when the file has astral characters (an emoji, say) before the erasure. It recorded which lines were touched while walking the text by code point but looked up erased positions by code unit, so after each astral character the line was attributed one position late, and the next line could be trimmed too — deleting trailing spaces that belong to a multi-line template literal.

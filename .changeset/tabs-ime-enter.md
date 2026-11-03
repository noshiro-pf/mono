---
'blueprint-synstate': patch
---

`Tabs` ignores a key down that belongs to an input method (`isImeKeyDown`), as the library's text fields already do, so an Enter that confirms a conversion does not choose a tab.

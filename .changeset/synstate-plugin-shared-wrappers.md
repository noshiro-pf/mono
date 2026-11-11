---
'eslint-plugin-synstate': patch
---

`no-write-during-propagation`, following a setter imported from another file, now also sees through a type wrapper around a namespace import of synstate, as in `(s satisfies typeof s).createState(0)`.

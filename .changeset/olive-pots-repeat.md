---
'ts-codemod-lib': patch
---

`convert-to-readonly` no longer drops the key remapping (`as` clause) of a
mapped type. `{ readonly [K in keyof R as K extends symbol ? never : K]: V }`
was rewritten to `Readonly<{ [K in keyof R]: V }>`, silently widening the key
set the type produces.

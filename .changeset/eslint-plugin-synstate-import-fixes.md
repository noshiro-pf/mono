---
'eslint-plugin-synstate': patch
---

The fixes of `prefer-map-to`, `no-identity-map` and `prefer-derive` bring the name they write into scope more carefully.

- The name is added to the file's existing `import { … } from 'synstate'` instead of a new declaration inserted at the top, so a leading directive (`'use client';`) stays first and the fixed file passes `import-x/no-duplicates`.
- A name imported only as a type (`import { type derive }`) has its `type` dropped, instead of being written as a value nothing imports. One imported by `import type { derive }` gets no fix.
- A name the file does not import joins the synstate import that has value specifiers, rather than one with only `type` ones.
- Every fix adds the name itself, so a fix applied alone (an editor quick fix) no longer writes a call nothing imports. `eslint --fix` takes one more pass when several reports in a file need it.
- No fix is offered when a synstate import already binds the name to another export (`import { map as mapTo }`), instead of one that adds a duplicate binding.
- `prefer-map-to` offers no fix when the rewrite would drop a comment around the body or the callee, and `no-identity-map` and `prefer-derive` check the parentheses around the callee for one too. A comment beside the property of a namespace call (`S./* … */ map`), which the rewrite keeps, no longer prevents the fix.
- `no-redundant-skip-if-no-change` offers no fix when the outer `.pipe` is in a type wrapper or parentheses, whose closing half the removal would take.

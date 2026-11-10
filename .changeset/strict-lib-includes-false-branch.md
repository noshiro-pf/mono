---
'strict-ts-lib-v5.0-source': patch
'strict-ts-lib-v5.1-source': patch
'strict-ts-lib-v5.2-source': patch
'strict-ts-lib-v5.3-source': patch
'strict-ts-lib-v5.4-source': patch
'strict-ts-lib-v5.5-source': patch
'strict-ts-lib-v5.6-source': patch
'strict-ts-lib-v5.7-source': patch
'strict-ts-lib-v5.8-source': patch
'strict-ts-lib-v5.9-source': patch
'strict-ts-lib-v6.0-source': patch
'strict-ts-lib-v7.0-source': patch
---

`Array#includes` and `ReadonlyArray#includes` no longer narrow the false branch
to a type the argument can still hold. A `false` means "not in this array", not
"not of type `T`", so they now narrow only an argument none of whose members is
in `T`:

- an argument already of type `T` (`i: number` searched in a `number[]`) returns
  `boolean`, so `i` is no longer `never` after `if (xs.includes(i)) return;`;
- an argument overlapping `T` (`s: 'a' | 'c'` searched in an `('a' | 'b')[]`)
  returns `boolean`, so `s` is no longer `'c'` after
  `if (allowed.includes(s)) return;`;
- a wider argument (`s: string` searched in a `readonly ('a' | 'b')[]`) still
  narrows `s` to `'a' | 'b'` on the true branch, as before.

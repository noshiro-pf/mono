---
'ts-type-forge': patch
---

`Max` and `Min` now work for every member of `Uint10`, as documented. They recursed once per integer and hit TypeScript's limit of 1000 steps for a tail-recursive type, so `Max<1000>`, `Max<Uint10>` and `Min<1000>` failed with TS2589 ("Type instantiation is excessively deep"). They now step 32 at a time and then one at a time, at most 64 steps for any member: `Max<Uint10>` is `1023` and `Min<1023>` is `1023`.

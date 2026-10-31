---
'ts-data-forge': patch
---

`Obj.pick` and `Obj.omit`, direct and curried, now match numeric and symbol keys as their types say. They compared the requested keys with what `Object.entries` yields, which is always a string and never a symbol, so `Obj.pick({ 1: 'a', b: 2 }, [1])` returned `{}` and `Obj.omit({ 1: 'a', b: 2 }, [1])` kept `1`. A numeric key now matches its string form, `pick` copies a requested symbol-keyed property, and `omit` keeps the symbol-keyed properties it is not asked to omit instead of dropping all of them.

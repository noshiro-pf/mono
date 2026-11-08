---
'ts-fortress': patch
'ts-type-forge': patch
---

The README and JSDoc samples no longer read the clock at module load: the `ts-fortress` intersection sample defaults its timestamps to `0` rather than `Date.now()`, and the `ts-type-forge` `MutableJsonObject` sample stores a fixed timestamp.

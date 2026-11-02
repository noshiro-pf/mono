---
'ts-data-forge': patch
'ts-std-forge': patch
---

Drop the runtime dependency on `@sindresorhus/is`. The six guards these packages used from it (`isError`, `isDate`, `isRegExp`, `isMap`, `isSet`, `isTypedArray`) are now a few lines of their own that read the same `Object.prototype.toString` tag, so they answer as before, across realms included. `@sindresorhus/is` stayed mostly whole in a bundle that used any one of them: a bundle that reaches `fastDeepEqual`, `replaceEqualDeep`, `unknownToString`, `Result.fromThrowable` or the panic helpers is about 12 kB smaller minified (about 3 kB gzipped).

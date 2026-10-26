---
'ts-fortress': minor
---

Add `toJsonSchema(type, options?)`, which writes the JSON Schema (draft 2020-12) of the JSON values a type accepts: constraints become keywords (`minLength`, `pattern`, `minimum`, `multipleOf`, ...), `record` becomes `properties` and `required` (with `additionalProperties: false` for `strictRecord`), `union` becomes `anyOf` (or `oneOf` with an OpenAPI `discriminator` when a literal key tells the members apart), `intersection` becomes `allOf` and `recursion` a `$defs` entry. The predefined branded numbers state what their brands mean, so `uint32()` is an integer from 0 to 2^32 - 1. What a predicate checks is named under `x-refined` and a brand under `x-brand`. A type no JSON value can be of (`bigint`, `symbol`, `undefinedType`, `MapType`, `SetType`) is an error, except as a union member, which is left out.

Every type the package builds now carries a `structure` (`TypeStructure`, discriminated by `kind`) describing what it was built from, which is what `toJsonSchema` reads. `createType` and `createPrimitiveType` take an optional `structure`, and `brandedNumber` / `brandedString` no longer pass a predicate to `brand` when none is given.

---
'ts-fortress': minor
---

Export the types the validators name: `UnknownType`, the option types of `iso8601` and `uuid` (`Iso8601ValidatorOption`, `UuidVersionAdditionalOption`, `UuidValidatorOption`), and `UuidOf`, the type `uuid` validates for a version. `number`, `bigint` and `string` now name `NumberTypeConstraints`, `BigintTypeConstraints` and `StringTypeConstraints` in their signatures, the exported names of the types they took already.

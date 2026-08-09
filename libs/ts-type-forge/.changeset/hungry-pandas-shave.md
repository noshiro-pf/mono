---
'ts-type-forge': patch
---

Back every JSDoc `@example` with a type-checked sample file.

95 examples across 25 modules were written as bare JSDoc lines rather than
` ```ts ` blocks sourced from `samples/src`, so they were never compiled. Six
had drifted:

- `RecordPaths` / `RecordPathsWithIndex` / `RecordLeafPaths` /
  `RecordLeafPathsWithIndex` / `RecordPathAndValueTypeTuple` documented
  themselves under names that do not exist (`Paths`, `PathsWithIndex`,
  `LeafPaths`, `LeafPathsWithIndex`, `KeyPathAndValueTypeAtPathTuple`).
- `List.Partition` advertised `List.Partition<3, readonly number[]>`, which
  does not compile: partitioning a non-fixed-length array exceeds TypeScript's
  instantiation depth (TS2589). The example now shows the tuple cases that do
  work.

`doc:embed:jsdoc` now keys its coverage check off the `@example` tag rather
than the ` ```ts ` fence, so an unfenced — and therefore unchecked — example
fails the build instead of passing unnoticed, both in an unregistered module
and in a registered one.

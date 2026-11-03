---
'eslint-rule-forge': minor
---

New `inlineTypeQualifierRange(sourceCode, specifier)`: the range a fix removes to drop the inline `type` of an import or export specifier, up to whatever follows it so that a comment there stays. `bindValueImports` uses it for the edit that turns `import { type x }` into a value import.

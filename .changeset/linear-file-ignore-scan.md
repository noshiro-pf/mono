---
'ts-codemod-lib': patch
---

`transformSourceCode` now finds file-level ignore comments (`/* transformer-ignore ... */` and its aliases) with a single linear scan instead of regular expressions, so the time it takes grows linearly with the size of the source text. Which comments are recognized, and the transformer names read from them, are unchanged.

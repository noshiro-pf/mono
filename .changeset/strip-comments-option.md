---
'ts-repo-utils': minor
---

`stripDevOnlyCode` / `stripDevOnlyCodeInDir`: add `removeComments`, which removes the comments from the emitted JavaScript as well. The compiler copies each declaration's JSDoc into the JavaScript and into the `.d.mts` alike, and an editor reads the `.d.mts`, so the copy in the JavaScript is read by nobody. It was two thirds of one package's emitted JavaScript here. The compiler's own `removeComments` cannot be used for this, because it strips the `.d.mts` too. A `#!` line and the `//#` source-map pragma are kept, and line breaks are kept as everywhere else in the pass, so the source map stays valid. The option defaults to off.

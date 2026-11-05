---
'eslint-config-typed': minor
---

Turns off `unicorn/prefer-temporal`, `unicorn/prefer-temporal-conversion`, `unicorn/prefer-iterator-zip` and `unicorn/prefer-dispose`, whose fixes and suggestions write `Temporal`, `Iterator.zip` and `using`, which Node.js 22, still in `engines.node`, lacks. `no-restricted-properties`, `no-restricted-globals` and `no-restricted-syntax` now also report a hand-written `Uint8Array.fromHex`, `#toHex`, `#setFromHex`, `#setFromBase64`, `Iterator.concat`, `Iterator.zip`, `Temporal` and `using` declaration. Each entry of the gated tables names its rules, and a test holds them off while the entry stands.

`eslintConfigForNodeJs(files, { nodeMajor })` lifts the gate for files that run only on a known Node.js, such as a repository's own scripts: what that runtime has is allowed, and what it lacks is still reported. `nodeVersionGateAt(nodeMajor)` gives the three rules' options for it.

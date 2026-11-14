# synstate-router-preact

## 0.2.0

### Minor Changes

- a6d03ea: Require `synstate` 9 as a peer (and, for synstate-dom and blueprint-synstate, `ts-data-forge` 15). Its `Optional` is unwrapped at runtime (a `Some` is the value it holds), and these packages read the snapshots of observables through `Optional.unwrap`, which would misread the `{ $$tag, value }` object an earlier synstate returns. The peer ranges move with this release (`changeset version` raises the `>=` peer range of a released dependent to the dependency's new version). In synstate-dom, avoid giving `MatchOptional` a constant `Optional.some(observable$)`: a `Some` is its value at runtime, so it is read as `observable$` itself.

### Patch Changes

- Updated dependencies [87ceb32]
- Updated dependencies [7fa7901]
- Updated dependencies [7ee8301]
- Updated dependencies [2f758a4]
- Updated dependencies [ae57625]
- Updated dependencies [b6ab6dd]
- Updated dependencies [e9340d0]
- Updated dependencies [a6d03ea]
- Updated dependencies [a6d03ea]
- Updated dependencies [e7b459f]
- Updated dependencies [c35b889]
- Updated dependencies [88eb8ce]
- Updated dependencies [430b433]
- Updated dependencies [553a883]
- Updated dependencies [a34ddd2]
- Updated dependencies [a9163fe]
- Updated dependencies [6722a9e]
- Updated dependencies [6c7a0d3]
- Updated dependencies [593ca51]
- Updated dependencies [dcf7544]
- Updated dependencies [d5640ce]
- Updated dependencies [40645fa]
- Updated dependencies [0b9642c]
- Updated dependencies [323fb7e]
    - synstate-router@0.4.0
    - ts-type-forge@9.2.6
    - ts-data-forge@15.0.0
    - synstate@9.0.0

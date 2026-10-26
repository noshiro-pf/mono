# eslint-plugin-synstate

## 0.2.1

### Patch Changes

- ca74a91: Update dependencies
- Updated dependencies [ca74a91]
    - eslint-rule-forge@0.3.1

## 0.2.0

### Minor Changes

- 69956bd: Add `no-write-during-propagation`, enabled at `error` by the `recommended` preset. It reports a write to a synstate state or source (a `createState` setter, `updateState`, `resetState`, a `createReducer` dispatch, the `createBooleanState` utilities, an emitter, `next` of a `source()`) made directly in a subscriber or in a projection inside `.pipe(...)`. Such a write starts an update inside the one that called it, so it is not part of the graph synstate orders: subscribers can see intermediate states, and a write back into the same update loops. Derive the value with `pipe` instead. A subscriber passed by name and a function of the same file that the callback calls are followed too, and with type information (`parserOptions.projectService`) so is a setter imported from another file.

## 0.1.2

### Patch Changes

- Updated dependencies [384b952]
    - eslint-rule-forge@0.3.0

## 0.1.1

### Patch Changes

- Updated dependencies [fba7527]
    - eslint-rule-forge@0.2.0

# synstate-dom

## 0.2.0

### Minor Changes

- 5139149: `For` makes a row's `index$` only when `children` declares a second parameter, as Solid's `For` does, so a row that does not take its position creates and updates one node fewer. A `children` that reads the index through a rest parameter or `arguments` is now given `undefined`. An update that keeps every key in its place skips the reordering, and one that keeps no key removes the old rows' nodes in one `Range` instead of one by one.

### Patch Changes

- Updated dependencies [5e9b2c6]
    - synstate@5.0.1
    - ts-data-forge@14.10.0

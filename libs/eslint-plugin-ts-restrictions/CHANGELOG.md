# eslint-plugin-ts-restrictions

## 1.0.5

### Patch Changes

- 290de0c: `no-unnecessary-array-from` no longer fixes away the `Array.from()` copy before
  a method that calls back once per element (`forEach`, `map`, `filter`, `find`,
  `some`, `every`, `reduce`, …), returns an iterator (`values`, `keys`,
  `entries`) or turns each element into a string (`join`, `toString`,
  `toLocaleString`), nor before an argument that may have an effect: there the
  copy can be a snapshot that code run meanwhile changes, such as a listener list
  whose listeners remove themselves, and `--fix` made the loop skip elements.
  Removing it is offered as a suggestion instead. The methods that read the array
  before any such code runs (`toSorted`, `includes`, `at`, `slice`, …) are still
  fixed, and the message no longer says that `forEach` returns a new array.
- 7ead3ad: `prefer-non-mutating-array-method` no longer rewrites `Array.from(xs).splice(…)`
  to `xs.toSpliced(…)`: `splice` returns the elements it removed and `toSpliced`
  the array without them, so `--fix` replaced one list with the other. It rewrites
  to `slice` instead where that returns the same elements:
  `Array.from(xs).splice(s)` becomes `xs.slice(s)`, and
  `Array.from(xs).splice(s, c)` with non-negative integer literals becomes
  `xs.slice(s, s + c)`. Any other `splice` on a copy (inserted items, a negative
  start with a count, a count that is not a literal) is left alone; `reverse`,
  `sort` and `fill` are rewritten as before.
- Updated dependencies [8c46d7d]
- Updated dependencies [eb9be0c]
    - eslint-rule-forge@0.13.0
    - ts-data-forge@15.1.1

## 1.0.4

### Patch Changes

- Updated dependencies [f785bd5]
    - eslint-rule-forge@0.12.0

## 1.0.3

### Patch Changes

- b494544: Publish through npm trusted publishing for the first time. Nothing in the packages changes.
- Updated dependencies [e68e601]
- Updated dependencies [6f38584]
- Updated dependencies [38a2075]
- Updated dependencies [d92c572]
- Updated dependencies [6790e63]
- Updated dependencies [e6a4dac]
- Updated dependencies [745a60e]
- Updated dependencies [8f59370]
- Updated dependencies [e45e274]
- Updated dependencies [7f9658b]
    - ts-data-forge@15.0.1

## 1.0.2

### Patch Changes

- Updated dependencies [3b80d7c]
- Updated dependencies [82d252e]
- Updated dependencies [eb39008]
    - eslint-rule-forge@0.11.0
    - ts-type-forge@9.2.7

## 1.0.1

### Patch Changes

- Updated dependencies [1e5abc2]
- Updated dependencies [2f758a4]
- Updated dependencies [ae57625]
- Updated dependencies [47af2c3]
- Updated dependencies [e9340d0]
- Updated dependencies [a6d03ea]
- Updated dependencies [e7b459f]
- Updated dependencies [d3a20c8]
- Updated dependencies [d5640ce]
- Updated dependencies [40645fa]
- Updated dependencies [b1aa42c]
    - eslint-rule-forge@0.10.0
    - ts-type-forge@9.2.6
    - ts-data-forge@15.0.0

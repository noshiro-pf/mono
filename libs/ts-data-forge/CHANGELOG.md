# [3.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v2.1.3...v3.0.0) (2025-07-15)

### Bug Fixes

- **breaking:** change unknownToString to return string instead of Result<string, Error> ([#76](https://github.com/noshiro-pf/ts-data-forge/issues/76)) ([466497f](https://github.com/noshiro-pf/ts-data-forge/commit/466497f9edf4f38d7267ea4a462467d90fedb8d7))

## [2.1.3](https://github.com/noshiro-pf/ts-data-forge/compare/v2.1.2...v2.1.3) (2025-07-15)

### Bug Fixes

- fix circular imports ([#75](https://github.com/noshiro-pf/ts-data-forge/issues/75)) ([d179eca](https://github.com/noshiro-pf/ts-data-forge/commit/d179eca10d6903f292c857f0671ff66a657d8a0d))

## [2.1.2](https://github.com/noshiro-pf/ts-data-forge/compare/v2.1.1...v2.1.2) (2025-07-15)

### Bug Fixes

- add eslint rules and fix errors ([#73](https://github.com/noshiro-pf/ts-data-forge/issues/73)) ([4c87ae0](https://github.com/noshiro-pf/ts-data-forge/commit/4c87ae0e1f67416da7eefb7019724fc145471ea2))

## [2.1.1](https://github.com/noshiro-pf/ts-data-forge/compare/v2.1.0...v2.1.1) (2025-07-15)

### Bug Fixes

- fix package.json ([#74](https://github.com/noshiro-pf/ts-data-forge/issues/74)) ([dfb261d](https://github.com/noshiro-pf/ts-data-forge/commit/dfb261dafa35449000b5af2192dbed1231044e55))

# [2.1.0](https://github.com/noshiro-pf/ts-data-forge/compare/v2.0.3...v2.1.0) (2025-07-15)

### Features

- add overload to range iterator utility ([#72](https://github.com/noshiro-pf/ts-data-forge/issues/72)) ([ebd25cf](https://github.com/noshiro-pf/ts-data-forge/commit/ebd25cf4ad097c93b90de2b9e35af35a32b1b3de))

## [2.0.3](https://github.com/noshiro-pf/ts-data-forge/compare/v2.0.2...v2.0.3) (2025-07-15)

### Bug Fixes

- add entry-point.mts ([#71](https://github.com/noshiro-pf/ts-data-forge/issues/71)) ([1ec8e53](https://github.com/noshiro-pf/ts-data-forge/commit/1ec8e53ffa1a42fe84f550628a5ac157fc2b50b6))

## [2.0.2](https://github.com/noshiro-pf/ts-data-forge/compare/v2.0.1...v2.0.2) (2025-07-09)

### Bug Fixes

- use ReadonlyRecord in the return type of Obj.fromEntries ([#64](https://github.com/noshiro-pf/ts-data-forge/issues/64)) ([2760559](https://github.com/noshiro-pf/ts-data-forge/commit/276055949ca19f554265b452c6c5057dd16897d4))

## [2.0.1](https://github.com/noshiro-pf/ts-data-forge/compare/v2.0.0...v2.0.1) (2025-07-09)

### Bug Fixes

- fix type annotation of pipe ([#63](https://github.com/noshiro-pf/ts-data-forge/issues/63)) ([1babcff](https://github.com/noshiro-pf/ts-data-forge/commit/1babcffc5820aab5df8523fb29306b9702038978))

# [2.0.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.5.2...v2.0.0) (2025-07-07)

### Features

- improve typing of Arr functions ([#61](https://github.com/noshiro-pf/ts-data-forge/issues/61)) ([3828c77](https://github.com/noshiro-pf/ts-data-forge/commit/3828c77e169a89e3908ffcbacfc01ce85f6f63d3))

### BREAKING CHANGES

- Tpl is removed and merged into Arr.

* The following functions have been added to `Arr`:
    - `set`
    - `findLast`
    - `findLastIndex`
    - `every`
    - `some`
    - `map`
    - `filter`
    - `flat`
    - `flatMap`
    - `toReversed`
    - `toSorted`
    - Iterators
        - `entries`
        - `values`
        - `indices`
        - `keys` (an alias for `indices`)

## [1.5.2](https://github.com/noshiro-pf/ts-data-forge/compare/v1.5.1...v1.5.2) (2025-07-05)

### Bug Fixes

- use named function style to implement function overloading ([#59](https://github.com/noshiro-pf/ts-data-forge/issues/59)) ([5df1a35](https://github.com/noshiro-pf/ts-data-forge/commit/5df1a35ecf3caf452eb9ee14cbd6ae4d843127a1))

## [1.5.1](https://github.com/noshiro-pf/ts-data-forge/compare/v1.5.0...v1.5.1) (2025-07-04)

### Bug Fixes

- reduce JSDoc examples ([#48](https://github.com/noshiro-pf/ts-data-forge/issues/48)) ([9a8b301](https://github.com/noshiro-pf/ts-data-forge/commit/9a8b3017525ee75760eb9f0e86b488688451eb57))

# [1.5.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.4.0...v1.5.0) (2025-07-04)

### Features

- use NonZeroNumber in divInt divisor ([#47](https://github.com/noshiro-pf/ts-data-forge/issues/47)) ([b1fc2db](https://github.com/noshiro-pf/ts-data-forge/commit/b1fc2db061b911d6ec94565c2af59a66a327a9ef))

# [1.4.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.3.0...v1.4.0) (2025-07-04)

### Features

- add Arr.generate ([#46](https://github.com/noshiro-pf/ts-data-forge/issues/46)) ([49b5db0](https://github.com/noshiro-pf/ts-data-forge/commit/49b5db0d22d5b295293021a3373f98fd4b4cee6f))

# [1.3.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.2.0...v1.3.0) (2025-07-04)

### Features

- add createPromise function ([#44](https://github.com/noshiro-pf/ts-data-forge/issues/44)) ([ff5bf16](https://github.com/noshiro-pf/ts-data-forge/commit/ff5bf167dbf2eba36c7bd6261b039bca5a5f4ce3))

# [1.2.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.1.0...v1.2.0) (2025-06-25)

### Features

- make range argument optional for branded numeric random function ([#33](https://github.com/noshiro-pf/ts-data-forge/issues/33)) ([7d6ce59](https://github.com/noshiro-pf/ts-data-forge/commit/7d6ce596a062916ba4ddd65d299ea2299b264dda))

# [1.1.0](https://github.com/noshiro-pf/ts-data-forge/compare/v1.0.2...v1.1.0) (2025-06-23)

### Features

- use string literal for object tag ([#27](https://github.com/noshiro-pf/ts-data-forge/issues/27)) ([8c6f0a6](https://github.com/noshiro-pf/ts-data-forge/commit/8c6f0a6772b5cf185f8d09633039683f2789bf06))

## [1.0.2](https://github.com/noshiro-pf/ts-data-forge/compare/v1.0.1...v1.0.2) (2025-06-22)

### Bug Fixes

- bump ts-type-forge from 2.0.2 to 2.0.3 ([#18](https://github.com/noshiro-pf/ts-data-forge/issues/18)) ([e494268](https://github.com/noshiro-pf/ts-data-forge/commit/e494268cf6bb4b1c82595afbb61bcd33bb5f132b))

### Reverts

- Revert "chore: bump @rollup/plugin-typescript from 12.1.2 to 12.1.3 ([#16](https://github.com/noshiro-pf/ts-data-forge/issues/16))" ([#23](https://github.com/noshiro-pf/ts-data-forge/issues/23)) ([ca05578](https://github.com/noshiro-pf/ts-data-forge/commit/ca055785cd9be069b6e03135dd689caae621f63a))

## [1.0.1](https://github.com/noshiro-pf/ts-data-forge/compare/v1.0.0...v1.0.1) (2025-06-22)

### Bug Fixes

- fix devDependencies ([#12](https://github.com/noshiro-pf/ts-data-forge/issues/12)) ([cc14518](https://github.com/noshiro-pf/ts-data-forge/commit/cc1451840317becbdfd11bb14c457383a1bbe3f9))
- fix release workflow ([#11](https://github.com/noshiro-pf/ts-data-forge/issues/11)) ([33fc277](https://github.com/noshiro-pf/ts-data-forge/commit/33fc277707b35cdf488386448c3060f68f8a2726))

# 1.0.0 (2025-06-15)

### Features

- initialize ts-data-forge source ([#1](https://github.com/noshiro-pf/ts-data-forge/issues/1)) ([4764a8d](https://github.com/noshiro-pf/ts-data-forge/commit/4764a8d52cd8b3cff68d4e95a493ce04fcf3ac26))

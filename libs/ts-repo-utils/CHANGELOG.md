# [2.0.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.2.1...v2.0.0) (2025-06-22)

### Features

- use Result pattern ([#21](https://github.com/noshiro-pf/ts-repo-utils/issues/21)) ([9388086](https://github.com/noshiro-pf/ts-repo-utils/commit/938808681f2d88f976b5b73b812f15cabfeecf06))

### BREAKING CHANGES

-   - Removed ExecResult type and changed the return type of `$`

* Renamed `formatChanged` to `formatUntracked`.
* Removed default argument `"main"` for `formatDiffFrom`.
* Add diff function to get the diff of a file or directory.

## [1.2.1](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.2.0...v1.2.1) (2025-06-22)

### Reverts

- Revert "chore: bump @rollup/plugin-typescript from 12.1.2 to 12.1.3 ([#11](https://github.com/noshiro-pf/ts-repo-utils/issues/11))" ([#19](https://github.com/noshiro-pf/ts-repo-utils/issues/19)) ([a364e06](https://github.com/noshiro-pf/ts-repo-utils/commit/a364e06f6ecda256c4181058e277f37326af8597))

# [1.2.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.1.0...v1.2.0) (2025-06-16)

### Features

- fix globals and gen index implementations ([#7](https://github.com/noshiro-pf/ts-repo-utils/issues/7)) ([fe666cf](https://github.com/noshiro-pf/ts-repo-utils/commit/fe666cf2e063588e1f8832fdf312e6302c220947))

# [1.1.0](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.0.1...v1.1.0) (2025-06-16)

### Features

- exit with code 1 on error ([#6](https://github.com/noshiro-pf/ts-repo-utils/issues/6)) ([4493a1a](https://github.com/noshiro-pf/ts-repo-utils/commit/4493a1ad2d8ed25ad1e36e13cebcc2fa1a49aa8b))

## [1.0.1](https://github.com/noshiro-pf/ts-repo-utils/compare/v1.0.0...v1.0.1) (2025-06-16)

### Bug Fixes

- fix release workflow and README ([#5](https://github.com/noshiro-pf/ts-repo-utils/issues/5)) ([1cb6b29](https://github.com/noshiro-pf/ts-repo-utils/commit/1cb6b2978104f7145db65bcb10df37ebaff17731))

# 1.0.0 (2025-06-16)

### Features

- add repo utilities ([#4](https://github.com/noshiro-pf/ts-repo-utils/issues/4)) ([e276ec0](https://github.com/noshiro-pf/ts-repo-utils/commit/e276ec094efc7ca5a10b925e06314c239868c03e))
